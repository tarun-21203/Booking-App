import express from "express";
import { verifyAdmin } from "../utils/verifyToken.js";
import { createRoom, deleteRoom, getRoom, getRooms, updateRoom, updateRoomAvailability } from "../controllers/room.js"

const router = express.Router();

// ROUTE 1: Create room using POST "/api/rooms/:hotelid".
// CREATE
router.post("/:hotelid", verifyAdmin ,createRoom);


// ROUTE 2: Update an existing room using PUT "/api/rooms/:id".
// UPDATE
router.put("/:id", verifyAdmin, updateRoom);


// ROUTE 3: Delete an existing room using DELETE "/api/rooms/:id/:hotelid"
// DELETE
router.delete("/:id/:hotelid", verifyAdmin, deleteRoom);


// ROUTE 4: Get an existing room using GET "/api/rooms/:id"
// GET
router.get("/:id", getRoom);


// ROUTE 5: Get all existing rooms using GET "/api/rooms"
// GET ALL
router.get("/", getRooms);


// ROUTE 6: Update an existing room's available dates using PUT "/api/rooms/availability/:id".
// UPDATE
router.put("/availability/:id", updateRoomAvailability);

export default router