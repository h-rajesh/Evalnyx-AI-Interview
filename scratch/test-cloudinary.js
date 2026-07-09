const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
  console.log("Configured Cloudinary with cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
  const buffer = Buffer.from("dummy pdf content %PDF-1.4 ...");
  
  console.log("Attempting upload as 'raw'...");
  try {
    const start = Date.now();
    const resRaw = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "evalnyx/test", resource_type: "raw" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
    console.log("Uploaded as 'raw' in", Date.now() - start, "ms. Result:", resRaw.secure_url);
  } catch (err) {
    console.error("Failed to upload as 'raw':", err);
  }

  console.log("\nAttempting upload as 'image'...");
  try {
    const start = Date.now();
    const resImg = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "evalnyx/test", resource_type: "image", public_id: "test_pdf.pdf" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
    console.log("Uploaded as 'image' in", Date.now() - start, "ms. Result:", resImg.secure_url);
  } catch (err) {
    console.error("Failed to upload as 'image':", err);
  }
}

run();
