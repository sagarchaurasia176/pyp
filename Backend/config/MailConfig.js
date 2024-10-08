const nodemailer = require("nodemailer");
require("dotenv").config();

//transporter method apply here so we get
const MailConfig = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    // mail transport
    let info = transporter.sendMail({
      from: "PYP by Sagar Chauraisa",
      to: `${email}`, // list of receivers
      subject: `${title}`,
      text: "Pyp",
      body: `${body}`,
    });
    console.log("infor from mail config" , info);
    return info
  } catch (er) {
    console.log("error at mail config" , er);
  }
};

// transporter apply here so we get
module.exports = MailConfig;
