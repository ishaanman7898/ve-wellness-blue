export const changelogData = [
  {
    version: "2.1.1",
    date: "December 20, 2025",
    type: "Mobile UX & Checkout Improvements",
    items: [
      "Added 'Wellness Made Simple' slogan below THRIVE text on mobile hero section.",
      "Moved entire hero section up on mobile (pt-12 instead of pt-24) for better visual hierarchy.",
      "Automated popup checkout now works on all devices (mobile and desktop).",
      "Updated manual checkout instructions for better clarity.",
      "Removed footer from all cart-related pages (Cart, Checkout Processing, Checkout Loading, Checkout Manual).",
      "Improved mobile bandwidth usage by optimizing checkout flow.",
      "Fixed SPA routing for Team page on Cloudflare Pages.",
      "Enhanced mobile user experience with cleaner layout."
    ]
  },
  {
    version: "2.1.0",
    date: "December 20, 2025",
    type: "Mobile Optimization & Infrastructure",
    items: [
      "Migrated from Vercel to Cloudflare Pages for unlimited bandwidth.",
      "Removed unnecessary dependencies (ngrok, lovable-tagger, gm, sharp, express).",
      "Optimized mobile landing page: removed 'WELLNESS THAT WORKS', simplified to 'THRIVE' with 'Premium wellness products made simple'.",
      "Removed FlippingText animation on mobile for cleaner experience.",
      "Hidden product specifications on mobile for product line pages (only show on product detail pages).",
      "Moved product detail page content down on mobile to prevent navbar overlap.",
      "Disabled mouse trail animation on Team page for mobile devices.",
      "Disabled custom cursor hover descriptions on Team page for mobile.",
      "Hidden video play/pause button on mobile - video auto-plays on all devices.",
      "Centered 'THE THRIVE FACTOR' and 'MADE WITH A CONSCIENCE TO THE WORLD' text on mobile.",
      "Streamlined mobile footer: removed all navigation links, kept logo, tagline, and social icons.",
      "Dynamic changelog version in footer - automatically pulls latest version from changelog data.",
      "Fixed quantity selector positioning on mobile - now horizontal next to Add to Cart button.",
      "Centered checkout processing screen on mobile.",
      "Disabled newsletter popup on mobile devices.",
      "Improved Supabase Realtime integration for instant cache updates.",
      "Reduced bundle size and improved build performance.",
      "All assets now served from Supabase Storage (90% bandwidth reduction)."
    ]
  },
  {
    version: "2.0.2",
    date: "December 19, 2025",
    type: "Team Page & Infrastructure",
    items: [
      "Moved team images from Supabase Storage to local hosting for better reliability.",
      "Improved mouse trail animation with slower, smoother transitions.",
      "Added image preloading and caching for mouse trail effect.",
      "Increased mouse trail gap to 300px for better spacing.",
      "Added creative descriptions for all team members in custom cursor tooltip.",
      "Fixed team image loading issues with proper error handling."
    ]
  },
  {
    version: "2.0.1",
    date: "December 19, 2025",
    type: "UI/UX Improvements",
    items: [
      "Fixed product card tags visibility on Shop page with proper background and text colors.",
      "Updated category tag colors: Wellness (purple), Water Bottles (blue), Bundles (#FF88A1).",
      "Improved color swatch indicators with smart checkmark colors (black for light, white for dark).",
      "Enhanced Product Management reordering UI with drag hints for better UX.",
      "Changed footer branding to display Thrive × VE.png instead of ThriveSocial.",
      "Updated Bundles page hero gradient to #FF88A1.",
      "Made footer × symbol thinner and skinny with proper styling."
    ]
  },
  {
    version: "2.0.0",
    date: "December 19, 2025",
    type: "Major Updates",
    items: [
      "Fixed product line pages (Water Bottles, Supplements) to properly filter out phased out variants from display.",
      "Updated ProductLineSection component to exclude 'Phased Out', 'Removal Requested', and 'Removal Pending' products.",
      "Added cache-busting to product images - images now reload from Supabase on every page navigation.",
      "Fixed issue where phased out water bottle variants still appeared on product line pages despite being removed from shop.",
      "Ensured product management status changes propagate to all product pages, not just the main shop page.",
      "Change Blue Razzberry images and fix sql for Supabase (water bottles got mislabeled) (Ishaan)"
    ]
  },
  {
    version: "1.9.2",
    date: "December 18, 2025",
    type: "Major Updates",
    items: [
      "Replaced Shipments tab with Inventory tab in Product Management for better stock tracking.",
      "Added session management with 30-minute auto-logout for security on Product Management page.",
      "Removed Sort By controls - Product Management now always defaults to manual variant ordering.",
      "Expanded Shop page grid from 4 to 3 columns with increased card height (550px) for better image visibility.",
      "Updated image upload system to use email-product-pictures bucket with automatic SKU-based naming ({SKU}.jpg).",
      "Created SQL trigger to auto-update product image URLs when images are uploaded.",
      "Added Inventory table view showing stock levels, status badges (In Stock/Low Stock/Out of Stock/Backordered), and stock tracking.",
      "Fixed Supplements page to show all Wellness category products (removed group_name filter restriction).",
      "Added 'View Supplements' link in Product Management when Wellness category is selected.",
      "Improved inventory display with stock_bought, stock_left, and status indicators.",
      "Changed image compression from PNG to JPEG format for smaller file sizes.",
      "Added persistent session tracking with activity detection (mouse, keyboard, scroll, touch)."
    ]
  },
  {
    version: "1.9.1",
    date: "December 18, 2025",
    type: "Minor Updates",
    items: [
      "Redesigned Team page with centered cards, proper image positioning (object-contain), and removed animations from department cards.",
      "Updated leadership cards to match department card styling with same hover effects.",
      "Added mouse trail effect to hero section only with square images (140x140px) that fall immediately after appearing.",
      "Completely redesigned About page with dynamic product count from Supabase, 4-stat grid (Products Available, Products Sold, Customers Served, Year Strong).",
      "Added location info to About page: 'Based in Aurora, Illinois, we've been here for one year and counting.'",
      "Updated FAQ: removed 'Track my order' question, changed return policy to no returns for tangible products, updated payment methods.",
      "Fixed Navbar dropdown selection on mobile/smaller devices with proper toggle functionality and smooth animations.",
      "Updated home page slideshow to show 3 water bottles, 3 wellness products, and 2 bundles with black background.",
      "Fixed specifications input focus issue in Product Management - cursor no longer loses focus after each character.",
      "Changed slideshow background from light to black for better contrast."
    ]
  },
  {
    version: "1.9.0",
    date: "December 17, 2025",
    type: "Supabase Tweaks and General Product Management Updates",
    items: [
      "Enhanced Product Management with drag-and-drop variant ordering that works regardless of Sort By filter.",
      "Implemented hover up/down arrows for manual reordering in list view.",
      "Added order numbers on cards in manual mode (grid and list views).",
      "Auto-saves variant order immediately on drag/drop to Supabase.",
      "Fixed edit buttons to properly open product edit modal.",
      "Improved filter UI/UX with better spacing and visual hierarchy.",
      "Fixed color swatches to display properly on all product pages.",
      "Ensured swatches follow variant_order set in ProductManagement.",
      "Updated ProductLineSection to normalize Supabase fields and sort by variant_order.",
      "Made Accessories page pull from Supabase instead of static data.",
      "All product line pages now reflect admin ordering changes.",
      "Added variant_order column to products table for persistent variant ordering."
    ]
  },
  {
    version: "1.8.4",
    date: "December 17, 2025",
    type: "Bug fixes and patches",
    items: [
      "Made checkout popup windows adaptive to different screen sizes with responsive positioning.",
      "Updated checkout popup to position on right side with full screen height.",
      "Added divider to footer brand section for better visual separation.",
      "Enhanced newsletter and mission pages with improved content positioning and matrix dots visibility."
    ]
  },
  {
    version: "1.8.3",
    date: "December 16, 2025",
    type: "Minor Fixes",
    items: [
      "Updated product status filtering to exclude 'Removal Pending' products from shop and detail pages.",
      "Added proper status options in Product Management: In Store, Removal Requested, Removal Pending, Phased Out.",
      "Updated footer branding text to reflect broader product offerings beyond supplements."
    ]
  },
  {
    version: "1.8.1",
    date: "December 16, 2025",
    type: "Updates",
    items: [
      "Improved Navbar responsiveness and animation timing; increased unscrolled height and stabilized dropdown background color.",
      "Removed Accessories category filter from the Shop page.",
      "Updated favicon to use Thrive branding.",
      "Redesigned Shipping page layout and added Aurora, IL location section with embedded map.",
      "Moved Contact and Shipping page content down for better spacing.",
      "Upgraded Product Management UI with Grid/List view toggle and click-to-edit side panel editor."
    ]
  },
  {
    version: "1.8.0",
    date: "December 15, 2025",
    type: "Major Update",
    items: [
      "Added dynamic product specifications backed by Supabase JSONB.",
      "Updated Product Detail to use Supabase data with variant-adaptive description, price, and specifications.",
      "Added specifications editor to Product Management (create + edit).",
      "Enabled product image uploads to Supabase Storage and fixed update flows.",
      "Improved Netlify readiness with environment-based Supabase configuration."
    ]
  },
  {
    version: "1.7.1",
    date: "December 14, 2025",
    type: "Stable Release",
    items: [
      "Refactored Newsletter page with unified Apple-style hero design.",
      "Redesigned Mission page hero and content layout for consistency.",
      "Enhanced Newsletter Popup with 'Cart Test' support and promo code display.",
      "Cleaned up unused page components and assets.",
      "Fixed layout structure issues on Supplements page."
    ]
  },
  {
    version: "1.7.0",
    date: "December 14, 2025",
    type: "Major Update",
    items: [
      "Standardized 'Apple Style' Hero sections across all product pages.",
      "Enhanced Shop page hero design.",
      "Improved 'Explore More' card logic with hover effects and direct variant linking.",
      "Optimized layout for product details (left-aligned actions).",
      "Fixed various layout and navigation consistency issues."
    ]
  },
  {
    version: "1.6.1",
    date: "December 14, 2025",
    type: "Stable Release",
    items: [
      "Added 'New Release' badge to Hero section.",
      "Implemented one-time newsletter popup for new visitors.",
      "Centered team photos in Team page.",
      "Connected Team Login to external portal.",
      "Improved SEO and site performance.",
      "Cleaned up unused assets and code."
    ]
  },
  {
    version: "1.5.0",
    date: "December 10, 2025",
    type: "Dev Push",
    items: [
      "Initial specialized wellness branding.",
      "Added Floating Cart functionality.",
      "Integrated checkout system with automated processing.",
      "Launched Shop and Product Detail pages."
    ]
  },
  {
    version: "1.0.0",
    date: "November 1, 2025",
    type: "Initial Launch",
    items: [
      "Project initialization.",
      "Basic routing and layout setup."
    ]
  }
];
