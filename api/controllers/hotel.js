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

// ROUTE 4: Get an existing hotel using GET "/api/hotels/find/:id"
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
        const hotels = await Hotel.find();
        res.status(200).json(hotels);
    } catch (error) {
        next(error);
    }
}

// ROUTE 6: Get all existing hotels (City wise) using GET "/api/hotels/countByCity?cities=x,y,z"
// GET ALL 
export const countByCity = async (req, res, next)=> {

    // split function is used to make array of cities
    const cities = req.query.cities.split(",")
    try {
        // Promise.all in JavaScript is a built-in functional method that takes in an array of promises as input and returns a single promise only after resolving all the promises of the input array in sequential order
        const list = await Promise.all(cities.map(city=>{
            return Hotel.countDocuments({city:city});
        }))
        res.status(200).json(list);
    } catch (error) {
        next(error);
    }
}

// ROUTE 7: Get all existing hotels (Type wise) using GET "/api/hotels/countByType"
// GET ALL 
export const countByType = async (req, res, next)=> {

    const hotelCount = await Hotel.countDocuments({type: "Hotel"});
    const apartmentCount = await Hotel.countDocuments({type: "Apartment"});
    const resortCount = await Hotel.countDocuments({type: "Resort"});
    const villaCount = await Hotel.countDocuments({type: "Villa"});
    const cabinCount = await Hotel.countDocuments({type: "Cabin"});

    try {
        res.status(200).json([
            { type:"Hotels", count:hotelCount },
            { type:"Apartments", count:apartmentCount },
            { type:"Resorts", count:resortCount },
            { type:"Villas", count:villaCount },
            { type:"Cabins", count:cabinCount },
        ]);
    } catch (error) {
        next(error);
    }
}

// ROUTE 8: Get all existing featured hotels using GET "/api/hotels/featured?featured=true&limit=4"
// GET ALL
export const getFeaturedHotels = async (req, res, next)=> {

    const { min, max, limit, ...others } = req.query;

    try {
        const hotels = await Hotel.find({ ...others, cheapestPrice: { $gt: min | 1, $lt: max || 999 }}).limit(limit);
        res.status(200).json(hotels);
    } catch (error) {
        next(error);
    }
}