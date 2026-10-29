const express = require("express");
const path = require("path");
const { PORT } = require("./config");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

// Serve static frontend assets (HTML, CSS, JS, Images)
app.use(express.static(path.join(__dirname, "..", "public")));

// Mount API routes
app.use(apiRoutes);

// Start server when run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
