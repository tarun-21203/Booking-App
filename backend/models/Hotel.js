import mongoose from "mongoose";

const HotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    distance: {
        type: String,
        required: true
    },
    photos: {
        type: [String]
    },
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    rooms: {
        type: [String]
    },
    cheapestPrice: {
        type: Number,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    // Enhanced fields for ML processing
    amenities: [{
        type: String,
        enum: ['wifi', 'parking', 'pool', 'gym', 'spa', 'restaurant', 'bar', 'room_service',
            'concierge', 'business_center', 'pet_friendly', 'airport_shuttle', 'laundry',
            'air_conditioning', 'heating', 'balcony', 'kitchen', 'breakfast', 'beach_access']
    }],
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    starRating: {
        type: Number,
        min: 1,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    averageRatings: {
        cleanliness: { type: Number, min: 0, max: 5 },
        service: { type: Number, min: 0, max: 5 },
        location: { type: Number, min: 0, max: 5 },
        value: { type: Number, min: 0, max: 5 }
    },
    policies: {
        checkIn: String,
        checkOut: String,
        cancellation: String,
        petPolicy: String
    },
    nearbyAttractions: [{
        name: String,
        distance: String,
        category: String
    }],
    // ML-specific fields
    tfidfVector: [Number], // Pre-computed TF-IDF vector
    popularityScore: {
        type: Number,
        default: 0
    },
    seasonalPricing: [{
        season: String,
        priceMultiplier: Number
    }]
}, {
    timestamps: true,
    index: [
        { city: 1, type: 1 },
        { rating: -1 },
        { cheapestPrice: 1 },
        { popularityScore: -1 },
        { 'coordinates.latitude': 1, 'coordinates.longitude': 1 }
    ]
})

export default mongoose.model("Hotel", HotelSchema);