import express from "express";
import fs from "fs";
// import path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";
// import sharp from "sharp";
import axios from "axios";
import { Configuration, OpenAIApi } from "openai";
import nodemailer from "nodemailer";
import sendGridTransport from "nodemailer-sendgrid-transport";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const router = express.Router();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const upload = multer().none();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from DALL-E!" });
});

router.post("/", upload, async (req, res) => {
  let imagePath = "";
  
  try {
    const { responseId, fields } = req.body.data;

    const emailField = fields.find((field) => field.type === "INPUT_EMAIL");
    const nameField = fields.find((field) => field.type === "INPUT_TEXT");
    const numberField = fields.find((field) => field.type === "INPUT_PHONE_NUMBER");
    const imgFileField = fields.find((field) => field.type === "FILE_UPLOAD");

    const email = emailField.value;
    const name = nameField.value;
    const number = numberField.value;

    let imageStream = null;
    if (imgFileField && imgFileField.value[0] && imgFileField.value[0].url) {
      const imageUrl = imgFileField.value[0].url;
      const response = await axios.get(imageUrl, { responseType: "stream" });
      imageStream = response.data;
    }

    console.log('env: ', process.env.OPENAI_API_KEY);

    const aiResponse = await openai.createImageVariation(
      imageStream,
      1,
      "1024x1024"
    );

    const image = aiResponse.data.data[0].url;

    console.log("Image URL: ", image);

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
    console.log('Error => ', error);
    res.status(500).send(error || "Something went wrong");
  } finally {
    if (imagePath) {
      await fs.promises.unlink(imagePath);
    }
  }
});

export default router;
