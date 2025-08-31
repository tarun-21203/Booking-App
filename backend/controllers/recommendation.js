import axios from "axios";
import Hotel from "../models/Hotel.js";
import UserInteraction from "../models/UserInteraction.js";
import UserPreference from "../models/UserPreference.js";
import { createError } from "../utils/error.js";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// Get personalized hotel recommendations
export const getPersonalizedRecommendations = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { limit = 10, city, priceRange, minRating, type, amenities } = req.query;
        
        // Prepare filters
        const filters = {};
        if (city) filters.city = city;
        if (priceRange) {
            const [min, max] = priceRange.split(',').map(Number);
            filters.priceRange = { min, max };
        }
        if (minRating) filters.minRating = parseFloat(minRating);
        if (type) filters.type = type;
        if (amenities) filters.amenities = amenities.split(',');
        
        // Call ML service
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/recommendations/personalized`, {
            userId,
            limit: parseInt(limit),
            filters
        });
        
        const recommendations = mlResponse.data.recommendations;
        
        // Format response for frontend
        const formattedRecommendations = recommendations.map(rec => ({
            hotel: rec.hotel,
            score: rec.score,
            reasons: rec.reasons,
            explanation: generateExplanation(rec.reasons)
        }));
        
        res.status(200).json({
            recommendations: formattedRecommendations,
            total: formattedRecommendations.length,
            userId
        });
        
    } catch (error) {
        if (error.response) {
            // ML service error
            return next(createError(error.response.status, error.response.data.error));
        }
        next(error);
    }
};

// Get similar hotels
export const getSimilarHotels = async (req, res, next) => {
    try {
        const { hotelId } = req.params;
        const { limit = 5 } = req.query;
        
        // Call ML service
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/recommendations/similar`, {
            hotelId,
            limit: parseInt(limit)
        });
        
        const similarHotels = mlResponse.data.similar_hotels;
        
        res.status(200).json({
            similar_hotels: similarHotels,
            total: similarHotels.length,
            hotelId
        });
        
    } catch (error) {
        if (error.response) {
            return next(createError(error.response.status, error.response.data.error));
        }
        next(error);
    }
};

// Get trending hotels
export const getTrendingHotels = async (req, res, next) => {
    try {
        const { limit = 10, city } = req.query;
        
        // Call ML service
        const mlResponse = await axios.get(`${ML_SERVICE_URL}/recommendations/trending`, {
            params: { limit: parseInt(limit), city }
        });
        
        const trendingHotels = mlResponse.data.trending_hotels;
        
        res.status(200).json({
            trending_hotels: trendingHotels,
            total: trendingHotels.length
        });
        
    } catch (error) {
        if (error.response) {
            return next(createError(error.response.status, error.response.data.error));
        }
        next(error);
    }
};

// Get user profile analysis
export const getUserProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;
        
        // Call ML service
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/analytics/user-profile`, {
            userId
        });
        
        const userProfile = mlResponse.data.user_profile;
        
        res.status(200).json({
            user_profile: userProfile,
            userId
        });
        
    } catch (error) {
        if (error.response) {
            return next(createError(error.response.status, error.response.data.error));
        }
        next(error);
    }
};

// Retrain ML models
export const retrainModels = async (req, res, next) => {
    try {
        const { model_type = 'all' } = req.body;
        
        // Call ML service
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/models/retrain`, {
            model_type
        });
        
        res.status(200).json({
            message: "Models retrained successfully",
            result: mlResponse.data.result
        });
        
    } catch (error) {
        if (error.response) {
            return next(createError(error.response.status, error.response.data.error));
        }
        next(error);
    }
};

// Get recommendations for home page
export const getHomePageRecommendations = async (req, res, next) => {
    try {
        const { userId } = req.query;
        
        let recommendations = {};
        
        // Get trending hotels
        const trendingResponse = await axios.get(`${ML_SERVICE_URL}/recommendations/trending`, {
            params: { limit: 8 }
        });
        recommendations.trending = trendingResponse.data.trending_hotels;
        
        // Get personalized recommendations if user is logged in
        if (userId) {
            try {
                const personalizedResponse = await axios.post(`${ML_SERVICE_URL}/recommendations/personalized`, {
                    userId,
                    limit: 8
                });
                recommendations.personalized = personalizedResponse.data.recommendations;
            } catch (error) {
                // If personalized recommendations fail, use popular hotels
                console.log('Personalized recommendations failed, using trending instead');
            }
        }
        
        // Get popular hotels by city
        const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'];
        recommendations.by_city = {};
        
        for (const city of cities) {
            try {
                const cityResponse = await axios.get(`${ML_SERVICE_URL}/recommendations/trending`, {
                    params: { limit: 4, city }
                });
                recommendations.by_city[city] = cityResponse.data.trending_hotels;
            } catch (error) {
                // Fallback to database query
                const cityHotels = await Hotel.find({ city })
                    .sort({ rating: -1, reviewCount: -1 })
                    .limit(4);
                recommendations.by_city[city] = cityHotels.map(hotel => ({
                    hotel,
                    reason: 'popular_in_city'
                }));
            }
        }
        
        res.status(200).json(recommendations);
        
    } catch (error) {
        next(error);
    }
};

// Enhanced hotel search with ML recommendations
export const getEnhancedHotelSearch = async (req, res, next) => {
    try {
        const { city, min, max, userId } = req.query;
        
        // Get basic search results
        const searchFilter = { city };
        if (min || max) {
            searchFilter.cheapestPrice = {};
            if (min) searchFilter.cheapestPrice.$gte = parseInt(min);
            if (max) searchFilter.cheapestPrice.$lte = parseInt(max);
        }
        
        const hotels = await Hotel.find(searchFilter).sort({ rating: -1 });
        
        // If user is logged in, get personalized ranking
        if (userId && hotels.length > 0) {
            try {
                const hotelIds = hotels.map(h => h._id.toString());
                
                // Get personalized scores for these hotels
                const personalizedResponse = await axios.post(`${ML_SERVICE_URL}/recommendations/personalized`, {
                    userId,
                    limit: 50,
                    filters: { city }
                });
                
                const personalizedHotels = personalizedResponse.data.recommendations;
                const scoreMap = {};
                
                personalizedHotels.forEach(rec => {
                    scoreMap[rec.hotel._id] = rec.score;
                });
                
                // Sort hotels by personalized score
                hotels.sort((a, b) => {
                    const scoreA = scoreMap[a._id.toString()] || 0;
                    const scoreB = scoreMap[b._id.toString()] || 0;
                    return scoreB - scoreA;
                });
                
            } catch (error) {
                console.log('Personalized ranking failed, using default sorting');
            }
        }
        
        res.status(200).json(hotels);
        
    } catch (error) {
        next(error);
    }
};

// Helper function to generate explanation for recommendations
function generateExplanation(reasons) {
    const explanations = {
        'content_similarity': 'Based on hotels you\'ve viewed before',
        'collaborative_filtering': 'Users with similar preferences also liked this',
        'trending': 'Popular choice this week',
        'popular': 'Highly rated by other users'
    };
    
    const primaryReason = reasons[0];
    return explanations[primaryReason] || 'Recommended for you';
}
