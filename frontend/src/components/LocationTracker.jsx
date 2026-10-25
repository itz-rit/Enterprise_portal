import React, { useEffect, useState, useRef } from 'react';
import socketService from '../services/socketService';
import { useStaffAuth } from '../context/StaffAuthContext';
import axios from 'axios';
import { getApiUrl } from '../config/api';

/**
 * Global Background Component to track live GPS position.
 * Restricted to STAFF ONLY. Admins are tracked manually via the StaffTracking page.
 */
const LocationTracker = () => {
    // Only track if logged in as staff
    const { staffUser, token } = useStaffAuth();
    
    const [permissionError, setPermissionError] = useState(null);
    const lastSyncRef = useRef(0);
    const watchIdRef = useRef(null);

    const refreshIntervalRef = useRef(null);


    useEffect(() => {
        if (!staffUser || !token) {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
            return;
        }

        if (!navigator.geolocation) {
            setPermissionError('Geolocation is not supported by your browser.');
            return;
        }

        console.log(`📡 Initializing Staff Tracker for ${staffUser.name}`);
        socketService.connect();

        const handleSuccess = async (position) => {
            const { latitude, longitude } = position.coords;
            const timestamp = new Date().toISOString();

            socketService.emitLocationUpdate(
                staffUser._id,
                latitude,
                longitude
            );

            const now = Date.now();
            if (now - lastSyncRef.current > 30000) {
                try {
                    await axios.post(getApiUrl('/api/v1/location'), {
                        latitude,
                        longitude,
                        timestamp
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    lastSyncRef.current = now;
                    console.log('✅ Staff location persisted to DB');
                } catch (err) {
                    console.error('❌ Failed to persist staff location', err);
                }
            }
        };

        const handleError = (error) => {
            let msg = 'Unknown location error';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    msg = 'Location permission denied. Please enable GPS for tracking.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    msg = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    msg = 'The request to get user location timed out.';
                    break;
            }
            setPermissionError(msg);
            console.error('📍 GPS Error:', msg);
        };

        const options = { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 };

        // 1. Initial Fix
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

        // 2. Continuous Watch
        watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

        // 3. 5-Minute Hard Refresh
        refreshIntervalRef.current = setInterval(() => {
            console.log('🔄 Staff Tracker: 5-Min GPS Hard Refresh...');
            navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
        }, 300000);

        return () => {
            if (watchIdRef.current !== null) {
                console.log('🛑 Stopping Staff Tracker Watcher');
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
            if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
        };
    }, [staffUser, token]);

    if (permissionError) {
        return (
            <div className="fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:w-80 animate-bounce">
                <div className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl border border-red-500 flex flex-col gap-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">GPS CRITICAL ERROR</p>
                    <p className="text-[11px] font-black leading-tight uppercase">{permissionError}</p>
                </div>
            </div>
        );
    }

    return null; 
};

export default LocationTracker;
