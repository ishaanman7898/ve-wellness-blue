import { rmSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve))
}

async function cleanup() {
  const imagesDir = join(process.cwd(), 'public', 'product-images')
  
  if (!existsSync(imagesDir)) {
    console.log('❌ Directory public/product-images does not exist.')
    rl.close()
    return
  }

  const files = readdirSync(imagesDir)
  console.log('\n⚠️  WARNING: This will permanently delete local product images!')
  console.log(`📁 Directory: ${imagesDir}`)
  console.log(`📦 Files to delete: ${files.length}`)
  console.log('\nFiles:')
  files.forEach(f => console.log(`  - ${f}`))
  
  console.log('\n✅ Before proceeding, make sure:')
  console.log('  1. You have tested your website and all images load from Supabase')
  console.log('  2. You have deployed to production and verified it works')
  console.log('  3. You have a backup if needed')
  
  const answer = await question('\nAre you sure you want to delete these files? (yes/no): ')
  
  if (answer.toLowerCase() === 'yes') {
    try {
      rmSync(imagesDir, { recursive: true, force: true })
      console.log('\n✅ Successfully deleted public/product-images/')
      console.log('🎉 Local images cleaned up!')
    } catch (error) {
      console.error('\n❌ Error deleting directory:', (error as Error).message)
    }
  } else {
    console.log('\n❌ Cleanup cancelled. No files were deleted.')
  }
  
  rl.close()
}

cleanup().catch(console.error)
