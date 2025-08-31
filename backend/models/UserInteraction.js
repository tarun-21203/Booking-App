import mongoose from "mongoose";

const UserInteractionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    interactionType: {
        type: String,
        enum: ['view', 'click', 'search', 'bookmark', 'share'],
        required: true
    },
    searchQuery: {
        city: String,
        checkIn: Date,
        checkOut: Date,
        guests: Number,
        priceRange: {
            min: Number,
            max: Number
        }
    },
    sessionId: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // Time spent viewing in seconds
        default: 0
    },
    deviceInfo: {
        userAgent: String,
        platform: String,
        isMobile: Boolean
    },
    location: {
        ip: String,
        country: String,
        city: String
    }
}, { 
    timestamps: true,
    index: [
        { userId: 1, createdAt: -1 },
        { hotelId: 1, createdAt: -1 },
        { interactionType: 1, createdAt: -1 }
    ]
});

export default mongoose.model("UserInteraction", UserInteractionSchema);
