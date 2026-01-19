import { createContext, useContext, useState, useEffect } from 'react';

const TravelContext = createContext();

export const useTravelContext = () => {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravelContext must be used within a TravelProvider');
  }
  return context;
};

export const TravelProvider = ({ children }) => {
  const [travelPlans, setTravelPlans] = useState(() => {
    const saved = localStorage.getItem('travelPlans');
    return saved ? JSON.parse(saved) : [];
  });

  const [globalTravelers, setGlobalTravelers] = useState(() => {
    const saved = localStorage.getItem('globalTravelers');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('travelPlans', JSON.stringify(travelPlans));
  }, [travelPlans]);

  useEffect(() => {
    localStorage.setItem('globalTravelers', JSON.stringify(globalTravelers));
  }, [globalTravelers]);

  const addTravelPlan = (plan) => {
    const newPlan = {
      ...plan,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      activities: [],
      hotels: [],
      restaurants: [],
      attractions: [],
      transportation: [],
      travelers: [],
    };
    setTravelPlans([...travelPlans, newPlan]);
    return newPlan.id;
  };

  const updateTravelPlan = (id, updates) => {
    setTravelPlans(travelPlans.map(plan => 
      plan.id === id ? { ...plan, ...updates } : plan
    ));
  };

  const deleteTravelPlan = (id) => {
    setTravelPlans(travelPlans.filter(plan => plan.id !== id));
  };

  const getTravelPlan = (id) => {
    return travelPlans.find(plan => plan.id === id);
  };

  const addItemToTravelPlan = (planId, itemType, item) => {
    setTravelPlans(travelPlans.map(plan => {
      if (plan.id === planId) {
        const newItem = {
          ...item,
          id: Date.now().toString() + Math.random(),
          createdAt: new Date().toISOString(),
        };
        return {
          ...plan,
          [itemType]: [...(plan[itemType] || []), newItem],
        };
      }
      return plan;
    }));
  };

  const deleteItemFromTravelPlan = (planId, itemType, itemId) => {
    setTravelPlans(travelPlans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          [itemType]: plan[itemType].filter(item => item.id !== itemId),
        };
      }
      return plan;
    }));
  };

  const updateItemInTravelPlan = (planId, itemType, itemId, updates) => {
    setTravelPlans(travelPlans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          [itemType]: plan[itemType].map(item => 
            item.id === itemId ? { ...item, ...updates } : item
          ),
        };
      }
      return plan;
    }));
  };

  // Global Travelers Management
  const addGlobalTraveler = (traveler) => {
    const newTraveler = {
      ...traveler,
      id: Date.now().toString() + Math.random(),
      createdAt: new Date().toISOString(),
    };
    setGlobalTravelers([...globalTravelers, newTraveler]);
    return newTraveler;
  };

  const updateGlobalTraveler = (travelerId, updates) => {
    setGlobalTravelers(globalTravelers.map(traveler =>
      traveler.id === travelerId ? { ...traveler, ...updates } : traveler
    ));
  };

  const deleteGlobalTraveler = (travelerId) => {
    setGlobalTravelers(globalTravelers.filter(traveler => traveler.id !== travelerId));
  };

  // Travel Plan Travelers Management
  const addTravelerToTrip = (planId, travelerId) => {
    setTravelPlans(travelPlans.map(plan => {
      if (plan.id === planId) {
        const travelers = plan.travelers || [];
        if (!travelers.includes(travelerId)) {
          return { ...plan, travelers: [...travelers, travelerId] };
        }
      }
      return plan;
    }));
  };

  const removeTravelerFromTrip = (planId, travelerId) => {
    setTravelPlans(travelPlans.map(plan => {
      if (plan.id === planId) {
        return {
          ...plan,
          travelers: (plan.travelers || []).filter(id => id !== travelerId),
        };
      }
      return plan;
    }));
  };

  // Get travelers for a specific trip
  const getTripTravelers = (planId) => {
    const plan = travelPlans.find(p => p.id === planId);
    if (!plan || !plan.travelers) return [];
    return globalTravelers.filter(traveler => plan.travelers.includes(traveler.id));
  };

  return (
    <TravelContext.Provider
      value={{
        travelPlans,
        addTravelPlan,
        updateTravelPlan,
        deleteTravelPlan,
        getTravelPlan,
        addItemToTravelPlan,
        deleteItemFromTravelPlan,
        updateItemInTravelPlan,
        globalTravelers,
        addGlobalTraveler,
        updateGlobalTraveler,
        deleteGlobalTraveler,
        addTravelerToTrip,
        removeTravelerFromTrip,
        getTripTravelers,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
};
