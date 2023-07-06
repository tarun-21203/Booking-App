import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import { createError } from "../utils/error.js"



// ROUTE 1: Create room using POST "/api/rooms/:hotelid".
// CREATE
export const createRoom = async (req, res, next)=> {
    const hotelId = req.params.hotelid;
    const newRoom = new Room(req.body);

    try {
        const savedRoom = await newRoom.save();
        try {
            await Hotel.findByIdAndUpdate(hotelId, { $push: { rooms: savedRoom._id }});
        } catch (error) {
            next(error);
        }
        res.status(200).json(savedRoom);
    } catch (error) {
        next(error);
    }
}

// ROUTE 2: Update an existing room using PUT "/api/rooms/:id".
// UPDATE
export const updateRoom = async (req, res, next)=> {
    try {
        const updateRoom = await Room.findByIdAndUpdate(req.params.id, { $set: req.body}, { new: true})
        res.status(200).json(updateRoom);
    } catch (error) {
        next(error);
    }
}

// ROUTE 3: Delete an existing room using DELETE "/api/rooms/:id/:hotelid"
// DELETE
export const deleteRoom = async (req, res, next)=> {
    const hotelId = req.params.hotelid;
    try {
        await Room.findByIdAndDelete(req.params.id);
        try {
            await Hotel.findByIdAndUpdate(hotelId, { $pull: { rooms: req.params.id }});
        } catch (error) {
            next(error);
        }
        res.status(200).json("Room has been deleted.");
    } catch (error) {
        next(error);
    }
}

// ROUTE 4: Get an existing room using GET "/api/rooms/:id"
// GET
export const getRoom = async (req, res, next)=> {
    try {
        const room = await Room.findById(req.params.id)
        res.status(200).json(room);
    } catch (error) {
        next(error);
    }
}

// ROUTE 5: Get all existing rooms using GET "/api/rooms"
// GET ALL
export const getRooms = async (req, res, next)=> {
    try {
        const rooms = await Room.find()
        res.status(200).json(rooms);
    } catch (error) {
        next(error);
    }
}