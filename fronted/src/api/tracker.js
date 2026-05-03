import axios from './axios';

const SESSION_KEY = 'author_traffic_session';

const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  if (ua.indexOf("Firefox") > -1) browser = "Firefox";
  else if (ua.indexOf("SamsungBrowser") > -1) browser = "Samsung Browser";
  else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera";
  else if (ua.indexOf("Trident") > -1) browser = "Internet Explorer";
  else if (ua.indexOf("Edge") > -1) browser = "Edge";
  else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
  else if (ua.indexOf("Safari") > -1) browser = "Safari";
  return browser;
};

const getOSInfo = () => {
  const ua = navigator.userAgent;
  let os = "Unknown";
  if (ua.indexOf("Win") > -1) os = "Windows";
  else if (ua.indexOf("Mac") > -1) os = "MacOS";
  else if (ua.indexOf("X11") > -1) os = "UNIX";
  else if (ua.indexOf("Linux") > -1) os = "Linux";
  else if (ua.indexOf("Android") > -1) os = "Android";
  else if (ua.indexOf("iPhone") > -1) os = "iOS";
  return os;
};

const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) return "Mobile";
  return "Desktop";
};

export const trackVisit = async () => {
  try {
    const data = {
      path: window.location.pathname,
      referrer: document.referrer || 'Direct',
      sessionId: getSessionId(),
      userAgent: navigator.userAgent,
      browser: getBrowserInfo(),
      os: getOSInfo(),
      device: getDeviceInfo()
    };

    await axios.post('/analytics/log', data);
  } catch (err) {
    // Silently fail to not interrupt user experience
    console.debug('Traffic tracking failed', err);
  }
};
