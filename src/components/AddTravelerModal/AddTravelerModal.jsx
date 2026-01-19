import { useState, useEffect } from 'react';
import { useTravelContext } from '../../context/TravelContext';
import styles from './AddTravelerModal.module.css';

const AddTravelerModal = ({ isOpen, onClose, editTraveler, onTravelerAdded }) => {
  const { addGlobalTraveler, updateGlobalTraveler } = useTravelContext();
  const [formData, setFormData] = useState({
    name: '',
    passportNumber: '',
    dateOfBirth: '',
    profilePicture: '',
  });

  useEffect(() => {
    if (editTraveler && isOpen) {
      setFormData({
        name: editTraveler.name || '',
        passportNumber: editTraveler.passportNumber || '',
        dateOfBirth: editTraveler.dateOfBirth || '',
        profilePicture: editTraveler.profilePicture || '',
      });
    } else if (!isOpen) {
      setFormData({
        name: '',
        passportNumber: '',
        dateOfBirth: '',
        profilePicture: '',
      });
    }
  }, [editTraveler, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editTraveler) {
      updateGlobalTraveler(editTraveler.id, formData);
    } else {
      const newTraveler = addGlobalTraveler(formData);
      if (onTravelerAdded) {
        onTravelerAdded(newTraveler);
      }
    }
    
    setFormData({
      name: '',
      passportNumber: '',
      dateOfBirth: '',
      profilePicture: '',
    });
    onClose();
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
          <h2 className={styles.title}>
            {editTraveler ? 'Edit Traveler' : 'Add New Traveler'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.input}
              placeholder="e.g., John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dateOfBirth" className={styles.label}>
              Date of Birth <span className={styles.optional}>(optional)</span>
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              className={styles.input}
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="passportNumber" className={styles.label}>
              Passport Number <span className={styles.optional}>(optional)</span>
            </label>
            <input
              type="text"
              id="passportNumber"
              name="passportNumber"
              className={styles.input}
              placeholder="e.g., AB1234567"
              value={formData.passportNumber}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="profilePicture" className={styles.label}>
              Profile Picture URL <span className={styles.optional}>(optional)</span>
            </label>
            <input
              type="url"
              id="profilePicture"
              name="profilePicture"
              className={styles.input}
              placeholder="https://example.com/photo.jpg"
              value={formData.profilePicture}
              onChange={handleChange}
            />
            <p className={styles.hint}>
              For now, paste a URL to an image. Future versions will support file uploads.
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
              {editTraveler ? 'Save Changes' : 'Add Traveler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTravelerModal;
