import getCloudinary from '../config/cloudinary.js';
import HttpError from '../utils/httpError.js';

// POST /api/uploads (multipart field "image")
export async function uploadImage(req, res) {
  if (!req.file) throw new HttpError(400, 'No image provided');
  const result = await new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream(
      { folder: 'bd-blog', resource_type: 'image' },
      (err, uploaded) => (err ? reject(err) : resolve(uploaded)),
    );
    stream.end(req.file.buffer);
  });
  res.status(201).json({ url: result.secure_url, publicId: result.public_id });
}
