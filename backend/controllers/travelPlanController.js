const TravelPlan = require('../models/TravelPlan');
const TravelItem = require('../models/TravelItem');

// Get all travel plans for the authenticated user
exports.getTravelPlans = async (req, res) => {
  try {
    const plans = await TravelPlan.find({ userId: req.userId })
      .populate('travelers')
      .sort({ createdAt: -1 });

    // Get item counts for each plan
    const plansWithItems = await Promise.all(
      plans.map(async (plan) => {
        const items = await TravelItem.find({ travelPlanId: plan._id });
        const itemCounts = {
          activities: items.filter(i => i.itemType === 'activities').length,
          hotels: items.filter(i => i.itemType === 'hotels').length,
          restaurants: items.filter(i => i.itemType === 'restaurants').length,
          attractions: items.filter(i => i.itemType === 'attractions').length,
          transportation: items.filter(i => i.itemType === 'transportation').length,
        };
        return {
          ...plan.toObject(),
          ...itemCounts,
        };
      })
    );

    res.json({
      success: true,
      travelPlans: plansWithItems,
    });
  } catch (error) {
    console.error('Get travel plans error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

// Get a single travel plan with all items
exports.getTravelPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await TravelPlan.findOne({ _id: id, userId: req.userId })
      .populate('travelers');

    if (!plan) {
      return res.status(404).json({ error: 'Travel plan not found' });
    }

    // Get all items for this plan
    const items = await TravelItem.find({ travelPlanId: plan._id })
      .populate('travelers')
      .sort({ createdAt: 1 });

    // Organize items by type
    const organizedItems = {
      activities: items.filter(i => i.itemType === 'activities'),
      hotels: items.filter(i => i.itemType === 'hotels'),
      restaurants: items.filter(i => i.itemType === 'restaurants'),
      attractions: items.filter(i => i.itemType === 'attractions'),
      transportation: items.filter(i => i.itemType === 'transportation'),
    };

    res.json({
      success: true,
      travelPlan: {
        ...plan.toObject(),
        ...organizedItems,
      },
    });
  } catch (error) {
    console.error('Get travel plan error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

// Create a new travel plan
exports.createTravelPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      startLocation,
      startLocationData,
      endLocation,
      endLocationData,
      startDate,
      endDate,
      travelers,
    } = req.body;

    if (!name || !startLocation || !endLocation) {
      return res.status(400).json({
        error: 'Name, start location, and end location are required',
      });
    }

    // Note: travelers array can be empty initially, but we'll validate on the frontend

    const plan = await TravelPlan.create({
      userId: req.userId,
      name,
      description: description || '',
      startLocation,
      startLocationData: startLocationData || null,
      endLocation,
      endLocationData: endLocationData || null,
      startDate: startDate || null,
      endDate: endDate || null,
      travelers: travelers || [],
    });

    const populatedPlan = await TravelPlan.findById(plan._id).populate('travelers');

    res.status(201).json({
      success: true,
      travelPlan: populatedPlan,
    });
  } catch (error) {
    console.error('Create travel plan error:', error);
    res.status(500).json({
      error: 'Server error during travel plan creation',
      message: error.message,
    });
  }
};

// Update a travel plan
exports.updateTravelPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const plan = await TravelPlan.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('travelers');

    if (!plan) {
      return res.status(404).json({ error: 'Travel plan not found' });
    }

    res.json({
      success: true,
      travelPlan: plan,
    });
  } catch (error) {
    console.error('Update travel plan error:', error);
    res.status(500).json({
      error: 'Server error during travel plan update',
      message: error.message,
    });
  }
};

// Delete a travel plan
exports.deleteTravelPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await TravelPlan.findOne({ _id: id, userId: req.userId });

    if (!plan) {
      return res.status(404).json({ error: 'Travel plan not found' });
    }

    // Delete all items associated with this plan
    await TravelItem.deleteMany({ travelPlanId: id });

    // Delete the plan
    await TravelPlan.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Travel plan deleted successfully',
    });
  } catch (error) {
    console.error('Delete travel plan error:', error);
    res.status(500).json({
      error: 'Server error during travel plan deletion',
      message: error.message,
    });
  }
};

// Add traveler to travel plan
exports.addTravelerToPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { travelerId } = req.body;

    if (!travelerId) {
      return res.status(400).json({ error: 'Traveler ID is required' });
    }

    const plan = await TravelPlan.findOne({ _id: id, userId: req.userId });

    if (!plan) {
      return res.status(404).json({ error: 'Travel plan not found' });
    }

    // Check if traveler is already in the plan
    const travelerExists = plan.travelers.some(
      tid => tid.toString() === travelerId.toString()
    );
    if (travelerExists) {
      return res.json({
        success: true,
        travelPlan: await TravelPlan.findById(id).populate('travelers'),
      });
    }

    plan.travelers.push(travelerId);
    await plan.save();

    const populatedPlan = await TravelPlan.findById(id).populate('travelers');

    res.json({
      success: true,
      travelPlan: populatedPlan,
    });
  } catch (error) {
    console.error('Add traveler to plan error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

// Remove traveler from travel plan
exports.removeTravelerFromPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { travelerId } = req.body;

    if (!travelerId) {
      return res.status(400).json({ error: 'Traveler ID is required' });
    }

    const plan = await TravelPlan.findOne({ _id: id, userId: req.userId });

    if (!plan) {
      return res.status(404).json({ error: 'Travel plan not found' });
    }

    if (plan.travelers.length === 1) {
      return res.status(400).json({
        error: 'At least one traveler must remain in the travel plan',
      });
    }

    plan.travelers = plan.travelers.filter(
      (tid) => tid.toString() !== travelerId.toString()
    );
    await plan.save();

    const populatedPlan = await TravelPlan.findById(id).populate('travelers');

    res.json({
      success: true,
      travelPlan: populatedPlan,
    });
  } catch (error) {
    console.error('Remove traveler from plan error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};
