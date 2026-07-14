import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function cloudinaryReady() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

// Upload a base64 data-URL avatar; returns the hosted URL.
export async function uploadAvatar(dataUrl, userId) {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: "devprep/avatars",
    public_id: userId,          // one image per user — re-upload overwrites
    overwrite: true,
    invalidate: true,
    transformation: [
      { width: 256, height: 256, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });
  return result.secure_url;
}

export async function deleteAvatar(userId) {
  await cloudinary.uploader.destroy(`devprep/avatars/${userId}`, { invalidate: true });
}
