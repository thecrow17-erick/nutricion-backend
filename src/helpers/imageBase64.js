import axios from "axios";

export const fetchImageBase64 = async (url= "") => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error('Error fetching the image:', error);
    throw new Error('Unable to fetch the image');
  }
};