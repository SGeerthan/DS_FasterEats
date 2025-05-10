const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Replace with your actual API key from Textit.biz
const TEXTIT_API_KEY = "2213gkd1610a3db9adtd23a3adh8723";

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
