import cloudinary from "./cloudinary";
import { UploadApiResponse } from "cloudinary";
import streamifier from "streamifier";

export async function uploadFile(
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "raw"
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
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

export async function uploadImage(buffer: Buffer, folder: string) {
  return uploadFile(buffer, folder, "image");
}

export async function uploadPdf(buffer: Buffer, folder: string) {
  return uploadFile(buffer, folder, "raw");
}



export async function deleteFile(publicId: string) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
  });
}