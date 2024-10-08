import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET all properties
router.get("/", async (req, res) => {
  const { location, pricePerNight, amenities } = req.query;

  let whereClause = {};

  if (location) {
    whereClause.location = { contains: location };
  }

  if (pricePerNight) {
    whereClause.pricePerNight = { lte: parseFloat(pricePerNight) };
  }

  if (amenities) {
    whereClause.amenities = {
      some: {
        name: { in: amenities.split(",") },
      },
    };
  }

  const properties = await prisma.property.findMany({
    where: whereClause,
    include: { amenities: true, reviews: true },
  });

  res.json(properties);
});

// POST new property
router.post("/", authMiddleware, async (req, res) => {
  const {
    hostId,
    title,
    description,
    location,
    pricePerNight,
    bedroomCount,
    bathRoomCount,
    maxGuestCount,
    rating,
  } = req.body;
  const newProperty = await prisma.property.create({
    data: {
      hostId,
      title,
      description,
      location,
      pricePerNight,
      bedroomCount,
      bathRoomCount,
      maxGuestCount,
      rating,
    },
  });
  res.status(201).json(newProperty);
});

// GET single property
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: { amenities: true, reviews: true, bookings: true },
  });
  if (property) {
    res.json(property);
  } else {
    res.status(404).json({ error: "Property not found" });
  }
});

// PUT update property
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    location,
    pricePerNight,
    bedroomCount,
    bathRoomCount,
    maxGuestCount,
    rating,
  } = req.body;
  try {
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        title,
        description,
        location,
        pricePerNight,
        bedroomCount,
        bathRoomCount,
        maxGuestCount,
        rating,
      },
    });
    res.json(updatedProperty);
  } catch (error) {
    res.status(404).json({ error: "Property not found" });
  }
});

// DELETE property
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.property.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: "Property not found" });
  }
});

export default router;
