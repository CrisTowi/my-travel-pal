import React, { useState } from 'react';
import { useTravelContext } from '../../context/TravelContext';
import TravelerAvatar from '../TravelerAvatar/TravelerAvatar';
import ConfirmModal from '../ConfirmModal/ConfirmModal';
import styles from './Timeline.module.css';

const Timeline = ({ plan, itemTypes, onEditItem, onAddItemBetween }) => {
  const { deleteItemFromTravelPlan, globalTravelers } = useTravelContext();
  const [confirmState, setConfirmState] = useState({ isOpen: false, item: null });

  // Combine all items with their type information
  const getAllItems = () => {
    const items = [];
    itemTypes.forEach((itemType) => {
      const itemsOfType = plan[itemType.type] || [];
      itemsOfType.forEach((item) => {
        items.push({
          ...item,
          itemType: itemType.type,
          itemConfig: itemType,
        });
      });
    });

    // Sort by date if available, otherwise by creation time
    return items.sort((a, b) => {
      // Use checkIn for hotels, date for others, or createdAt as fallback
      const dateA = a.checkIn ? new Date(a.checkIn) : (a.date ? new Date(a.date) : new Date(a.createdAt));
      const dateB = b.checkIn ? new Date(b.checkIn) : (b.date ? new Date(b.date) : new Date(b.createdAt));
      return dateA - dateB;
    });
  };

  const handleDelete = (item) => {
    setConfirmState({ isOpen: true, item });
  };

  const handleConfirmDelete = async () => {
    if (confirmState.item) {
      try {
        await deleteItemFromTravelPlan(plan.id, confirmState.item.itemType, confirmState.item.id);
      } catch (error) {
        alert(error.message || 'Failed to delete item. Please try again.');
      }
    }
    setConfirmState({ isOpen: false, item: null });
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const allItems = getAllItems();

  // Get the date from an item (handles checkIn for hotels, date for others)
  const getItemDate = (item) => {
    if (item.checkIn) return item.checkIn;
    if (item.date) return item.date;
    return item.createdAt;
  };

  // Handle adding item between two items
  const handleAddBetween = (prevItem, nextItem) => {
    const minDate = prevItem ? getItemDate(prevItem) : plan.startDate;
    const maxDate = nextItem ? getItemDate(nextItem) : plan.endDate;
    
    if (onAddItemBetween) {
      onAddItemBetween(minDate, maxDate);
    }
  };

  if (allItems.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📋</div>
        <h3 className={styles.emptyTitle}>No items in your itinerary yet</h3>
        <p className={styles.emptyText}>
          Start adding activities, hotels, restaurants, and more to build your travel timeline
        </p>
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      {/* Add button at the start */}
      <div className={styles.addItemCTA}>
        <button
          className={styles.addButton}
          onClick={() => handleAddBetween(null, allItems[0])}
          title="Add item before timeline"
        >
          <span className={styles.addButtonIcon}>+</span>
          <span className={styles.addButtonText}>Add item here</span>
        </button>
      </div>

      {allItems.map((item, index) => (
        <React.Fragment key={item.id}>
          <div className={styles.timelineItem}>
            <div className={styles.timelineMarker}>
              <div
                className={styles.timelineDot}
                style={{ backgroundColor: item.itemConfig.color }}
              >
                <span className={styles.timelineIcon}>{item.itemConfig.icon}</span>
              </div>
              <div className={styles.timelineLine} />
            </div>

            <div className={styles.timelineContent}>
              <div className={styles.timelineCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardType} style={{ color: item.itemConfig.color }}>
                    {item.itemConfig.label}
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => onEditItem(item)}
                      title="Edit Item"
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(item)}
                      title="Delete Item"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <h4 className={styles.cardTitle}>{item.name}</h4>
                
                {item.description && (
                  <p className={styles.cardDescription}>{item.description}</p>
                )}

                <div className={styles.cardMeta}>
                  {item.checkIn && item.checkOut ? (
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>📅</span>
                      <span className={styles.metaText}>
                        {formatDateOnly(item.checkIn)} → {formatDateOnly(item.checkOut)}
                      </span>
                    </div>
                  ) : item.date ? (
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>📅</span>
                      <span className={styles.metaText}>{formatDate(item.date)}</span>
                    </div>
                  ) : null}
                  {item.location && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>📍</span>
                      <span className={styles.metaText}>{item.location}</span>
                    </div>
                  )}
                  {item.price && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>💰</span>
                      <span className={styles.metaText}>
                        ${item.price}{item.checkIn && item.checkOut ? '/night' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {item.notes && (
                  <div className={styles.cardNotes}>
                    <strong>Notes:</strong> {item.notes}
                  </div>
                )}
              </div>

              {/* Travelers assigned to this item */}
              {item.travelers && item.travelers.length > 0 && (
                <div className={styles.cardTravelers}>
                  <span className={styles.travelersLabel}>Travelers:</span>
                  <div className={styles.travelersAvatars}>
                    {item.travelers
                      .map(travelerId => globalTravelers.find(t => t.id === travelerId))
                      .filter(Boolean)
                      .map((traveler) => (
                        <TravelerAvatar key={traveler.id} traveler={traveler} size="small" />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add button between items */}
          <div className={styles.addItemCTA}>
            <button
              className={styles.addButton}
              onClick={() => handleAddBetween(item, allItems[index + 1])}
              title={`Add item ${allItems[index + 1] ? 'between items' : 'after timeline'}`}
            >
              <span className={styles.addButtonIcon}>+</span>
              <span className={styles.addButtonText}>Add item here</span>
            </button>
          </div>
        </React.Fragment>
      ))}

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, item: null })}
        onConfirm={handleConfirmDelete}
        title={`Delete ${confirmState.item?.itemConfig?.label || 'Item'}`}
        message={`Are you sure you want to delete this ${confirmState.item?.itemConfig?.label.toLowerCase() || 'item'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        icon="🗑️"
      />
    </div>
  );
};

export default Timeline;
