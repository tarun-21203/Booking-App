import Hotel from "../models/Hotel.js";

// ROUTE 1: Create hotel using POST "/api/hotels".
// CREATE
export const createHotel = async (req, res, next)=> {
    
    const newHotel = new Hotel(req.body);

    try {
        const savedHotel = await newHotel.save();
        res.status(200).json(savedHotel);
    } catch (error) {
        next(error);
    }
}

// ROUTE 2: Update an existing hotel using PUT "/api/hotels/:id".
// UPDATE
export const updateHotel = async (req, res, next)=> {
    try {
        const updateHotel = await Hotel.findByIdAndUpdate(req.params.id, { $set: req.body}, { new: true})
        res.status(200).json(updateHotel);
    } catch (error) {
        next(error);
    }
}

// ROUTE 3: Delete an existing hotel using DELETE "/api/hotels/:id"
// DELETE
export const deleteHotel = async (req, res, next)=> {
    try {
        await Hotel.findByIdAndDelete(req.params.id)
        res.status(200).json("Hotel has been deleted.");
    } catch (error) {
        next(error);
    }
}

// ROUTE 4: Get an existing hotel using GET "/api/hotels/:id"
// GET
export const getHotel = async (req, res, next)=> {
    try {
        const hotel = await Hotel.findById(req.params.id)
        res.status(200).json(hotel);
    } catch (error) {
        next(error);
    }
}

// ROUTE 5: Get all existing hotels using GET "/api/hotels"
// GET ALL
export const getHotels = async (req, res, next)=> {
    try {
        const hotels = await Hotel.find()
        res.status(200).json(hotels);
    } catch (error) {
        next(error);
    }
}