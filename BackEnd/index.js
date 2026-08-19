import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import todoRoutes from "./routes/todo.js";
//const express = require("express");
//const path = require("path");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../FrontEnd")));

app.get("/", (req, res) => {
  res.json({
    message: "Hello, we are the TO-DO-LIST team",
  });
});

// API 1 create new todo task
app.use("/todo", todoRoutes);
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
