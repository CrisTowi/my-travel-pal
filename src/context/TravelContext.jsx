import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TravelContext = createContext();

export const useTravelContext = () => {
  const context = useContext(TravelContext);
  if (!context) {
    throw new Error('useTravelContext must be used within a TravelProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const TravelProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [travelPlans, setTravelPlans] = useState([]);
  const [globalTravelers, setGlobalTravelers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAllData();
    } else {
      setTravelPlans([]);
      setGlobalTravelers([]);
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const fetchAllData = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const [plansResponse, travelersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/travel-plans`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/travelers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
      ]);

      if (plansResponse.ok && travelersResponse.ok) {
        const plansData = await plansResponse.json();
        const travelersData = await travelersResponse.json();

        // Transform API data to match frontend format
        const transformedPlans = plansData.travelPlans.map(plan => ({
          id: plan._id,
          name: plan.name,
          description: plan.description,
          startLocation: plan.startLocation,
          startLocationData: plan.startLocationData,
          endLocation: plan.endLocation,
          endLocationData: plan.endLocationData,
          startDate: plan.startDate,
          endDate: plan.endDate,
          travelers: plan.travelers.map(t => t._id || t),
          createdAt: plan.createdAt,
          // Item counts from API
          activities: [],
          hotels: [],
          restaurants: [],
          attractions: [],
          transportation: [],
        }));

        const transformedTravelers = travelersData.travelers.map(traveler => ({
          id: traveler._id,
          name: traveler.name,
          email: traveler.email,
          dateOfBirth: traveler.dateOfBirth,
          passportNumber: traveler.passportNumber,
          profilePicture: traveler.profilePicture,
          createdAt: traveler.createdAt,
        }));

        setTravelPlans(transformedPlans);
        setGlobalTravelers(transformedTravelers);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTravelPlan = async (id) => {
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/travel-plans/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const plan = data.travelPlan;

      // Transform to match frontend format
      return {
        id: plan._id,
        name: plan.name,
        description: plan.description,
        startLocation: plan.startLocation,
        startLocationData: plan.startLocationData,
        endLocation: plan.endLocation,
        endLocationData: plan.endLocationData,
        startDate: plan.startDate,
        endDate: plan.endDate,
        travelers: plan.travelers.map(t => t._id || t),
        createdAt: plan.createdAt,
        activities: plan.activities.map(item => transformItem(item)),
        hotels: plan.hotels.map(item => transformItem(item)),
        restaurants: plan.restaurants.map(item => transformItem(item)),
        attractions: plan.attractions.map(item => transformItem(item)),
        transportation: plan.transportation.map(item => transformItem(item)),
      };
    } catch (error) {
      console.error('Error fetching travel plan:', error);
      return null;
    }
  };

  const transformItem = (item) => ({
    id: item._id,
    name: item.name,
    description: item.description,
    location: item.location,
    locationData: item.locationData,
    date: item.date,
    checkIn: item.checkIn,
    checkOut: item.checkOut,
    price: item.price,
    notes: item.notes,
    travelers: item.travelers?.map(t => t._id || t) || [],
    createdAt: item.createdAt,
  });

  const addTravelPlan = async (plan, travelerIds = []) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_BASE_URL}/travel-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...plan,
          travelers: travelerIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create travel plan');
      }

      // Refresh travel plans
      await fetchAllData();

      return data.travelPlan._id;
    } catch (error) {
      console.error('Error creating travel plan:', error);
      throw error;
    }
  };

  const updateTravelPlan = async (id, updates) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_BASE_URL}/travel-plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update travel plan');
      }

      // Refresh travel plans
      await fetchAllData();
    } catch (error) {
      console.error('Error updating travel plan:', error);
      throw error;
    }
  };

  const deleteTravelPlan = async (id) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_BASE_URL}/travel-plans/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete travel plan');
      }

      // Refresh travel plans
      await fetchAllData();
    } catch (error) {
      console.error('Error deleting travel plan:', error);
      throw error;
    }
  };

  const getTravelPlan = async (id) => {
    // Always fetch from API to ensure we have the latest data with items
    return await fetchTravelPlan(id);
  };

  const addItemToTravelPlan = async (planId, itemType, item) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_BASE_URL}/travel-items/plan/${planId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...item,
          itemType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add item');
      }

      // Refresh the specific travel plan
      const updatedPlan = await fetchTravelPlan(planId);
      if (updatedPlan) {
        setTravelPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p));
      }
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  };

  const deleteItemFromTravelPlan = async (planId, itemType, itemId) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_BASE_URL}/travel-items/plan/${planId}/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete item');
      }

      // Refresh the specific travel plan
      const updatedPlan = await fetchTravelPlan(planId);
      if (updatedPlan) {
        setTravelPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  };

  const updateItemInTravelPlan = async (planId, itemType, itemId, updates) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_BASE_URL}/travel-items/plan/${planId}/item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update item');
      }

      // Refresh the specific travel plan
      const updatedPlan = await fetchTravelPlan(planId);
      if (updatedPlan) {
        setTravelPlans(prev => prev.map(p => p.id === planId ? updatedPlan : p));
      }
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  };

  // Global Travelers Management
  const addGlobalTraveler = async (traveler) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_BASE_URL}/travelers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(traveler),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create traveler');
      }

      // Refresh travelers
      await fetchAllData();

      return {
        id: data.traveler._id,
        name: data.traveler.name,
        email: data.traveler.email,
        dateOfBirth: data.traveler.dateOfBirth,
        passportNumber: data.traveler.passportNumber,
        profilePicture: data.traveler.profilePicture,
        createdAt: data.traveler.createdAt,
      };
    } catch (error) {
      console.error('Error creating traveler:', error);
      throw error;
    }
  };

  const updateGlobalTraveler = async (travelerId, updates) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_BASE_URL}/travelers/${travelerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update traveler');
      }

      // Refresh travelers
      await fetchAllData();
    } catch (error) {
      console.error('Error updating traveler:', error);
      throw error;
    }
  };

  const deleteGlobalTraveler = async (travelerId) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_BASE_URL}/travelers/${travelerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete traveler');
      }

      // Remove traveler from all travel plans locally
      setTravelPlans(prevPlans => {
        const updatedPlans = prevPlans.map(plan => ({
          ...plan,
          travelers: (plan.travelers || []).filter(id => id !== travelerId),
        }));
        return updatedPlans;
      });

      // Refresh travelers
      await fetchAllData();
    } catch (error) {
      console.error('Error deleting traveler:', error);
      throw error;
    }
  };

  // Travel Plan Travelers Management
  const addTravelerToTrip = async (planId, travelerId) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_BASE_URL}/travel-plans/${planId}/travelers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ travelerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add traveler to trip');
      }

      // Refresh travel plans
      await fetchAllData();
    } catch (error) {
      console.error('Error adding traveler to trip:', error);
      throw error;
    }
  };

  const removeTravelerFromTrip = async (planId, travelerId) => {
    if (!token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_BASE_URL}/travel-plans/${planId}/travelers`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ travelerId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove traveler from trip');
      }

      // Refresh travel plans
      await fetchAllData();
    } catch (error) {
      console.error('Error removing traveler from trip:', error);
      throw error;
    }
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
        globalTravelers,
        loading,
        error,
        addTravelPlan,
        updateTravelPlan,
        deleteTravelPlan,
        getTravelPlan,
        addItemToTravelPlan,
        deleteItemFromTravelPlan,
        updateItemInTravelPlan,
        addGlobalTraveler,
        updateGlobalTraveler,
        deleteGlobalTraveler,
        addTravelerToTrip,
        removeTravelerFromTrip,
        getTripTravelers,
        refreshData: fetchAllData,
      }}
    >
      {children}
    </TravelContext.Provider>
  );
};
