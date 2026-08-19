const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../FrontEnd")));

app.get("/api", (req, res) => {
  res.json({
    message: "Hello from Node.js!"
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});