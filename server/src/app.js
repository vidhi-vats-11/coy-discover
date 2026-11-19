const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const apiRoutes = require("./routes/apiRoutes");
const openapi = require("./docs/openapi.json");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Coy Discover API is running" });
});

// API docs (Swagger UI) at /docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.get("/openapi.json", (req, res) => res.json(openapi));

app.use("/", apiRoutes);

module.exports = app;
