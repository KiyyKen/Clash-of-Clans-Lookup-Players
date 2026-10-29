require("dotenv").config({ quiet: true });

const PORT = process.env.PORT || 3000;
const COC_API_KEY = process.env.COC_API_KEY;
const COC_API_BASE_URL = process.env.COC_API_BASE_URL;

module.exports = {
  PORT,
  COC_API_KEY,
  COC_API_BASE_URL,
};

