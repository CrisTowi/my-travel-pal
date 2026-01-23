const express = require('express');
const router = express.Router();
const travelItemController = require('../controllers/travelItemController');
const authenticate = require('../middleware/auth');

router.get('/plan/:planId', authenticate, travelItemController.getTravelItems);
router.post('/plan/:planId', authenticate, travelItemController.createTravelItem);
router.put('/plan/:planId/item/:itemId', authenticate, travelItemController.updateTravelItem);
router.delete('/plan/:planId/item/:itemId', authenticate, travelItemController.deleteTravelItem);

module.exports = router;
