import { useEffect, useCallback, useRef } from 'react';
import { SESSION_CONFIG } from '@/lib/session-config';

const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'focus',
  'input',
  'change',
  'submit',
];

export function useUserActivity() {
  const lastActivityRef = useRef<number>(Date.now());
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Actualizar la cookie de última actividad
    if (typeof document !== 'undefined') {
      const maxAgeInSeconds = Math.floor(
        SESSION_CONFIG.INACTIVITY_TIMEOUT / 1000
      );
      document.cookie = `last-activity=${Date.now()}; path=/; max-age=${maxAgeInSeconds}`;
    }
  }, []);

  const resetActivityTimeout = useCallback(() => {
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    // Actualizar actividad inicial
    updateLastActivity();

    // Agregar event listeners para detectar actividad
    const handleActivity = () => {
      updateLastActivity();
      resetActivityTimeout();
    };

    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      resetActivityTimeout();
    };
  }, [updateLastActivity, resetActivityTimeout]);

  const getLastActivity = useCallback(() => {
    return lastActivityRef.current;
  }, []);

  const getTimeSinceLastActivity = useCallback(() => {
    return Date.now() - lastActivityRef.current;
  }, []);

  return {
    getLastActivity,
    getTimeSinceLastActivity,
    updateLastActivity,
    resetActivityTimeout,
  };
}
