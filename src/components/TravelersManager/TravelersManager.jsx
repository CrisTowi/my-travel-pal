import { useState } from 'react';
import { useTravelContext } from '../../context/TravelContext';
import TravelerAvatar from '../TravelerAvatar/TravelerAvatar';
import AddTravelerModal from '../AddTravelerModal/AddTravelerModal';
import styles from './TravelersManager.module.css';

const TravelersManager = ({ planId }) => {
  const { 
    globalTravelers, 
    getTripTravelers, 
    addTravelerToTrip, 
    removeTravelerFromTrip 
  } = useTravelContext();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAllTravelers, setShowAllTravelers] = useState(false);
  
  const tripTravelers = getTripTravelers(planId);
  const availableTravelers = globalTravelers.filter(
    traveler => !tripTravelers.find(t => t.id === traveler.id)
  );

  const handleAddExisting = (travelerId) => {
    addTravelerToTrip(planId, travelerId);
    setShowAllTravelers(false);
  };

  const handleRemove = (travelerId) => {
    if (tripTravelers.length === 1) {
      alert('At least one traveler must remain in the travel plan.');
      return;
    }
    if (window.confirm('Remove this traveler from the trip?')) {
      removeTravelerFromTrip(planId, travelerId);
    }
  };

  const handleNewTravelerAdded = (newTraveler) => {
    addTravelerToTrip(planId, newTraveler.id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Travelers ({tripTravelers.length})
        </h3>
        <div className={styles.headerActions}>
          {availableTravelers.length > 0 && (
            <button
              className={styles.addExistingButton}
              onClick={() => setShowAllTravelers(!showAllTravelers)}
              title="Add existing traveler"
            >
              <span className={styles.buttonIcon}>👤</span>
            </button>
          )}
          <button
            className={styles.addButton}
            onClick={() => setIsAddModalOpen(true)}
            title="Add new traveler"
          >
            <span className={styles.buttonIcon}>+</span>
          </button>
        </div>
      </div>

      {showAllTravelers && availableTravelers.length > 0 && (
        <div className={styles.availableList}>
          <p className={styles.availableTitle}>Select from your travelers:</p>
          {availableTravelers.map((traveler) => (
            <div
              key={traveler.id}
              className={styles.availableItem}
              onClick={() => handleAddExisting(traveler.id)}
            >
              <TravelerAvatar traveler={traveler} size="small" />
              <span className={styles.availableName}>{traveler.name}</span>
              <span className={styles.addIcon}>+</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.travelersList}>
        {tripTravelers.length === 0 ? (
          <div className={styles.empty}>
            <p>No travelers added yet. Add at least one traveler to start.</p>
          </div>
        ) : (
          tripTravelers.map((traveler) => (
            <div key={traveler.id} className={styles.travelerCard}>
              <TravelerAvatar traveler={traveler} size="small" />
              <div className={styles.travelerInfo}>
                <div className={styles.travelerName}>{traveler.name}</div>
                {(traveler.dateOfBirth || traveler.passportNumber) && (
                  <div className={styles.travelerMeta}>
                    {traveler.passportNumber && `Passport: ${traveler.passportNumber}`}
                    {traveler.dateOfBirth && traveler.passportNumber && ' • '}
                    {traveler.dateOfBirth && `DOB: ${new Date(traveler.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </div>
                )}
              </div>
              <button
                className={styles.removeButton}
                onClick={() => handleRemove(traveler.id)}
                title="Remove from trip"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <AddTravelerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTravelerAdded={handleNewTravelerAdded}
      />
    </div>
  );
};

export default TravelersManager;
