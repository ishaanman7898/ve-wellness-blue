import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import heicConvert from 'heic-convert';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertHeicToPng() {
  const inputDir = path.join(__dirname, '..', 'team');
  const outputDir = path.join(__dirname, '..', 'public', 'team');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Clear existing PNG files in the output directory
  const existingPngs = fs.readdirSync(outputDir).filter(file => file.endsWith('.png'));
  for (const file of existingPngs) {
    fs.unlinkSync(path.join(outputDir, file));
    console.log(`Removed: ${file}`);
  }

  // Get all HEIC files
  const files = fs.readdirSync(inputDir).filter(file => file.toLowerCase().endsWith('.heic'));
  
  console.log(`Found ${files.length} HEIC files to convert...`);
  
  for (const file of files) {
    try {
      const inputPath = path.join(inputDir, file);
      const outputFile = file.replace(/\.heic$/i, '.png');
      const outputPath = path.join(outputDir, outputFile);
      
      // Read HEIC file
      const inputBuffer = fs.readFileSync(inputPath);
      
      console.log(`Converting ${file}...`);
      
      // Convert HEIC to PNG buffer
      const outputBuffer = await heicConvert({
        buffer: inputBuffer,
        format: 'PNG',
        quality: 0.8
      });
      
      // Optimize and save PNG
      await sharp(outputBuffer)
        .resize(800, 800, {
          fit: 'cover',
          withoutEnlargement: true
        })
        .toFile(outputPath);
      
      console.log(`✓ Converted ${file} to ${outputFile}`);
    } catch (error) {
      console.error(`Error converting ${file}:`, error.message);
    }
  }
  
  console.log('\nConversion completed!');
}

convertHeicToPng().catch(console.error);
