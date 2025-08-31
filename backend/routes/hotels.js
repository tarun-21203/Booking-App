import express from "express";
import Hotel from "../models/Hotel.js";
import { countByCity, countByType, createHotel, deleteHotel, getFeaturedHotels, getHotel, getHotelRooms, getHotels, updateHotel } from "../controllers/hotel.js";
import { verifyAdmin } from "../utils/verifyToken.js";

const router = express.Router();


// ROUTE 1: Create hotel using POST "/api/hotels".
// CREATE
router.post("/", verifyAdmin, createHotel);


// ROUTE 2: Update an existing hotel using PUT "/api/hotels/:id".
// UPDATE
router.put("/:id", verifyAdmin, updateHotel);


// ROUTE 3: Delete an existing hotel using DELETE "/api/hotels/:id"
// DELETE
router.delete("/:id", verifyAdmin, deleteHotel);


// ROUTE 4: Get an existing hotel using GET "/api/hotels/find/:id"
// GET
router.get("/find/:id", getHotel);


// ROUTE 5: Get all existing hotels using GET "/api/hotels"
// GET ALL
router.get("/", getHotels);


// ROUTE 6: Get all existing hotels (City wise) using GET "/api/hotels/countByCity?cities=x,y,z"
// GET ALL 
router.get("/countByCity", countByCity);


// ROUTE 7: Get all existing hotels (Type wise) using GET "/api/hotels/countByType"
// GET ALL 
router.get("/countByType", countByType);


// ROUTE 8: Get all existing featured hotels using GET "/api/hotels/featured?featured=true&limit=4"
// GET ALL
router.get("/featured", getFeaturedHotels);


// ROUTE 9: Get all existing rooms of a hotel using GET "/api/hotels/room/:id"
// GET ALL
router.get("/room/:id", getHotelRooms);

export default router