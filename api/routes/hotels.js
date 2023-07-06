import express from "express";
import Hotel from "../models/Hotel.js";
import { createHotel, deleteHotel, getHotel, getHotels, updateHotel } from "../controllers/hotel.js";
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


// ROUTE 4: Get an existing hotel using GET "/api/hotels/:id"
// GET
router.get("/:id", getHotel);


// ROUTE 5: Get all existing hotels using GET "/api/hotels"
// GET ALL
router.get("/", getHotels);

export default router