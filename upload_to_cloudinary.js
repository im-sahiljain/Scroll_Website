const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Parse .env manually to avoid needing the dotenv package
try {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
  const env = Object.fromEntries(
    envContent.split('\n')
      .filter(line => line.includes('='))
      .map(line => {
        const [key, ...rest] = line.split('=');
        return [key.trim(), rest.join('=').trim()];
      })
  );

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
} catch (e) {
  console.error("Failed to read .env file. Please make sure it exists.");
  process.exit(1);
}

const FRAMES_PER_PART = 192;
const PARTS = 4;

async function uploadImages() {
  console.log("Starting upload to Cloudinary...");
  let globalIndex = 0;

  for (let part = 1; part <= PARTS; part++) {
    const folderPath = path.join(__dirname, 'public', `part${part}`);
    
    for (let local = 1; local <= FRAMES_PER_PART; local++) {
      const num = String(local).padStart(3, "0");
      const fileName = `ezgif-frame-${num}.jpg`;
      const filePath = path.join(folderPath, fileName);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        continue;
      }

      const formattedGlobalNum = String(globalIndex).padStart(3, "0");
      const publicId = `building/frame-${formattedGlobalNum}`;

      try {
        console.log(`Uploading ${filePath} as ${publicId}...`);
        
        // Upload to Cloudinary sequentially to avoid rate limits
        // We set format to webp for better optimization as requested
        await cloudinary.uploader.upload(filePath, {
          public_id: publicId,
          folder: "building",
          use_filename: false,
          unique_filename: false,
          overwrite: true,
          format: "webp" // convert to webp on upload
        });
        
        console.log(`Successfully uploaded ${publicId}`);
      } catch (error) {
        console.error(`Error uploading ${fileName}:`, error);
      }
      
      globalIndex++;
    }
  }
  console.log("Finished uploading all images!");
}

uploadImages();
