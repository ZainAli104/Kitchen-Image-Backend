import express from "express";
import * as dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from DALL-E!" });
});

// POST => /api/v1/dalle
router.post("/", async (req, res) => {
  try {
    const { responseId, fields } = req.body.data;

    const emailField = fields.find((field) => field.type === "INPUT_EMAIL");
    const nameField = fields.find((field) => field.type === "INPUT_TEXT");
    const imgFileField = fields.find((field) => field.type === "FILE_UPLOAD");
    
    const email = emailField.value;
    const name = nameField.value;
    const imageUrl = imgFileField.value[0].url;

    // const numberField = fields.find((field) => field.type === "INPUT_PHONE_NUMBER");
    // const number = numberField.value;

    axios.post("https://kitchen-image-backend.vercel.app/api/v1/post", {
      name,
      email,
      imageUrl,
    });

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log("Error => ", error);
    res.status(500).send(error || "Something went wrong");
  }
});

export default router;
