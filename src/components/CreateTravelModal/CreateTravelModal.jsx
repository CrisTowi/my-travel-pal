import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravelContext } from '../../context/TravelContext';
import LocationInput from '../LocationInput/LocationInput';
import TravelerAvatar from '../TravelerAvatar/TravelerAvatar';
import AddTravelerModal from '../AddTravelerModal/AddTravelerModal';
import styles from './CreateTravelModal.module.css';

const CreateTravelModal = ({ isOpen, onClose }) => {
  const { addTravelPlan, globalTravelers, addTravelerToTrip } = useTravelContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startLocation: '',
    startLocationData: null,
    endLocation: '',
    endLocationData: null,
    startDate: '',
    endDate: '',
  });
  const [selectedTravelers, setSelectedTravelers] = useState([]);
  const [isAddTravelerModalOpen, setIsAddTravelerModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, locationData } = e.target;
    
    // Handle location inputs with location data
    if (name === 'startLocation') {
      setFormData(prev => ({
        ...prev,
        startLocation: value,
        startLocationData: locationData || null,
      }));
    } else if (name === 'endLocation') {
      setFormData(prev => ({
        ...prev,
        endLocation: value,
        endLocationData: locationData || null,
      }));
    }
    // If changing start date, ensure end date is not before it
    else if (name === 'startDate') {
      setFormData(prev => {
        if (prev.endDate && value > prev.endDate) {
          return {
            ...prev,
            startDate: value,
            endDate: value, // Reset end date to match start date
          };
        }
        return {
          ...prev,
          startDate: value,
        };
      });
    } 
    // If changing end date, ensure it's not before start date
    else if (name === 'endDate') {
      setFormData(prev => {
        if (prev.startDate && value < prev.startDate) {
          return {
            ...prev,
            endDate: prev.startDate, // Set to start date minimum
          };
        }
        return {
          ...prev,
          endDate: value,
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if at least one traveler is selected
    if (selectedTravelers.length === 0) {
      alert('Please select at least one traveler for this trip.');
      return;
    }
    
    const planId = addTravelPlan(formData);
    
    // Add selected travelers to the new travel plan
    selectedTravelers.forEach(travelerId => {
      addTravelerToTrip(planId, travelerId);
    });
    
    setFormData({
      name: '',
      description: '',
      startLocation: '',
      startLocationData: null,
      endLocation: '',
      endLocationData: null,
      startDate: '',
      endDate: '',
    });
    setSelectedTravelers([]);
    onClose();
    navigate(`/travel/${planId}`);
  };

  const toggleTraveler = (travelerId) => {
    setSelectedTravelers(prev => 
      prev.includes(travelerId)
        ? prev.filter(id => id !== travelerId)
        : [...prev, travelerId]
    );
  };

  const handleNewTravelerAdded = (newTraveler) => {
    // Automatically select the newly added traveler
    setSelectedTravelers(prev => [...prev, newTraveler.id]);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create New Travel Plan</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Travel Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.input}
              placeholder="e.g., Summer Europe Trip"
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
              placeholder="Describe your travel plans..."
              value={formData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="startLocation" className={styles.label}>
                Starting From <span className={styles.required}>*</span>
              </label>
              <LocationInput
                id="startLocation"
                name="startLocation"
                value={formData.startLocation}
                onChange={handleChange}
                placeholder="e.g., Paris"
                required
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endLocation" className={styles.label}>
                Ending In <span className={styles.required}>*</span>
              </label>
              <LocationInput
                id="endLocation"
                name="endLocation"
                value={formData.endLocation}
                onChange={handleChange}
                placeholder="e.g., London"
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate" className={styles.label}>
                Start Date <span className={styles.optional}>(optional)</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className={styles.input}
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endDate" className={styles.label}>
                End Date <span className={styles.optional}>(optional)</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className={styles.input}
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || undefined}
              />
            </div>
          </div>

          {/* Travelers Selection */}
          <div className={styles.formGroup}>
            <div className={styles.travelersHeader}>
              <label className={styles.label}>
                Travelers <span className={styles.required}>*</span>
              </label>
              <button
                type="button"
                className={styles.addTravelerButton}
                onClick={() => setIsAddTravelerModalOpen(true)}
                title="Add new traveler"
              >
                <span className={styles.addTravelerIcon}>+</span>
              </button>
            </div>

            {globalTravelers.length === 0 ? (
              <div className={styles.noTravelers}>
                <p>No travelers found. Add your first traveler to start.</p>
              </div>
            ) : (
              <div className={styles.travelersGrid}>
                {globalTravelers.map((traveler) => (
                  <div
                    key={traveler.id}
                    className={`${styles.travelerChip} ${
                      selectedTravelers.includes(traveler.id) ? styles.travelerChipActive : ''
                    }`}
                    onClick={() => toggleTraveler(traveler.id)}
                  >
                    <TravelerAvatar traveler={traveler} size="small" />
                    <span className={styles.travelerChipName}>{traveler.name}</span>
                    {selectedTravelers.includes(traveler.id) && (
                      <span className={styles.travelerChipCheck}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className={styles.travelersHint}>
              Select at least one traveler for this trip
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Create Travel Plan
            </button>
          </div>
        </form>
      </div>

      <AddTravelerModal
        isOpen={isAddTravelerModalOpen}
        onClose={() => setIsAddTravelerModalOpen(false)}
        onTravelerAdded={handleNewTravelerAdded}
      />
    </div>
  );
};

export default CreateTravelModal;
