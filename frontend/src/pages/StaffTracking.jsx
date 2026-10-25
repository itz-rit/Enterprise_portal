import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, LayersControl } from 'react-leaflet';
const { BaseLayer } = LayersControl;
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { Navigation, Search, AlertTriangle } from 'lucide-react';
import socketService from '../services/socketService';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import { useAuth } from '../context/AuthContext';

// ──────────────────────────────
// Leaflet icon fix
// ──────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const staffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const adminIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 48], 
  iconAnchor: [15, 48], // Precisely at the bottom tip
  popupAnchor: [0, -45], 
  shadowSize: [41, 41]
});

// ──────────────────────────────
// Safe FlyTo Component
// ──────────────────────────────
const SafeFlyTo = ({ lat, lng, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (!lat || !lng) return;
    map.flyTo([lat, lng], zoom || 14, { animate: true, duration: 1.2 });
  }, [lat, lng, zoom, map]);
  return null;
};

// ──────────────────────────────
// Auto-Focus Component (Fits map to all active staff)
// ──────────────────────────────
const MapBounds = ({ locations }) => {
  const map = useMap();
  useEffect(() => {
    // 1. Data Guard: Return if no locations exist
    if (!locations || locations.length === 0) return;
    
    // 2. Numeric Guard: Filter out any items where lat/lng aren't valid numbers
    const validLocs = locations.filter(loc => 
      typeof loc.lat === 'number' && typeof loc.lng === 'number' && 
      !isNaN(loc.lat) && !isNaN(loc.lng)
    );
    if (validLocs.length === 0) return;

    try {
      const bounds = L.latLngBounds(validLocs.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } catch (e) {
      console.warn('📍 MapBounds: Failed to fit bounds - invalid Leaflet input.', e);
    }
  }, [locations, map]);
  return null;
};

// ──────────────────────────────
// Haversine distance
// ──────────────────────────────
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const d = R * 2 * Math.asin(Math.sqrt(a));
  
  if (d < 1) {
    const meters = Math.round(d * 1000);
    return `${meters} m`;
  }
  return `${d.toFixed(2)} km`;
};

// India center — neutral, miles away from Coimbatore
const INDIA_CENTER = [20.5937, 78.9629];

// ──────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────
const StaffTracking = () => {
  const { user } = useAuth();
  const token = user?.token;

  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [historyLine, setHistoryLine] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminGps, setAdminGps] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('idle'); 
  const [flyTarget, setFlyTarget] = useState(null);

  const mapRef = useRef();
  const watchIdRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // ── REFS FOR SOCKET PERSISTENCE ────────────────
  const selectedStaffRef = useRef(selectedStaff);
  useEffect(() => { selectedStaffRef.current = selectedStaff; }, [selectedStaff]);

  // ── SOCKET + FETCH (STABLE) ───────────────────────
  useEffect(() => {
    if (!token) return;
    
    document.title = "Staff Tracking | Pradeep Enterprises";
    fetchLocations();
    socketService.connect();

    socketService.onLocationUpdated((data) => {
      // 1. Guard against bad data
      if (!data.employeeId || !data.latitude || !data.longitude) return;

      // 3. Update main list
      setStaffList(prev => prev.map(s =>
        s._id === data.employeeId
          ? { ...s, location: { lat: data.latitude, lng: data.longitude }, updatedAt: data.timestamp || new Date().toISOString() }
          : s
      ));

      // 4. Update history if currently tracked
      if (selectedStaffRef.current?._id === data.employeeId) {
        setHistoryLine(prev => [...prev, [data.latitude, data.longitude]]);
      }
    });

    return () => {
      socketService.offLocationUpdated();
      socketService.disconnect();
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [token]); // ONLY re-run on logout/login

  const fetchLocations = async () => {
    try {
      const res = await axios.get(getApiUrl('/api/v1/location/staff'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('🗄️ DB LOCATION API RESPONSE:', res.data);
      setStaffList(res.data);
    } catch (err) {
      console.error('Fetch locations failed:', err);
    }
  };


  const handleStaffSelect = async (staff) => {
    setSelectedStaff(staff);
    try {
      const res = await axios.get(getApiUrl(`/api/v1/location/history/${staff._id}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const coords = res.data.map(l => [l.latitude, l.longitude]);
      setHistoryLine(coords);

      if (staff.location?.lat) {
        console.log('📌 Flying to selected staff:', staff.location.lat, staff.location.lng);
        setFlyTarget({ lat: staff.location.lat, lng: staff.location.lng, zoom: 15 });
      }
    } catch (err) {
      console.error('History fetch failed:', err);
    }
  };

  // ── ADMIN GPS BUTTON ─────────────────────
  const activateAdminGps = useCallback(() => {
    // Clear any existing tracking first
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);

    setGpsStatus('searching');

    if (!navigator.geolocation) {
      setGpsStatus('denied');
      alert('Geolocation is not supported by this browser.');
      return;
    }

    const handleSuccess = (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      console.log('📍 ADMIN GPS UPDATE:', lat, lng);

      setAdminGps({ lat, lng, lastUpdate: new Date() });
      setGpsStatus('active');
      
      // Auto-focus on first fix
      if (gpsStatus !== 'active') {
        setFlyTarget({ lat, lng, zoom: 15 });
      }

      // Also persist to DB so staff can see admin distance accurately
      axios.post(getApiUrl('/api/v1/location/save'), {
        latitude: lat,
        longitude: lng,
        timestamp: new Date().toISOString()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => console.error('Failed to save admin location:', err));
    };

    const handleError = (err) => {
      console.error('GPS Error:', err.code, err.message);
      setGpsStatus('denied');
    };

    const options = { 
      enableHighAccuracy: true, 
      timeout: 10000, 
      maximumAge: 0 
    };

    // 1. Initial Fix
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

    // 2. Continuous Watch
    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    // 3. 5-Minute Force Refresh (as requested)
    refreshIntervalRef.current = setInterval(() => {
      console.log('🔄 5-Min GPS Hard Refresh triggered...');
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
    }, 300000); // 300,000ms = 5 minutes

  }, [gpsStatus, token]);

  // ── COMPUTED ─────────────────────────────
  const distanceToSelected =
    adminGps && selectedStaff?.location?.lat
      ? haversine(adminGps.lat, adminGps.lng, selectedStaff.location.lat, selectedStaff.location.lng)
      : null;

  const fieldStaff = staffList.filter(s => s.role !== 'Admin');
  const filteredStaff = fieldStaff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.area?.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const onlineCount = fieldStaff.filter(s => s.location?.lat).length;

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-2rem)] flex flex-col md:flex-row gap-4 p-4 md:p-6 bg-slate-50">

      {/* LEFT SIDEBAR */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full md:w-80 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0 h-[50%] md:h-full"
      >
        <div className="p-4 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Navigation size={18} /></div>
            <div>
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-wide">Live Command Hub</h2>
              <p className="text-xs font-bold text-slate-400 uppercase">Field Operations</p>
            </div>
          </div>


          {/* === ADMIN GPS ACTIVATION BUTTON === */}
          <button
            onClick={activateAdminGps}
            disabled={gpsStatus === 'searching'}
            className={`w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              gpsStatus === 'active'   ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
              gpsStatus === 'denied'   ? 'bg-amber-500 text-white hover:bg-amber-600' :
              gpsStatus === 'searching'? 'bg-slate-400 text-white cursor-wait' :
                                         'bg-red-600 text-white hover:bg-red-700 animate-pulse'
            }`}
          >
            <Navigation size={14} className={gpsStatus === 'searching' ? 'animate-spin' : ''} />
            {gpsStatus === 'searching'  && 'Getting Your GPS...'}
            {gpsStatus === 'active'     && '📍 Admin GPS Active — Refocus'}
            {gpsStatus === 'denied'     && '⚠️ GPS Denied — Retry'}
            {gpsStatus === 'idle'       && '🔴 Activate Admin GPS Location'}
          </button>

          {gpsStatus === 'active' && adminGps && (
            <p className="text-[9px] font-bold text-emerald-600 text-center mt-2 uppercase tracking-widest">
              ✅ {adminGps.lat.toFixed(5)}°N, {adminGps.lng.toFixed(5)}°E
            </p>
          )}
          {gpsStatus === 'denied' && (
            <p className="text-[9px] font-bold text-amber-600 text-center mt-2">
              ⚠️ Allow location in browser settings, then retry
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="p-4 grid grid-cols-2 gap-3 border-b border-slate-50">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Online</p>
            <p className="text-xl font-black text-slate-800">{onlineCount} <span className="text-[10px] text-emerald-500">Live</span></p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Total</p>
            <p className="text-xl font-black text-slate-800">{fieldStaff.length} <span className="text-[10px] text-slate-400">Enrolled</span></p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col relative p-4">
           <div className="flex flex-col h-full space-y-4">
              {/* Search */}
              <div className="relative shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Filter staff or area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 text-[11px] font-bold text-slate-700 placeholder-slate-400 rounded-lg pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Staff List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredStaff.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-8 font-bold uppercase tracking-widest">No staff tracked</p>
                )}
                {filteredStaff.map((staff) => {
                  const hasLoc = !!staff.location?.lat;
                  const isSelected = selectedStaff?._id === staff._id;
                  const dist = isSelected && distanceToSelected ? distanceToSelected : null;
                  
                  // Inactivity Detection
                  const lastUpdate = staff.location?.updatedAt || staff.location?.timestamp;
                  const dateObj = lastUpdate ? new Date(lastUpdate) : null;
                  const isValidDate = dateObj && !isNaN(dateObj.getTime());
                  const isInactive = hasLoc && isValidDate && (new Date() - dateObj) > 120000;
                  const timeAgo = isValidDate ? Math.round((new Date() - dateObj) / 60000) : null;

                  return (
                    <div
                      key={staff._id}
                      onClick={() => hasLoc && handleStaffSelect(staff)}
                      className={`p-3 rounded-xl border transition-all ${
                        isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' :
                        hasLoc     ? 'bg-white border-slate-100 hover:border-blue-100 cursor-pointer shadow-sm' :
                                     'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${isInactive ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'}`}>
                            {staff.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className={`text-xs font-black leading-tight ${isInactive ? 'text-slate-500' : 'text-slate-800'}`}>{staff.name}</h3>
                              {isInactive && <span className="bg-slate-100 text-slate-400 text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full border border-slate-200">Inactive</span>}
                            </div>
                            <p className="text-[9px] text-slate-400 uppercase tracking-tighter">
                              {isInactive && timeAgo !== null ? `Last seen ${timeAgo} mins ago` : (staff.area || 'Field Unit')}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`w-2 h-2 rounded-full ${hasLoc ? (isInactive ? 'bg-slate-300' : 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]') : 'bg-slate-300'}`} />
                          {dist && <span className="text-[8px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{dist}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>
      </motion.div>

      {/* RIGHT MAP PANEL */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative z-0"
      >
        {gpsStatus === 'denied' && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 shadow-2xl border border-amber-200 max-w-sm text-center mx-4">
              <AlertTriangle className="text-amber-500 mx-auto mb-3" size={40} />
              <h3 className="font-black text-slate-900 text-base uppercase mb-2">Location Access Required</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                GPS was denied or returned an IP-based location. Allow precise location in your browser and click retry.
              </p>
              <button onClick={activateAdminGps} className="w-full py-2 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700">
                Retry GPS
              </button>
            </div>
          </div>
        )}

        {/* Map starts at India center — NO Coimbatore */}
        <MapContainer
          center={INDIA_CENTER}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="Street View">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            </BaseLayer>
            <BaseLayer name="Satellite View">
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            </BaseLayer>
          </LayersControl>

          {/* Auto bounds + flyTo */}
          {!selectedStaff && <MapBounds locations={fieldStaff.filter(s => s.location?.lat).map(s => s.location)} />}
          {flyTarget && <SafeFlyTo lat={flyTarget.lat} lng={flyTarget.lng} zoom={flyTarget.zoom} />}

          {/* Admin marker — ONLY when GPS button activated */}
          {adminGps && (
            <Marker position={[adminGps.lat, adminGps.lng]} icon={adminIcon}>
              <Popup>
                <div className="p-2 text-center">
                  <p className="font-black text-red-600 text-sm">Admin HQ</p>
                  <p className="text-[10px] text-slate-400 mt-1">Your real GPS location</p>
                  <p className="text-[9px] text-slate-500">{adminGps.lat.toFixed(5)}, {adminGps.lng.toFixed(5)}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Admin → Staff line — ONLY when both are real */}
          {adminGps && selectedStaff?.location?.lat && (
            <Polyline
              positions={[[adminGps.lat, adminGps.lng], [selectedStaff.location.lat, selectedStaff.location.lng]]}
              color="#3b82f6" weight={2.5} dashArray="10, 8" opacity={0.85}
            />
          )}

          {historyLine.length > 0 && (
            <Polyline positions={historyLine} color="#2563eb" weight={2} dashArray="5, 5" />
          )}

          {/* Staff markers */}
          {filteredStaff.filter(s => s.location?.lat).map(staff => (
            <Marker
              key={staff._id}
              position={[staff.location.lat, staff.location.lng]}
              icon={staffIcon}
              eventHandlers={{ click: () => handleStaffSelect(staff) }}
            >
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="font-black text-slate-900 text-sm uppercase">{staff.name}</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase mb-2">{staff.area || 'Field Duty'}</p>
                  {distanceToSelected && selectedStaff?._id === staff._id && (
                    <div className="bg-blue-50 rounded-lg px-3 py-1.5 text-center">
                      <p className="text-[9px] font-bold text-blue-500 uppercase">Distance from Admin</p>
                      <p className="text-sm font-black text-blue-700">{distanceToSelected}</p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Tracking bar (top left) */}
        {selectedStaff && (
          <div className="absolute top-4 left-4 z-[400]">
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-600 text-white shadow-xl px-4 py-3 rounded-2xl border border-blue-400 min-w-[200px]"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase opacity-70">Tracking</span>
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              </div>
              <h3 className="text-sm font-black uppercase truncate">{selectedStaff.name}</h3>
              {distanceToSelected ? (
                <div className="mt-2 pt-2 border-t border-blue-500/50 flex items-center justify-between gap-4">
                  <span className="text-[9px] font-bold uppercase opacity-70">Distance</span>
                  <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-lg">{distanceToSelected}</span>
                </div>
              ) : !adminGps ? (
                <p className="text-[9px] opacity-60 mt-1">Activate Admin GPS for distance</p>
              ) : null}
            </motion.div>
          </div>
        )}

        {/* Controls (top right) */}
        <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 items-end">
          <button
            onClick={() => { setSelectedStaff(null); setHistoryLine([]); setFlyTarget(null); }}
            className="bg-white rounded-xl shadow-lg border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 py-2 hover:bg-slate-50 transition-all"
          >
            Show All
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default StaffTracking;
