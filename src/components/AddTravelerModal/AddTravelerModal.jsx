import { useState, useEffect } from 'react';
import { useTravelContext } from '../../context/TravelContext';
import styles from './AddTravelerModal.module.css';

const AddTravelerModal = ({ isOpen, onClose, editTraveler, onTravelerAdded }) => {
  const { addGlobalTraveler, updateGlobalTraveler } = useTravelContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    passportNumber: '',
    dateOfBirth: '',
    profilePicture: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editTraveler && isOpen) {
      setFormData({
        name: editTraveler.name || '',
        email: editTraveler.email || '',
        passportNumber: editTraveler.passportNumber || '',
        dateOfBirth: editTraveler.dateOfBirth || '',
        profilePicture: editTraveler.profilePicture || '',
      });
      setErrors({});
    } else if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        passportNumber: '',
        dateOfBirth: '',
        profilePicture: '',
      });
      setErrors({});
    }
  }, [editTraveler, isOpen]);

  const validateEmail = (email) => {
    // Email is optional, but if provided, it must be valid
    if (!email || email.trim() === '') {
      return ''; // Empty email is valid since it's optional
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Validate email in real-time
    if (name === 'email') {
      const error = validateEmail(value);
      setErrors(prev => ({
        ...prev,
        email: error || undefined,
      }));
    } else if (errors[name]) {
      // Clear error for other fields when user starts typing
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email before submission
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }
    
    try {
      if (editTraveler) {
        await updateGlobalTraveler(editTraveler.id, formData);
      } else {
        const newTraveler = await addGlobalTraveler(formData);
        if (onTravelerAdded) {
          onTravelerAdded(newTraveler);
        }
      }
      
      setFormData({
        name: '',
        email: '',
        passportNumber: '',
        dateOfBirth: '',
        profilePicture: '',
      });
      setErrors({});
      onClose();
    } catch (error) {
      alert(error.message || 'Failed to save traveler. Please try again.');
    }
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
            {editTraveler ? 'Edit Traveler' : 'Create Traveler'}
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
            <label htmlFor="email" className={styles.label}>
              Email <span className={styles.optional}>(optional)</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="e.g., john.doe@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className={styles.errorMessage}>{errors.email}</span>
            )}
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
              {editTraveler ? 'Save Changes' : 'Create Traveler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTravelerModal;
