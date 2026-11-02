import { v2 as cloudinary } from 'cloudinary';
import HttpError from '../utils/httpError.js';

const REQUIRED = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
let configured = false;

// Configured lazily so env vars are read after dotenv has loaded them
export default function getCloudinary() {
  if (!configured) {
    const missing = REQUIRED.filter((key) => !process.env[key]?.trim());
    if (missing.length) {
      throw new HttpError(500, `Image uploads are not configured: set ${missing.join(', ')} in server/.env and restart the server`);
    }
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    configured = true;
  }
  return cloudinary;
}

export async function deleteImage(publicId) {
  if (!publicId) return;
  try {
    await getCloudinary().uploader.destroy(publicId);
  } catch (err) {
    console.warn(`Could not delete Cloudinary image ${publicId}:`, err.message);
  }
}
