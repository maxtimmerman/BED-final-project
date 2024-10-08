import express from "express";
import dotenv from "dotenv";
import errorHandler from "./src/middleware/errorHandler.js";
import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/users.js";
import hostRoutes from "./src/routes/hosts.js";
import propertyRoutes from "./src/routes/properties.js";
import amenityRoutes from "./src/routes/amenities.js";
import bookingRoutes from "./src/routes/bookings.js";
import reviewRoutes from "./src/routes/reviews.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/test", (req, res) => {
  res.json({ message: "Test route working" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hosts", hostRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/amenities", amenityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

app.use(errorHandler);

export default app;
