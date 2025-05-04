const UserOrder = require("../model/userOrder"); // Updated model import


exports.getPendingOrders = async (req, res) => {
    try {
      const pendingOrders = await UserOrder.find({ orderStatus: false });
  
      if (pendingOrders.length === 0) {
        return res.status(404).json({ message: "No pending orders found." });
      }
  
      return res.status(200).json(pendingOrders);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  };
  