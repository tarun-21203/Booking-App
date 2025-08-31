import express from "express";
import { 
    trackInteraction, 
    getUserInteractions, 
    getUserPreferences, 
    setUserPreferences,
    createBooking,
    getUserBookings,
    updateBooking
} from "../controllers/interaction.js";
import { verifyToken, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

// ROUTE 1: Track user interaction using POST "/api/interactions/track"
router.post("/track", trackInteraction);

// ROUTE 2: Get user interactions using GET "/api/interactions/user/:userId"
router.get("/user/:userId", verifyUser, getUserInteractions);

// ROUTE 3: Get user preferences using GET "/api/interactions/preferences/:userId"
router.get("/preferences/:userId", verifyUser, getUserPreferences);

// ROUTE 4: Update user preferences using PUT "/api/interactions/preferences/:userId"
router.put("/preferences/:userId", verifyUser, setUserPreferences);

// ROUTE 5: Create booking using POST "/api/interactions/bookings"
router.post("/bookings", verifyToken, createBooking);

// ROUTE 6: Get user bookings using GET "/api/interactions/bookings/:userId"
router.get("/bookings/:userId", verifyUser, getUserBookings);

// ROUTE 7: Update booking using PUT "/api/interactions/bookings/:bookingId"
router.put("/bookings/:bookingId", verifyToken, updateBooking);

export default router;
