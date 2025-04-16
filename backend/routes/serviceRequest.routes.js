import express from 'express';
import { createServiceRequest, getAllServiceRequests, getShopsForServiceRequest } from '../controllers/serviceRequest.controller.js';

const router = express.Router();

// Get all service requests
router.get('/', getAllServiceRequests);
router.post('/', createServiceRequest);
// Add new route to get shops for service requests
router.get('/shops', getShopsForServiceRequest);

export default router;