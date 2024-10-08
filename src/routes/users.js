import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET all users
router.get("/", async (req, res) => {
  const { username, email } = req.query;

  let whereClause = {};

  if (username) {
    whereClause.username = username;
  }

  if (email) {
    whereClause.email = email;
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
    },
  });

  res.json(users);
});

// POST new user
router.post("/", authMiddleware, async (req, res) => {
  const { username, password, name, email, phoneNumber, pictureUrl } = req.body;
  const newUser = await prisma.user.create({
    data: {
      username,
      password, // Note: In a real application, you should hash this password
      name,
      email,
      phoneNumber,
      pictureUrl,
    },
  });
  res.status(201).json(newUser);
});

// GET single user
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      phoneNumber: true,
      pictureUrl: true,
    },
  });
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// PUT update user
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { username, name, email, phoneNumber, pictureUrl } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { username, name, email, phoneNumber, pictureUrl },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(404).json({ error: "User not found" });
  }
});

// DELETE user
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: "User not found" });
  }
});

export default router;
