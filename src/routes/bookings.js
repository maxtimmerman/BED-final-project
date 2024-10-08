import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET all bookings
router.get("/", async (req, res) => {
  const { userId } = req.query;

  let whereClause = {};

  if (userId) {
    whereClause.userId = userId;
  }

  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: { user: true, property: true },
  });

  res.json(bookings);
});

// POST new booking
router.post("/", authMiddleware, async (req, res) => {
  const {
    userId,
    propertyId,
    checkinDate,
    checkoutDate,
    numberOfGuests,
    totalPrice,
    bookingStatus,
  } = req.body;
  const newBooking = await prisma.booking.create({
    data: {
      userId,
      propertyId,
      checkinDate,
      checkoutDate,
      numberOfGuests,
      totalPrice,
      bookingStatus,
    },
  });
  res.status(201).json(newBooking);
});

// GET single booking
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { user: true, property: true },
  });
  if (booking) {
    res.json(booking);
  } else {
    res.status(404).json({ error: "Booking not found" });
  }
});

// PUT update booking
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const {
    checkinDate,
    checkoutDate,
    numberOfGuests,
    totalPrice,
    bookingStatus,
  } = req.body;
  try {
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        checkinDate,
        checkoutDate,
        numberOfGuests,
        totalPrice,
        bookingStatus,
      },
    });
    res.json(updatedBooking);
  } catch (error) {
    res.status(404).json({ error: "Booking not found" });
  }
});

// DELETE booking
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.booking.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: "Booking not found" });
  }
});

export default router;
