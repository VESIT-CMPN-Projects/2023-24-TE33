import express from 'express';
import { generateItinerary, createItinerary, updateItinerary } from '../controllers/itineraryController.js';

const router = express.Router();

// Route for generating itinerary automatically
router.post('/generate', generateItinerary);

// Route for creating a new itinerary
router.post('/', createItinerary);

// Route for updating an existing itinerary
router.put('/:id', updateItinerary);

export default router;