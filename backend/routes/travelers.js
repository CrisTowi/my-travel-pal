const express = require('express');
const router = express.Router();
const travelerController = require('../controllers/travelerController');
const authenticate = require('../middleware/auth');

router.get('/', authenticate, travelerController.getTravelers);
router.post('/', authenticate, travelerController.createTraveler);
router.put('/:id', authenticate, travelerController.updateTraveler);
router.delete('/:id', authenticate, travelerController.deleteTraveler);

module.exports = router;
