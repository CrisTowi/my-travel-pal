import styles from './TravelPlanCard.module.css';

const TravelPlanCard = ({ plan, onClick, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTotalItems = () => {
    return (
      (plan.activities?.length || 0) +
      (plan.hotels?.length || 0) +
      (plan.restaurants?.length || 0) +
      (plan.attractions?.length || 0) +
      (plan.transportation?.length || 0)
    );
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardHeader}>
        <div className={styles.destination}>
          <span className={styles.fromTo}>
            {plan.startLocation} → {plan.endLocation}
          </span>
        </div>
        <button 
          className={styles.deleteButton}
          onClick={handleDelete}
          title="Delete plan"
        >
          ×
        </button>
      </div>

      <h3 className={styles.title}>{plan.name}</h3>
      <p className={styles.description}>{plan.description}</p>

      <div className={styles.dates}>
        <div className={styles.dateItem}>
          <span className={styles.dateLabel}>Start</span>
          <span className={styles.dateValue}>
            {formatDate(plan.startDate) || 'Not set'}
          </span>
        </div>
        <div className={styles.dateDivider}>→</div>
        <div className={styles.dateItem}>
          <span className={styles.dateLabel}>End</span>
          <span className={styles.dateValue}>
            {formatDate(plan.endDate) || 'Not set'}
          </span>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statIcon}>📍</span>
            <span className={styles.statValue}>{getTotalItems()} items</span>
          </div>
        </div>
        <div className={styles.viewLink}>
          View Details →
        </div>
      </div>
    </div>
  );
};

export default TravelPlanCard;
