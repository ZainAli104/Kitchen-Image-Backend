import express from "express";
import * as dotenv from "dotenv";
import nodemailer from "nodemailer";
import sendGridTransport from "nodemailer-sendgrid-transport";
import axios from "axios";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const router = express.Router();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

router.route("/").get((req, res) => {
  res.status(200).json({ message: "Post route page" });
});

// POST => /api/v1/post
router.route("/").post(async (req, res) => {
  try {
    const { name, email, imageUrl } = req.body;

    console.log(name, email, imageUrl)

    // if (!name || !email || !imageUrl) {
    //   return res.status(400).json({ message: "Required fields are missing" });
    // }
    
    let imageStream = null;
    if (imageUrl) {
      const response = await axios.get(imageUrl, { responseType: "stream" });
      imageStream = response.data;
    }

    const aiResponse = await openai.createImageVariation(
      imageStream,
      1,
      "1024x1024"
    );

    const image = aiResponse.data.data[0].url;

    const transporter = nodemailer.createTransport(
      sendGridTransport({
        auth: {
          api_key: process.env.SENDGRID_API_KEY,
        },
      })
    );

    const mailOptions = {
      to: email,
      from: "ethan@shouldirenovate.com",
      subject: "ShouldiRenovate - Your Dream Kitchen!",
      html: `<b>Hi ${name},</b><br><br>
      Thanks for using <b>ShouldiRenovate</b> to visualize your dream kitchen!<br><br>
      Our AI has waved its magic wand, and here you go! ⭐<br><br>
      <img src="${image}" alt="Dream Kitchen" style="max-width: 400px;"><br><br>
      Like what you see? Why not make it a reality 👀<br><br>
      Yours truly,<br>
      The ShouldiRenovate team.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
