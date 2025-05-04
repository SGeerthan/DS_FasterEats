const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const payHereRoutes= require("./routes/payment");
const dotenv = require("dotenv");


dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure CORS
app.use(cors());
app.use(express.json());

// Set up routes
app.use("/payment", payHereRoutes);

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' 'unsafe-inline' https://www.payhere.lk"
  );
  next();
});

app.get('/success', (req, res) => {
  res.send("Payment successful!");
});

app.get('/cancel', (req, res) => {
  res.send("Payment failed!");
});

app.get('/notify', (req, res) => {
  res.send("Payment NOTIFY!");
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});