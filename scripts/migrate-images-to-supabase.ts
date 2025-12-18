import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import sharp from 'sharp'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface ImageMigrationResult {
  filename: string
  originalSize: number
  compressedSize: number
  publicUrl: string
  success: boolean
  error?: string
}

async function compressImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1200, 1200, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .png({ quality: 80, compressionLevel: 9 })
    .toBuffer()
}

async function uploadImageToSupabase(
  filename: string,
  imageBuffer: Buffer
): Promise<{ publicUrl: string; error?: string }> {
  const filePath = `product-images/${filename}`

  try {
    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      return { publicUrl: '', error: uploadError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath)

    return { publicUrl }
  } catch (error) {
    return { publicUrl: '', error: (error as Error).message }
  }
}

async function migrateImages() {
  console.log('🚀 Starting image migration to Supabase...\n')

  const imagesDir = join(process.cwd(), 'public', 'product-images')
  const imageFiles = readdirSync(imagesDir).filter(file => 
    file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
  )

  console.log(`📦 Found ${imageFiles.length} images to migrate\n`)

  const results: ImageMigrationResult[] = []

  for (const filename of imageFiles) {
    console.log(`Processing: ${filename}`)
    
    try {
      const imagePath = join(imagesDir, filename)
      const originalBuffer = readFileSync(imagePath)
      const originalSize = originalBuffer.length

      console.log(`  Original size: ${(originalSize / 1024).toFixed(2)} KB`)

      // Compress image
      const compressedBuffer = await compressImage(originalBuffer)
      const compressedSize = compressedBuffer.length
      const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1)

      console.log(`  Compressed size: ${(compressedSize / 1024).toFixed(2)} KB (${compressionRatio}% reduction)`)

      // Upload to Supabase
      const { publicUrl, error } = await uploadImageToSupabase(filename, compressedBuffer)

      if (error) {
        console.log(`  ❌ Upload failed: ${error}\n`)
        results.push({
          filename,
          originalSize,
          compressedSize,
          publicUrl: '',
          success: false,
          error
        })
      } else {
        console.log(`  ✅ Uploaded successfully`)
        console.log(`  URL: ${publicUrl}\n`)
        results.push({
          filename,
          originalSize,
          compressedSize,
          publicUrl,
          success: true
        })
      }
    } catch (error) {
      console.log(`  ❌ Error: ${(error as Error).message}\n`)
      results.push({
        filename,
        originalSize: 0,
        compressedSize: 0,
        publicUrl: '',
        success: false,
        error: (error as Error).message
      })
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Migration Summary')
  console.log('='.repeat(60))

  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log(`✅ Successful: ${successful.length}`)
  console.log(`❌ Failed: ${failed.length}`)

  if (successful.length > 0) {
    const totalOriginal = successful.reduce((sum, r) => sum + r.originalSize, 0)
    const totalCompressed = successful.reduce((sum, r) => sum + r.compressedSize, 0)
    const totalSavings = ((1 - totalCompressed / totalOriginal) * 100).toFixed(1)

    console.log(`\n💾 Total original size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`)
    console.log(`💾 Total compressed size: ${(totalCompressed / 1024 / 1024).toFixed(2)} MB`)
    console.log(`📉 Total space saved: ${totalSavings}%`)
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed uploads:')
    failed.forEach(r => {
      console.log(`  - ${r.filename}: ${r.error}`)
    })
  }

  // Generate URL mapping for updating code
  console.log('\n' + '='.repeat(60))
  console.log('🔗 URL Mapping (for reference)')
  console.log('='.repeat(60))
  successful.forEach(r => {
    console.log(`/product-images/${r.filename} → ${r.publicUrl}`)
  })

  console.log('\n✨ Migration complete!')
}

migrateImages().catch(console.error)
