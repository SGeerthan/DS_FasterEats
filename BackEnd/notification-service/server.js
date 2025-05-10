const express = require("express");
const axios = require("axios");
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
// Replace with your actual API key from Textit.biz
const TEXTIT_API_KEY = "221dgkd16105d0905dtd1a53adh8733";

app.post("/send-sms", async (req, res) => {
  const { to, message } = req.body;

  try {
    const response = await axios.post(
      "https://api.textit.biz/",
      {
        to,
        text: message,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*", // Accept all types; '/' alone is not valid
          "X-API-VERSION": "v1",
          Authorization: `Basic ${TEXTIT_API_KEY}`, // Use backticks for template literal
        },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("SMS Error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ success: false, error: error.response?.data || error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`SMS server running on http://localhost:${PORT}`);
});
