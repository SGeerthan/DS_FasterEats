const PDFDocument = require("pdfkit");

function generateInvoice(order) {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.fontSize(20).text("FasterEats Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order.orderId}`);
    doc.text(`Customer: ${order.firstName} ${order.lastName}`);
    doc.text(`Email: ${order.email}`);
    doc.text(`Address: ${order.deliveryAddress}`);
    doc.moveDown();

    doc.text(`Restaurant: ${order.restaurentName}`);
    doc.text(`Payment Method: ${order.paymentMethod}`);
    doc.text(`Total Amount: LKR ${order.totalAmount.toLocaleString()}`);
    doc.end();
  });
}

module.exports = generateInvoice;
