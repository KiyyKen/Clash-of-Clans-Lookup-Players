require("dotenv").config({ quiet: true });

const PORT = process.env.PORT || 3000;
const COC_API_KEY = process.env.COC_API_KEY;

module.exports = {
  PORT,
  COC_API_KEY,
};

