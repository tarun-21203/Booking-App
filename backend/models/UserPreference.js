import mongoose from "mongoose";

const UserPreferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    preferredCities: [{
        city: String,
        weight: {
            type: Number,
            default: 1,
            min: 0,
            max: 5
        }
    }],
    preferredHotelTypes: [{
        type: {
            type: String,
            required: true
        },
        weight: {
            type: Number,
            default: 1,
            min: 0,
            max: 5
        }
    }],
    priceRange: {
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 10000
        }
    },
    preferredAmenities: [{
        amenity: String,
        importance: {
            type: Number,
            default: 1,
            min: 0,
            max: 5
        }
    }],
    ratingPreference: {
        type: Number,
        min: 0,
        max: 5,
        default: 3
    },
    travelStyle: {
        type: String,
        enum: ['business', 'leisure', 'family', 'romantic', 'adventure', 'budget', 'luxury'],
        default: 'leisure'
    },
    groupSize: {
        adults: {
            type: Number,
            default: 2
        },
        children: {
            type: Number,
            default: 0
        }
    },
    bookingPatterns: {
        advanceBookingDays: {
            type: Number,
            default: 30
        },
        averageStayDuration: {
            type: Number,
            default: 2
        },
        seasonalPreference: [{
            season: {
                type: String,
                enum: ['spring', 'summer', 'autumn', 'winter']
            },
            weight: {
                type: Number,
                default: 1
            }
        }]
    }
}, {
    timestamps: true
});

export default mongoose.model("UserPreference", UserPreferenceSchema);
