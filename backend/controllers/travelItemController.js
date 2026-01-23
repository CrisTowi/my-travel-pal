const TravelItem = require('../models/TravelItem');
const TravelPlan = require('../models/TravelPlan');

// Get all items for a travel plan
exports.getTravelItems = async (req, res) => {
  try {
    const { planId } = req.params;

    // Verify the plan belongs to the user
    const plan = await TravelPlan.findOne({ _id: planId, userId: req.userId });
    if (!plan) {
      return res.status(404).json({ error: 'Travel plan not found' });
    }

    const items = await TravelItem.find({ travelPlanId: planId })
      .populate('travelers')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error('Get travel items error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

// Create a new travel item
exports.createTravelItem = async (req, res) => {
  try {
    const { planId } = req.params;
    const itemData = req.body;

    // Verify the plan belongs to the user
    const plan = await TravelPlan.findOne({ _id: planId, userId: req.userId });
    if (!plan) {
      return res.status(404).json({ error: 'Travel plan not found' });
    }

    if (!itemData.itemType || !itemData.name) {
      return res.status(400).json({
        error: 'Item type and name are required',
      });
    }

    const validTypes = ['activities', 'hotels', 'restaurants', 'attractions', 'transportation'];
    if (!validTypes.includes(itemData.itemType)) {
      return res.status(400).json({
        error: 'Invalid item type',
      });
    }

    const item = await TravelItem.create({
      travelPlanId: planId,
      userId: req.userId,
      ...itemData,
    });

    const populatedItem = await TravelItem.findById(item._id).populate('travelers');

    res.status(201).json({
      success: true,
      item: populatedItem,
    });
  } catch (error) {
    console.error('Create travel item error:', error);
    res.status(500).json({
      error: 'Server error during item creation',
      message: error.message,
    });
  }
};

// Update a travel item
exports.updateTravelItem = async (req, res) => {
  try {
    const { planId, itemId } = req.params;
    const updates = req.body;

    // Verify the plan belongs to the user
    const plan = await TravelPlan.findOne({ _id: planId, userId: req.userId });
    if (!plan) {
      return res.status(404).json({ error: 'Travel plan not found' });
    }

    const item = await TravelItem.findOneAndUpdate(
      { _id: itemId, travelPlanId: planId, userId: req.userId },
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('travelers');

    if (!item) {
      return res.status(404).json({ error: 'Travel item not found' });
    }

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error('Update travel item error:', error);
    res.status(500).json({
      error: 'Server error during item update',
      message: error.message,
    });
  }
};

// Delete a travel item
exports.deleteTravelItem = async (req, res) => {
  try {
    const { planId, itemId } = req.params;

    // Verify the plan belongs to the user
    const plan = await TravelPlan.findOne({ _id: planId, userId: req.userId });
    if (!plan) {
      return res.status(404).json({ error: 'Travel plan not found' });
    }

    const item = await TravelItem.findOneAndDelete({
      _id: itemId,
      travelPlanId: planId,
      userId: req.userId,
    });

    if (!item) {
      return res.status(404).json({ error: 'Travel item not found' });
    }

    res.json({
      success: true,
      message: 'Travel item deleted successfully',
    });
  } catch (error) {
    console.error('Delete travel item error:', error);
    res.status(500).json({
      error: 'Server error during item deletion',
      message: error.message,
    });
  }
};
