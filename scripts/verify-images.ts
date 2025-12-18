import { config } from 'dotenv'

config()

const SUPABASE_URL = 'https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products'

const imageFiles = [
  'BO-31.png', 'BO-32.png', 'BO-33.png', 'BO-34.png', 'BO-36.png',
  'BO-37.png', 'BO-38.png', 'BO-39.png', 'BO-40.png', 'BO-41.png',
  'BO-42.png', 'BO-43.png', 'BO-44.png', 'BO-45.png', 'BO-46.png',
  'BO-47.png', 'BO-48.png', 'BO-49.png', 'BO-50.png', 'CA-SC.png',
  'O-AN.png', 'O-DI.png', 'O-IM.png', 'SE-F-1.png', 'SE-F-2.png',
  'SE-F-3.png', 'SU-EL-1.png', 'SU-EL-10.png', 'SU-EL-2.png',
  'SU-EL-3.png', 'SU-EL-4.png', 'SU-EL-5.png', 'SU-EL-7.png',
  'SU-EL-8.png', 'SU-PR-1.png', 'SU-PR-2.png', 'SU-PR-3.png',
  'SU-PR-4.png', 'SU-PR-5.png'
]

async function verifyImages() {
  console.log('🔍 Verifying all images are accessible on Supabase...\n')

  let successCount = 0
  let failCount = 0

  for (const filename of imageFiles) {
    const url = `${SUPABASE_URL}/product-images/${filename}`
    
    try {
      const response = await fetch(url, { method: 'HEAD' })
      
      if (response.ok) {
        const size = response.headers.get('content-length')
        const sizeKB = size ? (parseInt(size) / 1024).toFixed(2) : 'unknown'
        console.log(`✅ ${filename.padEnd(20)} - ${sizeKB} KB`)
        successCount++
      } else {
        console.log(`❌ ${filename.padEnd(20)} - HTTP ${response.status}`)
        failCount++
      }
    } catch (error) {
      console.log(`❌ ${filename.padEnd(20)} - ${(error as Error).message}`)
      failCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Verification Summary')
  console.log('='.repeat(60))
  console.log(`✅ Accessible: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  
  if (failCount === 0) {
    console.log('\n🎉 All images are accessible on Supabase!')
  } else {
    console.log('\n⚠️  Some images failed to load. Check the errors above.')
  }
}

verifyImages().catch(console.error)
