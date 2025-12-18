import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const SUPABASE_STORAGE_URL = `${supabaseUrl}/storage/v1/object/public/products/product-images`

async function syncProductImages() {
  console.log('🔄 Syncing product images with Supabase storage...\n')

  try {
    // Fetch all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')

    if (fetchError) {
      throw fetchError
    }

    if (!products || products.length === 0) {
      console.log('⚠️  No products found in database')
      return
    }

    console.log(`📦 Found ${products.length} products\n`)

    let updated = 0
    let skipped = 0
    let failed = 0

    for (const product of products) {
      const sku = product.sku
      const currentImageUrl = product.image_url
      const expectedImageUrl = `${SUPABASE_STORAGE_URL}/${sku}.png`

      // Check if image already points to Supabase with correct SKU
      if (currentImageUrl === expectedImageUrl) {
        console.log(`✓ ${sku.padEnd(15)} - Already synced`)
        skipped++
        continue
      }

      // Verify image exists in storage
      const imageExists = await fetch(expectedImageUrl, { method: 'HEAD' })
        .then(res => res.ok)
        .catch(() => false)

      if (!imageExists) {
        console.log(`⚠ ${sku.padEnd(15)} - Image not found in storage, skipping`)
        skipped++
        continue
      }

      // Update product with new image URL
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: expectedImageUrl })
        .eq('id', product.id)

      if (updateError) {
        console.log(`❌ ${sku.padEnd(15)} - Failed: ${updateError.message}`)
        failed++
      } else {
        console.log(`✅ ${sku.padEnd(15)} - Updated to Supabase URL`)
        updated++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Sync Summary')
    console.log('='.repeat(60))
    console.log(`✅ Updated: ${updated}`)
    console.log(`✓  Already synced: ${skipped}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`📦 Total: ${products.length}`)

    if (updated > 0) {
      console.log('\n🎉 Products synced successfully!')
    }
  } catch (error) {
    console.error('❌ Error:', (error as Error).message)
    process.exit(1)
  }
}

syncProductImages()
