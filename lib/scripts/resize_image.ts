import 'dotenv/config';

const apiKey = process.env.COMET_API_KEY;

if (!apiKey) {
  throw new Error('COMET_API_KEY is not set in environment variables');
}

interface ResizeImageRequest {
  model: string;
  prompt: string;
  image: string; // URL
  response_format: string;
  size: string; // e.g., "1440x2560" for 9:16
  guidance_scale?: number;
  watermark: boolean;
  n: number;
}

interface ResizeImageResponse {
  model: string;
  created: number;
  data: Array<{ url: string }>;
  usage: {
    generated_images: number;
    output_tokens: number;
    total_tokens: number;
  };
}

async function resizeImage(request: ResizeImageRequest): Promise<ResizeImageResponse> {
  const response = await fetch('https://api.cometapi.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

// Example usage: resize to 9:16 and add c29 watermark
async function main() {
  try {
    const result = await resizeImage({
      model: "bytedance-seedream-4-0-250828",
      prompt: "Crop the image to a 9:16 aspect ratio while keeping the main subject centered and intact. Add a subtle, semi-transparent watermark reading \"c29\" in the bottom-right corner. Ensure every other part of the image remains unchanged.",
      image: process.env.IMAGE_URL || "https://example.com/image.jpg", // Replace with actual image URL
      response_format: "url",
      size: "1440x2560", // 9:16 aspect ratio
      watermark: false, // since we're adding custom watermark
      n: 1
    });

    console.log('Resized and watermarked image URL:', result.data[0].url);
  } catch (error) {
    console.error('Error resizing image:', error);
  }
}

main();