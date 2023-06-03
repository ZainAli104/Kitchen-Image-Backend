import express from "express";
import nodemailer from "nodemailer";
import sendGridTransport from "nodemailer-sendgrid-transport";
import * as dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.route("/").get((req, res) => {
  res.status(200).json({ message: "Post route page!" });
});

// CREATE A POST
router.route("/").post(async (req, res) => {
  try {
    const { name, email, message } = req.body;

    console.log(name, email, message);

    const transporter = nodemailer.createTransport(sendGridTransport({
      auth: {
        api_key: process.env.SENDGRID_API_KEY,
      },
    }));

    let mailOptions = {
      to: email,
      from: 'whiteshadowgaming04@gmail.com',
      subject: "AI Kitchen",
      html: `<b>Thanks for your message: ${message}</b>`,
    };

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);

    console.log("Message sent: ", info);

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
});

export default router;
