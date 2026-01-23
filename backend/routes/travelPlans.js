const express = require('express');
const router = express.Router();
const travelPlanController = require('../controllers/travelPlanController');
const authenticate = require('../middleware/auth');

router.get('/', authenticate, travelPlanController.getTravelPlans);
router.get('/:id', authenticate, travelPlanController.getTravelPlan);
router.post('/', authenticate, travelPlanController.createTravelPlan);
router.put('/:id', authenticate, travelPlanController.updateTravelPlan);
router.delete('/:id', authenticate, travelPlanController.deleteTravelPlan);
router.post('/:id/travelers', authenticate, travelPlanController.addTravelerToPlan);
router.delete('/:id/travelers', authenticate, travelPlanController.removeTravelerFromPlan);

module.exports = router;
