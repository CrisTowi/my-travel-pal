import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTravelContext } from '../../context/TravelContext';
import Timeline from '../../components/Timeline/Timeline';
import AddItemModal from '../../components/AddItemModal/AddItemModal';
import MapView from '../../components/MapView/MapView';
import TravelersManager from '../../components/TravelersManager/TravelersManager';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import styles from './TravelPlanDetail.module.css';

const TravelPlanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTravelPlan, deleteTravelPlan, deleteItemFromTravelPlan } = useTravelContext();
  const [activeTab, setActiveTab] = useState('timeline');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [dateBoundaries, setDateBoundaries] = useState(null);
  const [confirmState, setConfirmState] = useState({ 
    isOpen: false, 
    type: null, 
    data: null 
  });

  const plan = getTravelPlan(id);

  if (!plan) {
    return (
      <div className={styles.notFound}>
        <h2>Travel plan not found</h2>
        <Link to="/" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    setConfirmState({ 
      isOpen: true, 
      type: 'plan', 
      data: null 
    });
  };

  const handleConfirmDeletePlan = () => {
    deleteTravelPlan(id);
    navigate('/');
    setConfirmState({ isOpen: false, type: null, data: null });
  };

  const handleAddItem = (itemType) => {
    setEditingItem(null); // Clear any editing state
    setDateBoundaries(null); // Clear any date boundaries
    setSelectedItemType(itemType);
    setIsAddModalOpen(true);
  };

  const handleAddItemBetween = (minDate, maxDate) => {
    setEditingItem(null);
    setDateBoundaries({ minDate, maxDate });
    setSelectedItemType(null); // Let user choose type
    setIsAddModalOpen(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setSelectedItemType(item.itemType);
    setIsAddModalOpen(true);
  };

  const handleDeleteItem = (itemType, itemId) => {
    setConfirmState({ 
      isOpen: true, 
      type: 'item', 
      data: { itemType, itemId } 
    });
  };

  const handleConfirmDeleteItem = () => {
    if (confirmState.data) {
      deleteItemFromTravelPlan(id, confirmState.data.itemType, confirmState.data.itemId);
    }
    setConfirmState({ isOpen: false, type: null, data: null });
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingItem(null);
    setDateBoundaries(null);
  };

  const itemTypes = [
    { type: 'activities', label: 'Activity', icon: '🎯', color: '#3b82f6' },
    { type: 'hotels', label: 'Hotel', icon: '🏨', color: '#8b5cf6' },
    { type: 'restaurants', label: 'Restaurant', icon: '🍽️', color: '#f59e0b' },
    { type: 'attractions', label: 'Attraction', icon: '🎭', color: '#10b981' },
    { type: 'transportation', label: 'Transport', icon: '🚗', color: '#ef4444' },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/" className={styles.backButton}>
          ← Back
        </Link>
        <button className={styles.deleteButton} onClick={handleDelete}>
          Delete Plan
        </button>
      </div>

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.route}>
            {plan.startLocation} → {plan.endLocation}
          </div>
          <h1 className={styles.title}>{plan.name}</h1>
          <p className={styles.description}>{plan.description}</p>
          <div className={styles.dateRange}>
            <div className={styles.dateItem}>
              <span className={styles.dateIcon}>📅</span>
              <span>{formatDate(plan.startDate)}</span>
            </div>
            <span className={styles.dateSeparator}>→</span>
            <div className={styles.dateItem}>
              <span className={styles.dateIcon}>📅</span>
              <span>{formatDate(plan.endDate)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <TravelersManager planId={id} />

          <h3 className={styles.sidebarTitle}>Add Items</h3>
          <div className={styles.addButtons}>
            {itemTypes.map((item) => (
              <button
                key={item.type}
                className={styles.addButton}
                onClick={() => handleAddItem(item.type)}
                style={{ '--accent-color': item.color }}
              >
                <span className={styles.addButtonIcon}>{item.icon}</span>
                <span className={styles.addButtonLabel}>Add {item.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.stats}>
            <h3 className={styles.sidebarTitle}>Summary</h3>
            <div className={styles.statsList}>
              {itemTypes.map((item) => (
                <div key={item.type} className={styles.statItem}>
                  <span className={styles.statIcon}>{item.icon}</span>
                  <span className={styles.statLabel}>{item.label}s</span>
                  <span className={styles.statValue}>
                    {plan[item.type]?.length || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.main}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'timeline' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              📅 Timeline
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'list' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('list')}
            >
              📋 List
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'map' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('map')}
            >
              🗺️ Map
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'timeline' ? (
              <Timeline 
                plan={plan} 
                itemTypes={itemTypes} 
                onEditItem={handleEditItem}
                onAddItemBetween={handleAddItemBetween}
              />
            ) : activeTab === 'map' ? (
              <MapView plan={plan} itemTypes={itemTypes} onEditItem={handleEditItem} />
            ) : (
              <div className={styles.listView}>
                {itemTypes.map((item) => (
                  <div key={item.type} className={styles.listSection}>
                    <h3 className={styles.listSectionTitle}>
                      <span className={styles.listSectionIcon}>{item.icon}</span>
                      {item.label}s ({plan[item.type]?.length || 0})
                    </h3>
                    {plan[item.type]?.length > 0 ? (
                      <div className={styles.listItems}>
                        {plan[item.type].map((listItem) => (
                          <div key={listItem.id} className={styles.listItem}>
                            <div className={styles.listItemContent}>
                              <div className={styles.listItemTitle}>{listItem.name}</div>
                              {listItem.description && (
                                <div className={styles.listItemDesc}>{listItem.description}</div>
                              )}
                            </div>
                            <div className={styles.listItemActions}>
                              <button
                                className={styles.editItemButton}
                                onClick={() => handleEditItem({ ...listItem, itemType: item.type, itemConfig: item })}
                                title="Edit Item"
                              >
                                ✏️
                              </button>
                              <button
                                className={styles.deleteItemButton}
                                onClick={() => handleDeleteItem(item.type, listItem.id)}
                                title="Delete Item"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.emptyList}>No {item.label.toLowerCase()}s added yet</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        planId={id}
        plan={plan}
        itemType={selectedItemType}
        itemConfig={itemTypes.find(item => item.type === selectedItemType)}
        editItem={editingItem}
        dateBoundaries={dateBoundaries}
        itemTypes={itemTypes}
      />

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, type: null, data: null })}
        onConfirm={confirmState.type === 'plan' ? handleConfirmDeletePlan : handleConfirmDeleteItem}
        title={confirmState.type === 'plan' ? 'Delete Travel Plan' : 'Delete Item'}
        message={
          confirmState.type === 'plan' 
            ? 'Are you sure you want to delete this travel plan? This action cannot be undone.'
            : 'Are you sure you want to delete this item? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        icon={confirmState.type === 'plan' ? '🗑️' : '⚠️'}
      />
    </div>
  );
};

export default TravelPlanDetail;
