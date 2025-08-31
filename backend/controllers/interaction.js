import UserInteraction from "../models/UserInteraction.js";
import UserPreference from "../models/UserPreference.js";
import Booking from "../models/Booking.js";
import { createError } from "../utils/error.js";

// Track user interaction (view, click, search, etc.)
export const trackInteraction = async (req, res, next) => {
    try {
        const { userId, hotelId, interactionType, searchQuery, duration } = req.body;
        
        // Generate session ID if not provided
        const sessionId = req.sessionID || req.headers['x-session-id'] || 
                         req.cookies.sessionId || `session_${Date.now()}_${Math.random()}`;
        
        // Extract device and location info
        const deviceInfo = {
            userAgent: req.headers['user-agent'],
            platform: req.headers['sec-ch-ua-platform'],
            isMobile: /Mobile|Android|iPhone|iPad/.test(req.headers['user-agent'])
        };
        
        const location = {
            ip: req.ip || req.connection.remoteAddress,
            country: req.headers['cf-ipcountry'] || 'Unknown',
            city: req.headers['cf-ipcity'] || 'Unknown'
        };

        const interaction = new UserInteraction({
            userId,
            hotelId,
            interactionType,
            searchQuery,
            sessionId,
            duration: duration || 0,
            deviceInfo,
            location
        });

        await interaction.save();
        
        // Update user preferences based on interaction
        if (userId && interactionType === 'view') {
            await updateUserPreferences(userId, hotelId, searchQuery);
        }

        res.status(200).json({ message: "Interaction tracked successfully" });
    } catch (error) {
        next(error);
    }
};

// Get user interactions for analysis
export const getUserInteractions = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { limit = 50, interactionType, days = 30 } = req.query;
        
        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - days);
        
        const filter = {
            userId,
            createdAt: { $gte: dateFilter }
        };
        
        if (interactionType) {
            filter.interactionType = interactionType;
        }
        
        const interactions = await UserInteraction.find(filter)
            .populate('hotelId', 'name city type rating cheapestPrice amenities')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
            
        res.status(200).json(interactions);
    } catch (error) {
        next(error);
    }
};

// Create or update user preferences
export const updateUserPreferences = async (userId, hotelId, searchQuery) => {
    try {
        if (!userId) return;
        
        let preferences = await UserPreference.findOne({ userId });
        
        if (!preferences) {
            preferences = new UserPreference({ userId });
        }
        
        // Update preferred cities based on search
        if (searchQuery && searchQuery.city) {
            const cityIndex = preferences.preferredCities.findIndex(
                pc => pc.city.toLowerCase() === searchQuery.city.toLowerCase()
            );
            
            if (cityIndex >= 0) {
                preferences.preferredCities[cityIndex].weight += 0.1;
            } else {
                preferences.preferredCities.push({
                    city: searchQuery.city,
                    weight: 1
                });
            }
        }
        
        // Update price range preferences
        if (searchQuery && searchQuery.priceRange) {
            if (searchQuery.priceRange.min) {
                preferences.priceRange.min = Math.min(
                    preferences.priceRange.min, 
                    searchQuery.priceRange.min
                );
            }
            if (searchQuery.priceRange.max) {
                preferences.priceRange.max = Math.max(
                    preferences.priceRange.max, 
                    searchQuery.priceRange.max
                );
            }
        }
        
        // Update group size preferences
        if (searchQuery && searchQuery.guests) {
            preferences.groupSize.adults = searchQuery.guests;
        }
        
        await preferences.save();
    } catch (error) {
        console.error('Error updating user preferences:', error);
    }
};

// Get user preferences
export const getUserPreferences = async (req, res, next) => {
    try {
        const { userId } = req.params;
        
        let preferences = await UserPreference.findOne({ userId });
        
        if (!preferences) {
            preferences = new UserPreference({ userId });
            await preferences.save();
        }
        
        res.status(200).json(preferences);
    } catch (error) {
        next(error);
    }
};

// Update user preferences manually
export const setUserPreferences = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        
        const preferences = await UserPreference.findOneAndUpdate(
            { userId },
            { $set: updateData },
            { new: true, upsert: true }
        );
        
        res.status(200).json(preferences);
    } catch (error) {
        next(error);
    }
};

// Create booking record
export const createBooking = async (req, res, next) => {
    try {
        const bookingData = req.body;
        const booking = new Booking(bookingData);
        
        const savedBooking = await booking.save();
        
        // Track booking interaction
        if (bookingData.userId && bookingData.hotelId) {
            const interaction = new UserInteraction({
                userId: bookingData.userId,
                hotelId: bookingData.hotelId,
                interactionType: 'booking',
                sessionId: req.sessionID || `booking_${Date.now()}`,
                deviceInfo: {
                    userAgent: req.headers['user-agent'],
                    isMobile: /Mobile|Android|iPhone|iPad/.test(req.headers['user-agent'])
                }
            });
            await interaction.save();
        }
        
        res.status(200).json(savedBooking);
    } catch (error) {
        next(error);
    }
};

// Get user bookings
export const getUserBookings = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { status, limit = 20 } = req.query;
        
        const filter = { userId };
        if (status) {
            filter.bookingStatus = status;
        }
        
        const bookings = await Booking.find(filter)
            .populate('hotelId', 'name city type rating photos')
            .populate('roomId', 'title price')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
            
        res.status(200).json(bookings);
    } catch (error) {
        next(error);
    }
};

// Update booking (for ratings, reviews, status changes)
export const updateBooking = async (req, res, next) => {
    try {
        const { bookingId } = req.params;
        const updateData = req.body;
        
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { $set: updateData },
            { new: true }
        ).populate('hotelId', 'name city type');
        
        if (!booking) {
            return next(createError(404, "Booking not found"));
        }
        
        res.status(200).json(booking);
    } catch (error) {
        next(error);
    }
};
