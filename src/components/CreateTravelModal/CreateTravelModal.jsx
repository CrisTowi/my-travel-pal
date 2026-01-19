import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravelContext } from '../../context/TravelContext';
import LocationInput from '../LocationInput/LocationInput';
import styles from './CreateTravelModal.module.css';

const CreateTravelModal = ({ isOpen, onClose }) => {
  const { addTravelPlan } = useTravelContext();
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

  const handleChange = (e) => {
    const { name, value, locationData } = e.target;
    
    // Handle location inputs with location data
    if (name === 'startLocation') {
      setFormData({
        ...formData,
        startLocation: value,
        startLocationData: locationData || null,
      });
    } else if (name === 'endLocation') {
      setFormData({
        ...formData,
        endLocation: value,
        endLocationData: locationData || null,
      });
    }
    // If changing start date, ensure end date is not before it
    else if (name === 'startDate' && formData.endDate && value > formData.endDate) {
      setFormData({
        ...formData,
        startDate: value,
        endDate: value, // Reset end date to match start date
      });
    } 
    // If changing end date, ensure it's not before start date
    else if (name === 'endDate' && formData.startDate && value < formData.startDate) {
      setFormData({
        ...formData,
        endDate: formData.startDate, // Set to start date minimum
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const planId = addTravelPlan(formData);
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
    onClose();
    navigate(`/travel/${planId}`);
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
    </div>
  );
};

export default CreateTravelModal;
