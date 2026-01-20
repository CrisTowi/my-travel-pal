import { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript } from '../../utils/googleMapsLoader';
import styles from './LocationInput.module.css';

const LocationInput = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  required,
  className
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [locationData, setLocationData] = useState(null);

  // Load Google Maps script using centralized loader
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    // Check if script already loaded
    if (window.google?.maps?.places) {
      setScriptLoaded(true);
      return;
    }

    // Check if API key is available
    if (!apiKey) {
      console.warn('Google Maps API key not found. Location autocomplete will not be available.');
      return;
    }

    // Load using centralized loader
    loadGoogleMapsScript()
      .then(() => {
        setScriptLoaded(true);
      })
      .catch((error) => {
        console.error('Failed to load Google Maps script:', error);
      });
  }, []);

  // Initialize autocomplete
  useEffect(() => {
    if (!scriptLoaded || !inputRef.current || autocompleteRef.current) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'], // Focus on cities, but can be adjusted
        fields: ['formatted_address', 'geometry', 'name', 'place_id'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        if (place.geometry) {
          const locationInfo = {
            name: place.name || place.formatted_address,
            address: place.formatted_address,
            placeId: place.place_id,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };

          setLocationData(locationInfo);

          // Call onChange with both the display name and full location data
          onChange({
            target: {
              name,
              value: place.name || place.formatted_address,
              locationData: locationInfo,
            },
          });
        }
      });

      autocompleteRef.current = autocomplete;
    } catch (error) {
      console.error('Error initializing Google Places Autocomplete:', error);
    }
  }, [scriptLoaded, name, onChange]);

  const handleChange = (e) => {
    // Allow typing and pass through to parent
    onChange({
      target: {
        name,
        value: e.target.value,
        locationData: null, // Clear location data when manually typing
      },
    });
  };

  return (
    <div className={styles.locationInputWrapper}>
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={className}
        autoComplete="off"
      />
      {!scriptLoaded && (
        <div className={styles.fallbackNote}>
          {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
            <span className={styles.loading}>Loading places...</span>
          ) : (
            <span className={styles.noApi}>Add Google Maps API key for autocomplete</span>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationInput;
