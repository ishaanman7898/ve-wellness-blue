import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = 'https://quygevwkhlggdifdqqto.supabase.co/storage/v1/object/public/products'

const productsFilePath = join(process.cwd(), 'src', 'data', 'products.ts')
let content = readFileSync(productsFilePath, 'utf-8')

// Replace all /product-images/ references with Supabase URLs
content = content.replace(
  /["']\/product-images\/([\w-]+\.png)["']/g,
  `"${SUPABASE_URL}/product-images/$1"`
)

writeFileSync(productsFilePath, content, 'utf-8')

console.log('✅ Updated all product image URLs in src/data/products.ts')
console.log(`   Local paths → ${SUPABASE_URL}/product-images/`)
