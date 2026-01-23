import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTravelContext } from '../../context/TravelContext';
import TravelPlanCard from '../../components/TravelPlanCard/TravelPlanCard';
import CreateTravelModal from '../../components/CreateTravelModal/CreateTravelModal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { travelPlans, deleteTravelPlan } = useTravelContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false, planId: null });
  const navigate = useNavigate();

  const handleDeletePlan = (id) => {
    setConfirmState({ isOpen: true, planId: id });
  };

  const handleConfirmDelete = () => {
    if (confirmState.planId) {
      deleteTravelPlan(confirmState.planId);
    }
    setConfirmState({ isOpen: false, planId: null });
  };

  const handleCardClick = (id) => {
    navigate(`/travel/${id}`);
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>My Travel Plans</h1>
          <p className={styles.subtitle}>
            Plan your adventures and create unforgettable memories
          </p>
        </div>
        <button 
          className={styles.createButton}
          onClick={() => setIsModalOpen(true)}
        >
          <span className={styles.createIcon}>+</span>
          New Travel Plan
        </button>
      </div>

      {travelPlans.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🗺️</div>
          <h2 className={styles.emptyStateTitle}>No travel plans yet</h2>
          <p className={styles.emptyStateText}>
            Start planning your next adventure by creating your first travel plan
          </p>
          <button 
            className={styles.emptyStateButton}
            onClick={() => setIsModalOpen(true)}
          >
            Create Your First Travel Plan
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {travelPlans.map((plan) => (
            <TravelPlanCard
              key={plan.id}
              plan={plan}
              onClick={() => handleCardClick(plan.id)}
              onDelete={() => handleDeletePlan(plan.id)}
            />
          ))}
        </div>
      )}

      <CreateTravelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, planId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Travel Plan"
        message="Are you sure you want to delete this travel plan? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        icon="🗑️"
      />
    </div>
  );
};

export default Dashboard;
