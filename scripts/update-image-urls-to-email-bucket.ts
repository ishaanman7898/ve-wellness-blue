import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateImageUrls() {
  try {
    console.log('Fetching all products...')
    
    // Get all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, sku, image_url')
    
    if (fetchError) {
      console.error('Error fetching products:', fetchError)
      return
    }

    console.log(`Found ${products?.length || 0} products`)

    // List all files in email-product-pictures bucket
    const { data: files, error: listError } = await supabase.storage
      .from('email-product-pictures')
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (listError) {
      console.error('Error listing files:', listError)
      return
    }

    console.log(`Found ${files?.length || 0} files in email-product-pictures bucket`)

    let updatedCount = 0
    let notFoundCount = 0

    // Update each product
    for (const product of products || []) {
      // Look for matching file by SKU
      const matchingFile = files?.find(file => 
        file.name.toLowerCase().includes(product.sku.toLowerCase()) ||
        file.name.toLowerCase().replace(/\.(png|jpg|jpeg|webp)$/i, '') === product.sku.toLowerCase()
      )

      if (matchingFile) {
        // Get public URL for the file
        const { data: { publicUrl } } = supabase.storage
          .from('email-product-pictures')
          .getPublicUrl(matchingFile.name)

        // Update product with new image URL
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: publicUrl })
          .eq('id', product.id)

        if (updateError) {
          console.error(`Error updating product ${product.sku}:`, updateError)
        } else {
          console.log(`✓ Updated ${product.sku} -> ${matchingFile.name}`)
          updatedCount++
        }
      } else {
        console.log(`✗ No matching image found for SKU: ${product.sku}`)
        notFoundCount++
      }
    }

    console.log('\n=== Summary ===')
    console.log(`Total products: ${products?.length || 0}`)
    console.log(`Updated: ${updatedCount}`)
    console.log(`Not found: ${notFoundCount}`)
    console.log('\nDone!')

  } catch (error) {
    console.error('Error:', error)
  }
}

updateImageUrls()
