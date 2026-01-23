import { useState } from 'react';
import { useTravelContext } from '../../context/TravelContext';
import TravelerAvatar from '../../components/TravelerAvatar/TravelerAvatar';
import AddTravelerModal from '../../components/AddTravelerModal/AddTravelerModal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import styles from './Travelers.module.css';

const Travelers = () => {
  const { globalTravelers, addGlobalTraveler, updateGlobalTraveler, deleteGlobalTraveler, loading } = useTravelContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTraveler, setEditingTraveler] = useState(null);
  const [confirmState, setConfirmState] = useState({ isOpen: false, travelerId: null, travelerName: '' });

  const handleAddNew = () => {
    setEditingTraveler(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (traveler) => {
    setEditingTraveler(traveler);
    setIsAddModalOpen(true);
  };

  const handleDelete = (traveler) => {
    setConfirmState({
      isOpen: true,
      travelerId: traveler.id,
      travelerName: traveler.name,
    });
  };

  const handleConfirmDelete = async () => {
    if (confirmState.travelerId) {
      try {
        await deleteGlobalTraveler(confirmState.travelerId);
      } catch (error) {
        alert(error.message || 'Failed to delete traveler. Please try again.');
      }
    }
    setConfirmState({ isOpen: false, travelerId: null, travelerName: '' });
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingTraveler(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Travelers</h1>
          <p className={styles.subtitle}>
            Manage your travelers and their information
          </p>
        </div>
        <button
          className={styles.addButton}
          onClick={handleAddNew}
        >
          <span className={styles.addIcon}>+</span>
          Create Traveler
        </button>
      </div>

          {loading ? (
            <div className={styles.emptyState}>
              <div>Loading...</div>
            </div>
          ) : globalTravelers.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👤</div>
          <h2 className={styles.emptyTitle}>No travelers yet</h2>
          <p className={styles.emptyText}>
            Start by adding your first traveler to your collection
          </p>
          <button
            className={styles.emptyButton}
            onClick={handleAddNew}
          >
            Create Your First Traveler
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {globalTravelers.map((traveler) => (
            <div key={traveler.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <TravelerAvatar traveler={traveler} size="large" />
                <div className={styles.cardActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(traveler)}
                    title="Edit Traveler"
                  >
                    ✏️
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(traveler)}
                    title="Delete Traveler"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.travelerName}>{traveler.name}</h3>

                {traveler.email && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}>📧</span>
                    <span className={styles.infoText}>{traveler.email}</span>
                  </div>
                )}

                {traveler.dateOfBirth && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}>🎂</span>
                    <span className={styles.infoText}>
                      Born: {formatDate(traveler.dateOfBirth)}
                    </span>
                  </div>
                )}

                {traveler.passportNumber && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoIcon}>🛂</span>
                    <span className={styles.infoText}>
                      Passport: {traveler.passportNumber}
                    </span>
                  </div>
                )}

                {traveler.createdAt && (
                  <div className={styles.metaInfo}>
                    Added: {formatDate(traveler.createdAt)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddTravelerModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        editTraveler={editingTraveler}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, travelerId: null, travelerName: '' })}
        onConfirm={handleConfirmDelete}
        title="Delete Traveler"
        message={`Are you sure you want to delete "${confirmState.travelerName}"? This will remove them from all travel plans. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        icon="🗑️"
      />
    </div>
  );
};

export default Travelers;
