import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

export function errorMessage(err) {
  return err?.response?.data?.message || err?.message || 'Something went wrong';
}

// Uploads an image to Cloudinary via the API (admin only) -> { url, publicId }
export async function uploadImage(file) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await api.post('/uploads', form);
  return data;
}

export default api;
