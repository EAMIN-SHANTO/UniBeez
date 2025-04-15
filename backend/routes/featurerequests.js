const express = require('express');
const router = express.Router();
const { 
    createFeatureRequest, 
    getFeaturedProducts,
    updateFeatureStatus,
    getFeatureRequestsByProduct
} = require('../controllers/featureproduct.controller');
const { authenticate, isAdmin } = require('../middleware/auth');

router.post('/feature/:id', authenticate, createFeatureRequest);
router.get('/featured', getFeaturedProducts);
router.patch('/feature/:id/status', authenticate, isAdmin, updateFeatureStatus);
router.get('/feature/:id/requests', authenticate, getFeatureRequestsByProduct);

module.exports = router;
