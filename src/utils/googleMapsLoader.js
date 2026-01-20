// Centralized Google Maps API loader to prevent duplicate script loading
let isLoading = false;
let isLoaded = false;
const callbacks = [];

export const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (isLoaded && window.google?.maps) {
      resolve(window.google.maps);
      return;
    }

    // If currently loading, add to callback queue
    if (isLoading) {
      callbacks.push({ resolve, reject });
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      if (window.google?.maps) {
        isLoaded = true;
        resolve(window.google.maps);
      } else {
        // Script exists but not loaded yet, wait for it
        existingScript.addEventListener('load', () => {
          isLoaded = true;
          resolve(window.google.maps);
          callbacks.forEach(cb => cb.resolve(window.google.maps));
          callbacks.length = 0;
        });
        existingScript.addEventListener('error', (error) => {
          reject(error);
          callbacks.forEach(cb => cb.reject(error));
          callbacks.length = 0;
        });
      }
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      const error = new Error('Google Maps API key not found');
      reject(error);
      callbacks.forEach(cb => cb.reject(error));
      callbacks.length = 0;
      return;
    }

    // Start loading
    isLoading = true;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isLoading = false;
      isLoaded = true;
      resolve(window.google.maps);
      callbacks.forEach(cb => cb.resolve(window.google.maps));
      callbacks.length = 0;
    };

    script.onerror = (error) => {
      isLoading = false;
      const err = new Error('Failed to load Google Maps script');
      reject(err);
      callbacks.forEach(cb => cb.reject(err));
      callbacks.length = 0;
    };

    document.head.appendChild(script);
  });
};

export const isGoogleMapsLoaded = () => {
  return isLoaded && window.google?.maps;
};
