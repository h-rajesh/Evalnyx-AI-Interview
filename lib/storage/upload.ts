import cloudinary from "./cloudinary";
import { UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";

export async function uploadImage(
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));

        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}