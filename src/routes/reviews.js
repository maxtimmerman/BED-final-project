import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET all reviews
router.get("/", async (req, res) => {
  const reviews = await prisma.review.findMany({
    include: { user: true, property: true },
  });
  res.json(reviews);
});

// POST new review
router.post("/", authMiddleware, async (req, res) => {
  const { userId, propertyId, rating, comment } = req.body;
  const newReview = await prisma.review.create({
    data: {
      userId,
      propertyId,
      rating,
      comment,
    },
  });
  res.status(201).json(newReview);
});

// GET single review
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const review = await prisma.review.findUnique({
    where: { id },
    include: { user: true, property: true },
  });
  if (review) {
    res.json(review);
  } else {
    res.status(404).json({ error: "Review not found" });
  }
});

// PUT update review
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  try {
    const updatedReview = await prisma.review.update({
      where: { id },
      data: { rating, comment },
    });
    res.json(updatedReview);
  } catch (error) {
    res.status(404).json({ error: "Review not found" });
  }
});

// DELETE review
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.review.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: "Review not found" });
  }
});

export default router;
