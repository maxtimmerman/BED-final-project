import express from "express";
import { PrismaClient } from "@prisma/client";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET all hosts
router.get("/", async (req, res) => {
  const { name } = req.query;

  let whereClause = {};

  if (name) {
    whereClause.name = { contains: name };
  }

  const hosts = await prisma.host.findMany({
    where: whereClause,
    include: { listings: true },
  });

  res.json(hosts);
});

// POST new host
router.post("/", authMiddleware, async (req, res) => {
  const { username, password, name, email, phoneNumber, pictureUrl, aboutMe } =
    req.body;
  const newHost = await prisma.host.create({
    data: {
      username,
      password, // Note: In a real application, you should hash this password
      name,
      email,
      phoneNumber,
      pictureUrl,
      aboutMe,
    },
  });
  res.status(201).json(newHost);
});

// GET single host
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const host = await prisma.host.findUnique({
    where: { id },
    include: { listings: true },
  });
  if (host) {
    res.json(host);
  } else {
    res.status(404).json({ error: "Host not found" });
  }
});

// PUT update host
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { username, name, email, phoneNumber, pictureUrl, aboutMe } = req.body;
  try {
    const updatedHost = await prisma.host.update({
      where: { id },
      data: { username, name, email, phoneNumber, pictureUrl, aboutMe },
    });
    res.json(updatedHost);
  } catch (error) {
    res.status(404).json({ error: "Host not found" });
  }
});

// DELETE host
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.host.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: "Host not found" });
  }
});

export default router;
