const Traveler = require('../models/Traveler');

// Get all travelers for the authenticated user
exports.getTravelers = async (req, res) => {
  try {
    const travelers = await Traveler.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      travelers,
    });
  } catch (error) {
    console.error('Get travelers error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

// Create a new traveler
exports.createTraveler = async (req, res) => {
  try {
    const { name, email, dateOfBirth, passportNumber, profilePicture } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Traveler name is required' });
    }

    // Validate email if provided
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
      }
    }

    const traveler = await Traveler.create({
      userId: req.userId,
      name,
      email: email || '',
      dateOfBirth: dateOfBirth || null,
      passportNumber: passportNumber || '',
      profilePicture: profilePicture || '',
    });

    res.status(201).json({
      success: true,
      traveler,
    });
  } catch (error) {
    console.error('Create traveler error:', error);
    res.status(500).json({
      error: 'Server error during traveler creation',
      message: error.message,
    });
  }
};

// Update a traveler
exports.updateTraveler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate email if provided
    if (updates.email && updates.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return res.status(400).json({ error: 'Please provide a valid email address' });
      }
    }

    const traveler = await Traveler.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!traveler) {
      return res.status(404).json({ error: 'Traveler not found' });
    }

    res.json({
      success: true,
      traveler,
    });
  } catch (error) {
    console.error('Update traveler error:', error);
    res.status(500).json({
      error: 'Server error during traveler update',
      message: error.message,
    });
  }
};

// Delete a traveler
exports.deleteTraveler = async (req, res) => {
  try {
    const { id } = req.params;

    const traveler = await Traveler.findOneAndDelete({ _id: id, userId: req.userId });

    if (!traveler) {
      return res.status(404).json({ error: 'Traveler not found' });
    }

    // Note: Travel plans and items that reference this traveler will need to be updated
    // This can be handled in a cleanup job or when fetching travel plans

    res.json({
      success: true,
      message: 'Traveler deleted successfully',
    });
  } catch (error) {
    console.error('Delete traveler error:', error);
    res.status(500).json({
      error: 'Server error during traveler deletion',
      message: error.message,
    });
  }
};
