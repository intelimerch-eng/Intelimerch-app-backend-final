// ── Load env FIRST — before any other require ──
require("dotenv").config();

// ── Now safe to require everything else ──
const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middleware/error.middleware");
const routes = require("./routes/index");
const connectDB = require("./config/database");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
  
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// configuration
const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

// middlewares
app.use(cors());
app.use(express.json());

app.use("/api/v1/", routes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/", (req, res) => res.write("Welcome to Intelimerch"));
app.use(errorMiddleware); // should remain last element on the list

// ── Boot sequence — DB first, THEN listen ──
const PORT = process.env.PORT || 6000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Cannot start server — DB connection failed:", err.message);
    process.exit(1);
  }
}

start();