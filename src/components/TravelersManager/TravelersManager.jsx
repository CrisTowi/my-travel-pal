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
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  
  const tripTravelers = getTripTravelers(planId);
  const availableTravelers = globalTravelers.filter(
    traveler => !tripTravelers.find(t => t.id === traveler.id)
  );

  const handleAddExisting = (travelerId) => {
    addTravelerToTrip(planId, travelerId);
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
          <button
            className={styles.addExistingButton}
            onClick={() => setIsSelectModalOpen(true)}
            title="Add existing traveler"
          >
            <span className={styles.buttonIcon}>👤</span>
          </button>
          <button
            className={styles.addButton}
            onClick={() => setIsAddModalOpen(true)}
            title="Add new traveler"
          >
            <span className={styles.buttonIcon}>+</span>
          </button>
        </div>
      </div>

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

      {/* Select Existing Travelers Modal */}
      {isSelectModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setIsSelectModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add Existing Travelers</h3>
              <button
                className={styles.modalClose}
                onClick={() => setIsSelectModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              {availableTravelers.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>All your travelers are already on this trip!</p>
                  <p className={styles.emptyHint}>
                    Create a new traveler using the "+" button to add more people.
                  </p>
                </div>
              ) : (
                <div className={styles.travelersGrid}>
                  {availableTravelers.map((traveler) => (
                    <div
                      key={traveler.id}
                      className={styles.selectableTraveler}
                      onClick={() => handleAddExisting(traveler.id)}
                    >
                      <TravelerAvatar traveler={traveler} size="medium" />
                      <div className={styles.selectableName}>{traveler.name}</div>
                      {(traveler.passportNumber || traveler.dateOfBirth) && (
                        <div className={styles.selectableMeta}>
                          {traveler.passportNumber && `${traveler.passportNumber}`}
                        </div>
                      )}
                      <div className={styles.selectableAdd}>
                        <span>+</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelersManager;
