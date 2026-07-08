const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "LOADED" : "MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "LOADED" : "MISSING",
});

const fs = require("fs");
const path = require("path");

async function testUpload() {
  try {
    // Create a dummy text buffer representing a raw file
    const buffer = Buffer.from("dummy pdf content");
    
    console.log("Uploading dummy raw file to Cloudinary...");
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "evalnyx/test",
          resource_type: "raw",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });
    
    console.log("Upload Success:", result.secure_url);
  } catch (error) {
    console.error("Upload Error:", error);
  }
}

testUpload();
