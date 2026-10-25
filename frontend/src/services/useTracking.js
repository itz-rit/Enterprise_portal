import { useEffect, useRef } from 'react';
import socketService from './socketService';
import { useStaffAuth } from '../context/StaffAuthContext';

const useTracking = () => {
  const { staffUser, api } = useStaffAuth();
  const watchIdRef = useRef(null);

  useEffect(() => {
    let active = false;

    const checkAttendanceAndStart = async () => {
      try {
        // Just directly check if they marked attendance today. You might have an endpoint for this.
        // For simplicity, we assume if they are logged in as staff, we should start tracking *if* they marked attendance.
        // Let's do a quick get to see their today's attendance.
        const { data } = await api('get', '/api/staff/attendance');
        const todayDone = data.some(
          (entry) => new Date(entry.createdAt).toDateString() === new Date().toDateString()
        );

        if (todayDone) {
          active = true;
          socketService.connect();
          
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              if (active) {
                // Emit to socket
                socketService.emitLocationUpdate(
                  staffUser._id || staffUser.employeeId,
                  pos.coords.latitude,
                  pos.coords.longitude
                );
                
                // Also save via HTTP just in case, but socket is faster for real-time
                api('post', '/api/v1/location', {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude
                }).catch(e => console.error(e));
              }
            },
            (err) => {
              console.error('Tracking error:', err);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 5000,
            }
          );
        }
      } catch (err) {
        console.error('Failed to init tracking:', err);
      }
    };

    if (staffUser) {
      checkAttendanceAndStart();
    }

    return () => {
      active = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      socketService.disconnect();
    };
  }, [staffUser, api]);

  return null;
};

export default useTracking;
