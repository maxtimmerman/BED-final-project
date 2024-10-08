import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET all amenities
router.get("/", async (req, res) => {
  const amenities = await prisma.amenity.findMany();
  res.json(amenities);
});

// POST new amenity
router.post("/", authMiddleware, async (req, res) => {
  const { name } = req.body;
  const newAmenity = await prisma.amenity.create({
    data: { name },
  });
  res.status(201).json(newAmenity);
});

// GET single amenity
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const amenity = await prisma.amenity.findUnique({
    where: { id },
  });
  if (amenity) {
    res.json(amenity);
  } else {
    res.status(404).json({ error: "Amenity not found" });
  }
});

// PUT update amenity
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const updatedAmenity = await prisma.amenity.update({
      where: { id },
      data: { name },
    });
    res.json(updatedAmenity);
  } catch (error) {
    res.status(404).json({ error: "Amenity not found" });
  }
});

// DELETE amenity
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.amenity.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: "Amenity not found" });
  }
});

export default router;
