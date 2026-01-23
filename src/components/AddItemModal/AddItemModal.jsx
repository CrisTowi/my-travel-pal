import { useState, useEffect } from 'react';
import { useTravelContext } from '../../context/TravelContext';
import LocationInput from '../LocationInput/LocationInput';
import TravelerAvatar from '../TravelerAvatar/TravelerAvatar';
import styles from './AddItemModal.module.css';

const AddItemModal = ({ isOpen, onClose, planId, plan, itemType, itemConfig, editItem, dateBoundaries, itemTypes }) => {
  const { addItemToTravelPlan, updateItemInTravelPlan, getTripTravelers } = useTravelContext();
  const [selectedType, setSelectedType] = useState(itemType);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    checkIn: '',
    checkOut: '',
    location: '',
    locationData: null,
    price: '',
    notes: '',
    travelers: [],
  });

  const tripTravelers = getTripTravelers(planId);

  // Populate form when editing or reset when opening
  useEffect(() => {
    if (editItem && isOpen) {
      setFormData({
        name: editItem.name || '',
        description: editItem.description || '',
        date: editItem.date || '',
        checkIn: editItem.checkIn || '',
        checkOut: editItem.checkOut || '',
        location: editItem.location || '',
        locationData: editItem.locationData || null,
        price: editItem.price || '',
        notes: editItem.notes || '',
        travelers: editItem.travelers || [],
      });
      setSelectedType(itemType);
    } else if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: '',
        description: '',
        date: '',
        checkIn: '',
        checkOut: '',
        location: '',
        locationData: null,
        price: '',
        notes: '',
        travelers: [],
      });
      setSelectedType(itemType);
    } else if (isOpen && !editItem && tripTravelers.length > 0) {
      // Opening for new item - default to all travelers
      const travelerIds = tripTravelers.map(t => t.id);
      setFormData(prev => ({
        ...prev,
        travelers: travelerIds,
      }));
      setSelectedType(itemType || null);
    }
  }, [editItem, isOpen, itemType]);

  const handleChange = (e) => {
    const { name, value, locationData } = e.target;
    
    // Handle location input with location data
    if (name === 'location') {
      setFormData(prev => ({
        ...prev,
        location: value,
        locationData: locationData || null,
      }));
    }
    // For hotels, ensure check-out is not before check-in
    else if (name === 'checkIn') {
      setFormData(prev => {
        if (prev.checkOut && value > prev.checkOut) {
          return {
            ...prev,
            checkIn: value,
            checkOut: value, // Reset check-out to match check-in
          };
        }
        return {
          ...prev,
          checkIn: value,
        };
      });
    } else if (name === 'checkOut') {
      setFormData(prev => {
        if (prev.checkIn && value < prev.checkIn) {
          return {
            ...prev,
            checkOut: prev.checkIn, // Set to check-in date minimum
          };
        }
        return {
          ...prev,
          checkOut: value,
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const typeToUse = selectedType || itemType;
    
    try {
      if (editItem) {
        // Update existing item
        await updateItemInTravelPlan(planId, typeToUse, editItem.id, formData);
      } else {
        // Add new item
        await addItemToTravelPlan(planId, typeToUse, formData);
      }
      setFormData({
        name: '',
        description: '',
        date: '',
        checkIn: '',
        checkOut: '',
        location: '',
        locationData: null,
        price: '',
        notes: '',
        travelers: [],
      });
      setSelectedType(null);
      onClose();
    } catch (error) {
      alert(error.message || 'Failed to save item. Please try again.');
    }
  };

  const toggleTraveler = (travelerId) => {
    setFormData(prev => ({
      ...prev,
      travelers: prev.travelers.includes(travelerId)
        ? prev.travelers.filter(id => id !== travelerId)
        : [...prev.travelers, travelerId],
    }));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Get the current item config
  const currentConfig = selectedType && itemTypes 
    ? itemTypes.find(item => item.type === selectedType)
    : itemConfig;
  
  if (!currentConfig && !dateBoundaries) return null;

  // Determine if this item type should use check-in/check-out dates
  const useCheckInOut = selectedType === 'hotels' || itemType === 'hotels';

  // Format date boundaries for datetime-local input (YYYY-MM-DDTHH:MM)
  const getMinDateTime = () => {
    const min = dateBoundaries?.minDate || plan?.startDate;
    if (!min) return undefined;
    // If min already has time component, use it; otherwise add time
    return min.includes('T') ? min : min + 'T00:00';
  };

  const getMaxDateTime = () => {
    const max = dateBoundaries?.maxDate || plan?.endDate;
    if (!max) return undefined;
    // If max already has time component, use it; otherwise add time
    return max.includes('T') ? max : max + 'T23:59';
  };

  // Get min/max for date inputs (YYYY-MM-DD)
  const minDate = dateBoundaries?.minDate?.split('T')[0] || plan?.startDate;
  const maxDate = dateBoundaries?.maxDate?.split('T')[0] || plan?.endDate;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.headerIcon}>{currentConfig?.icon || '📍'}</span>
            <h2 className={styles.title}>
              {editItem 
                ? `Edit ${currentConfig?.label}` 
                : dateBoundaries 
                ? 'Add Item to Timeline' 
                : `Add ${currentConfig?.label}`}
            </h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {dateBoundaries && dateBoundaries.minDate && dateBoundaries.maxDate && (
            <div className={styles.infoMessage}>
              ℹ️ Add item between {formatDateInfo(dateBoundaries.minDate.split('T')[0])} and {formatDateInfo(dateBoundaries.maxDate.split('T')[0])}
            </div>
          )}
          {!dateBoundaries && plan?.startDate && plan?.endDate && (
            <div className={styles.infoMessage}>
              ℹ️ Dates must be between {formatDateInfo(plan.startDate)} and {formatDateInfo(plan.endDate)}
            </div>
          )}

          {/* Item type selector when adding between items */}
          {dateBoundaries && !editItem && itemTypes && (
            <div className={styles.formGroup}>
              <label htmlFor="itemType" className={styles.label}>
                Item Type <span className={styles.required}>*</span>
              </label>
              <select
                id="itemType"
                name="itemType"
                className={styles.input}
                value={selectedType || ''}
                onChange={(e) => setSelectedType(e.target.value)}
                required
              >
                <option value="">Select type...</option>
                {itemTypes.map((type) => (
                  <option key={type.type} value={type.type}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.input}
              placeholder={`e.g., ${getPlaceholder(itemType)}`}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              className={styles.textarea}
              placeholder="Add details..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {useCheckInOut ? (
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="checkIn" className={styles.label}>
                    Check-In Date <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    className={styles.input}
                    value={formData.checkIn}
                    onChange={handleChange}
                    min={minDate}
                    max={maxDate}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="checkOut" className={styles.label}>
                    Check-Out Date <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    className={styles.input}
                    value={formData.checkOut}
                    onChange={handleChange}
                    min={formData.checkIn || minDate}
                    max={maxDate}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="price" className={styles.label}>
                  Price per Night ($) <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className={styles.input}
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </>
          ) : (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="date" className={styles.label}>
                  Date & Time <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  className={styles.input}
                  value={formData.date}
                  onChange={handleChange}
                  min={getMinDateTime()}
                  max={getMaxDateTime()}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="price" className={styles.label}>
                  Price ($) <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className={styles.input}
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          )}

          <div className={useCheckInOut ? styles.formGroupFull : styles.formGroup}>
            <label htmlFor="location" className={styles.label}>
              Location <span className={styles.optional}>(optional)</span>
            </label>
            <LocationInput
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Address or place name"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.label}>
              Additional Notes <span className={styles.optional}>(optional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              className={styles.textarea}
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={handleChange}
              rows={2}
            />
          </div>

          {/* Travelers Selection */}
          {tripTravelers.length > 0 && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Travelers <span className={styles.optional}>(optional)</span>
              </label>
              <div className={styles.travelersGrid}>
                {tripTravelers.map((traveler) => (
                  <div
                    key={traveler.id}
                    className={`${styles.travelerChip} ${
                      formData.travelers.includes(traveler.id) ? styles.travelerChipActive : ''
                    }`}
                    onClick={() => toggleTraveler(traveler.id)}
                  >
                    <TravelerAvatar traveler={traveler} size="small" />
                    <span className={styles.travelerChipName}>{traveler.name}</span>
                    {formData.travelers.includes(traveler.id) && (
                      <span className={styles.travelerChipCheck}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              style={{ backgroundColor: currentConfig?.color || 'var(--primary-color)' }}
              disabled={dateBoundaries && !selectedType}
            >
              {editItem ? 'Save Changes' : dateBoundaries ? 'Add Item' : `Add ${currentConfig?.label}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const getPlaceholder = (itemType) => {
  const placeholders = {
    activities: 'City Tour',
    hotels: 'Grand Hotel',
    restaurants: 'Italian Restaurant',
    attractions: 'Eiffel Tower',
    transportation: 'Train to London',
  };
  return placeholders[itemType] || 'Item name';
};

const formatDateInfo = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default AddItemModal;
