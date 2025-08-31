import express from "express";
import { 
    getPersonalizedRecommendations,
    getSimilarHotels,
    getTrendingHotels,
    getUserProfile,
    retrainModels,
    getHomePageRecommendations,
    getEnhancedHotelSearch
} from "../controllers/recommendation.js";
import { verifyToken, verifyUser, verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();

// ROUTE 1: Get personalized recommendations using GET "/api/recommendations/personalized/:userId"
router.get("/personalized/:userId", verifyUser, getPersonalizedRecommendations);

// ROUTE 2: Get similar hotels using GET "/api/recommendations/similar/:hotelId"
router.get("/similar/:hotelId", getSimilarHotels);

// ROUTE 3: Get trending hotels using GET "/api/recommendations/trending"
router.get("/trending", getTrendingHotels);

// ROUTE 4: Get user profile analysis using GET "/api/recommendations/profile/:userId"
router.get("/profile/:userId", verifyUser, getUserProfile);

// ROUTE 5: Get home page recommendations using GET "/api/recommendations/homepage"
router.get("/homepage", getHomePageRecommendations);

// ROUTE 6: Enhanced hotel search with ML using GET "/api/recommendations/search"
router.get("/search", getEnhancedHotelSearch);

// ROUTE 7: Retrain ML models using POST "/api/recommendations/retrain" (Admin only)
router.post("/retrain", verifyAdmin, retrainModels);

export default router;
