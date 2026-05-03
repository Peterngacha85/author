import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackVisit } from '../api/tracker';

const TrafficTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackVisit();
  }, [location.pathname]);

  return null;
};

export default TrafficTracker;
