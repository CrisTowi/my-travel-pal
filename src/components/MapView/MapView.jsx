import { useEffect, useRef, useState } from 'react';
import styles from './MapView.module.css';

const MapView = ({ plan, itemTypes, onEditItem }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    // Check if script already loaded
    if (window.google?.maps) {
      setScriptLoaded(true);
      return;
    }

    // Check if API key is available
    if (!apiKey) {
      console.warn('Google Maps API key not found.');
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => console.error('Failed to load Google Maps script');
    document.head.appendChild(script);
  }, []);

  // Get all items with location data
  const getItemsWithLocation = () => {
    const items = [];
    itemTypes.forEach((itemType) => {
      const itemsOfType = plan[itemType.type] || [];
      itemsOfType.forEach((item) => {
        // Check if item has location data with coordinates
        if (item.locationData && item.locationData.lat && item.locationData.lng) {
          items.push({
            ...item,
            itemType: itemType.type,
            itemConfig: itemType,
          });
        }
      });
    });
    return items;
  };

  // Initialize map
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || mapInstanceRef.current) return;

    const getItems = () => {
      const items = [];
      itemTypes.forEach((itemType) => {
        const itemsOfType = plan[itemType.type] || [];
        itemsOfType.forEach((item) => {
          if (item.locationData && item.locationData.lat && item.locationData.lng) {
            items.push({
              ...item,
              itemType: itemType.type,
              itemConfig: itemType,
            });
          }
        });
      });
      return items;
    };

    const items = getItems();
    
    // Default center (if no items, center on Paris as example)
    let center = { lat: 48.8566, lng: 2.3522 };
    let zoom = 12;

    // If we have items, center on the first one
    if (items.length > 0) {
      center = {
        lat: items[0].locationData.lat,
        lng: items[0].locationData.lng,
      };
    }

    // Create map
    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;

    // Add markers for each item
    addMarkers(map, items);

    // Fit bounds to show all markers
    if (items.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      items.forEach(item => {
        bounds.extend({
          lat: item.locationData.lat,
          lng: item.locationData.lng,
        });
      });
      map.fitBounds(bounds);
    }
  }, [scriptLoaded, plan, itemTypes]);

  // Add markers to map
  const addMarkers = (map, items) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    items.forEach((item) => {
      // Create custom marker with emoji icon
      const marker = new window.google.maps.Marker({
        position: {
          lat: item.locationData.lat,
          lng: item.locationData.lng,
        },
        map,
        title: item.name,
        label: {
          text: item.itemConfig.icon,
          fontSize: '24px',
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: item.itemConfig.color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 20,
        },
      });

      // Create info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(item),
      });

      // Add click listener
      marker.addListener('click', () => {
        // Close all other info windows
        markersRef.current.forEach(m => {
          if (m.infoWindow) {
            m.infoWindow.close();
          }
        });
        
        infoWindow.open(map, marker);
        setSelectedItem(item);
      });

      marker.infoWindow = infoWindow;
      markersRef.current.push(marker);
    });
  };

  // Create HTML content for info window
  const createInfoWindowContent = (item) => {
    const dateInfo = item.checkIn && item.checkOut 
      ? `${formatDate(item.checkIn)} → ${formatDate(item.checkOut)}`
      : item.date 
      ? formatDateTime(item.date)
      : '';

    return `
      <div style="padding: 8px; min-width: 200px;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 24px;">${item.itemConfig.icon}</span>
          <span style="color: ${item.itemConfig.color}; font-weight: 600; text-transform: uppercase; font-size: 12px;">
            ${item.itemConfig.label}
          </span>
        </div>
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">${item.name}</h3>
        ${item.description ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">${item.description}</p>` : ''}
        ${dateInfo ? `<p style="margin: 4px 0; font-size: 13px;">📅 ${dateInfo}</p>` : ''}
        ${item.location ? `<p style="margin: 4px 0; font-size: 13px;">📍 ${item.location}</p>` : ''}
        ${item.price ? `<p style="margin: 4px 0; font-size: 13px;">💰 $${item.price}${item.checkIn && item.checkOut ? '/night' : ''}</p>` : ''}
        <button 
          onclick="window.editMapItem('${item.id}')"
          style="margin-top: 12px; padding: 6px 12px; background: ${item.itemConfig.color}; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;"
        >
          Edit Item
        </button>
      </div>
    `;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Set up global edit function for info window buttons
  useEffect(() => {
    window.editMapItem = (itemId) => {
      const items = getItemsWithLocation();
      const item = items.find(i => i.id === itemId);
      if (item && onEditItem) {
        onEditItem(item);
      }
    };

    return () => {
      delete window.editMapItem;
    };
  }, [plan, itemTypes, onEditItem]);

  const items = getItemsWithLocation();

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className={styles.noApi}>
        <div className={styles.noApiIcon}>🗺️</div>
        <h3 className={styles.noApiTitle}>Google Maps API Key Required</h3>
        <p className={styles.noApiText}>
          To use the map view, please add your Google Maps API key to the <code>.env</code> file.
        </p>
        <p className={styles.noApiText}>
          See <code>SETUP_GUIDE.md</code> for instructions.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📍</div>
        <h3 className={styles.emptyTitle}>No locations added yet</h3>
        <p className={styles.emptyText}>
          Add items with locations using the Google Places autocomplete to see them on the map
        </p>
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapWrapper}>
        <div ref={mapRef} className={styles.map} />
      </div>
      
      <div className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>
          Locations ({items.length})
        </h3>
        <div className={styles.itemList}>
          {items.map((item) => (
            <div 
              key={item.id} 
              className={`${styles.itemCard} ${selectedItem?.id === item.id ? styles.itemCardActive : ''}`}
              onClick={() => {
                // Pan to marker and open info window
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.panTo({
                    lat: item.locationData.lat,
                    lng: item.locationData.lng,
                  });
                  mapInstanceRef.current.setZoom(15);
                  
                  // Find and click the marker
                  const marker = markersRef.current.find(m => m.getTitle() === item.name);
                  if (marker) {
                    window.google.maps.event.trigger(marker, 'click');
                  }
                }
              }}
            >
              <div className={styles.itemIcon} style={{ backgroundColor: item.itemConfig.color }}>
                {item.itemConfig.icon}
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemLocation}>{item.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapView;
