import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.COMET_API_KEY;

if (!apiKey) {
  throw new Error('COMET_API_KEY is not set in environment variables');
}

interface EditImageRequest {
  model: string;
  prompt: string;
  response_format: string;
  size: string;
  seed?: number;
  guidance_scale?: number;
  watermark?: boolean;
  image: Buffer; // image buffer
  imageName: string; // for content-type
}

interface EditImageResponse {
  model: string;
  created: number;
  data: Array<{ url: string }>;
  usage: {
    generated_images: number;
    output_tokens: number;
    total_tokens: number;
  };
}

async function editImage(request: EditImageRequest): Promise<EditImageResponse> {
  const formData = new FormData();

  formData.append('model', request.model);
  formData.append('prompt', request.prompt);
  formData.append('response_format', request.response_format);
  formData.append('size', request.size);

  if (request.seed !== undefined) {
    formData.append('seed', request.seed.toString());
  }
  if (request.guidance_scale !== undefined) {
    formData.append('guidance_scale', request.guidance_scale.toString());
  }
  if (request.watermark !== undefined) {
    formData.append('watermark', request.watermark.toString());
  }

  // Append image as blob
  const blob = new Blob([new Uint8Array(request.image)], { type: 'image/png' }); // assume png, adjust as needed
  formData.append('image', blob, request.imageName);

  const response = await fetch('https://api.cometapi.com/v1/images/edits', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
      // Content-Type is set automatically for FormData
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Example usage: add "c29" in art form
async function main() {
  try {
    // Assume image is a file path
    const imagePath = 'path/to/your/image.png'; // replace with actual path
    const imageBuffer = fs.readFileSync(imagePath);
    const imageName = path.basename(imagePath);

    const result = await editImage({
      model: "doubao-seededit-3-0-i2i-250628", // or bytedance-seedEdit-3.0-i2i
      prompt: "Add c29 in art form consistent with image style",
      response_format: "url",
      size: "adaptive",
      guidance_scale: 5, // higher for more influence of prompt
      watermark: true,
      image: imageBuffer,
      imageName
    });

    console.log('Edited image URL:', result.data[0].url);
  } catch (error) {
    console.error('Error editing image:', error);
  }
}

// Note: For resizing to 9:16, no direct API found in CometAPI. User can provide sample curl script later.

main();