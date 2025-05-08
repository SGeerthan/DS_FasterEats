const express = require('express');
const mongoose = require('mongoose');
const driverRoutes = require('./routes/driverRoutes');
const userOrderRoutes = require("../delivery-service/routes/userOrder.routes.js");
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const MONGO_URI ="mongodb+srv://krushanth:D7bIfwDG0RRgO4Vr@cluster1.bc9ybae.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/drivers', driverRoutes);
app.use("/api/user-orders", userOrderRoutes);

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
