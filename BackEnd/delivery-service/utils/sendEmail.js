const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sangsgee14@gmail.com", // Replace with your Gmail
    pass: "ygve egzv ujkm qrfp",   // Use Gmail App Password
  },
});

async function sendEmail({ to, subject, html, attachments = [] }) {
  const mailOptions = {
    from: '"FasterEats" <sangsgee14@gmail.com>',
    to :"rolexultimate23@gmail.com", 
    subject,
    html,
    attachments,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
