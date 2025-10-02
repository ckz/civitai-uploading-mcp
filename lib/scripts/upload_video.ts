import * as fs from 'fs';
import * as path from 'path';

const uploadFiles = async (filePaths: string[], apiKey: string): Promise<void> => {
  for (const filePath of filePaths) {
    try {
      console.log(`Uploading ${filePath}...`);
      // Create FormData for each file
      const formData = new FormData();

      // Read the file
      const fileBuffer = fs.readFileSync(filePath);
      const fileBlob = new Blob([fileBuffer]);
      const fileName = path.basename(filePath);
      formData.append('images', fileBlob, fileName);

      // Make the POST request to Civitai API
      const response = await fetch('https://civitai.com/api/v1/images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed for ${fileName}: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`Upload successful for ${fileName}:`, result);
    } catch (error) {
      console.error(`Error uploading ${filePath}:`, error);
    }
  }
};

// Usage example
const apiKey = 'bbd180c86f1854a3df95529dc67c3cb7';
const filePaths = [
  './videos/2025-09-28T07-42-22-045Z-qy6r0z.jpg',
  './videos/02175904537017000000000000000000000ffffac145a08ca236a.mp4'
];
uploadFiles(filePaths, apiKey);