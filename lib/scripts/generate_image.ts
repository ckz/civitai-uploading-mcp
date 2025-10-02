import 'dotenv/config';

const apiKey = process.env.COMET_API_KEY;

if (!apiKey) {
  throw new Error('COMET_API_KEY is not set in environment variables');
}

interface GenerateImageRequest {
  model: string;
  prompt: string;
  image?: string;
  response_format: string;
  size: string;
  guidance_scale?: number;
  watermark: boolean;
  n: number;
  sequential_image_generation?: string;
  stream?: boolean;
}

interface GenerateImageResponse {
  model: string;
  created: number;
  data: Array<{ url: string }>;
  usage: {
    generated_images: number;
    output_tokens: number;
    total_tokens: number;
  };
}

async function generateImage(request: GenerateImageRequest): Promise<GenerateImageResponse> {
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

// Example usage
async function main() {
  try {
    const result = await generateImage({
      model: "bytedance-seedream-4-0-250828",
      prompt: "A beautiful landscape with mountains and a lake at sunset.",
      response_format: "url",
      size: "2K",
      watermark: false,
      n: 1
    });

    console.log('Generated image URL:', result.data[0].url);
  } catch (error) {
    console.error('Error generating image:', error);
  }
}

main();