import fs from 'fs';
import Papa from 'papaparse';

const CSV_PATH = String.raw`c:\Users\Ishaan\OneDrive\Desktop\ve-wellness-blue\Products w_ Prices - Products with Prices - Main.csv`;
const TARGET_PATH = String.raw`c:\Users\Ishaan\OneDrive\Desktop\ve-wellness-blue\src\data\products.ts`;

const knownColors = {
    "Blue Razzberry": "#0000FF",
    "Fruit Punch": "#FF4500",
    "Lemonade": "#FFFF00",
    "Pina Colada": "#F0E68C",
    "Strawberry": "#FF69B4",
    "Tropical Vibes": "#FF7F50", // Corrected
    "Tropical Punch": "#FF7F50", // Variant
    "Cucumber Lime": "#90EE90",
    "Apple Cider": "#D2691E",
    "Chocolate": "#3E2723",
    "Vanilla": "#F3E5AB",
    "Black": "#000000",
    "Brown": "#8B4513",
    "Frost Blue": "#87CEEB",
    "Maroon": "#800000",
    "Orange": "#FFA500",
    "White": "#FFFFFF",
    "Pumpkin Spice": "#D2691E",
    "Red": "#FF0000",
    "Blue": "#0000FF",
    "Green": "#008000"
};

try {
    const csvContent = fs.readFileSync(CSV_PATH, 'utf8');

    Papa.parse(csvContent, {
        header: true,
        complete: (results) => {
            const products = results.data
                .filter(row => row['Website Implementation'] && row['Website Implementation'].toUpperCase() === 'TRUE')
                .map(row => {
                    const name = row['Product name'] || "";
                    const sku = row['SKU#'] || "";
                    let type = row['Category'] || "Accessories";

                    // Normalize Category
                    let normalizedCategory = type;
                    if (['Electrolytes', 'Supplements', 'Seasonal'].includes(type)) normalizedCategory = 'Wellness';
                    if (type === 'Water Bottle') normalizedCategory = 'Water Bottles';
                    if (type === 'Bundle') normalizedCategory = 'Bundles';
                    if (type === 'Lids') {
                        normalizedCategory = 'Accessories'; // Group lids with accessories?
                    }

                    // Extract color from name if possible (e.g. "Surge IV (Blue Razzberry)")
                    const colorMatch = name.match(/\((.*?)\)/);
                    // If colorMatch finds "Modified Lid" or "Snack Compartment", we might not want that as a color.
                    // Filter against known colors or simple heuristics.
                    let color = colorMatch ? colorMatch[1] : undefined;

                    // Heuristic: If color is clearly not a color (e.g. "Modified Lid"), ignore it, unless mappable.
                    // However, for bottles it is usually the color.
                    const hexColor = color ? (knownColors[color] || knownColors[color.split(' ')[0]]) : undefined;

                    // Group Name (Before parenthesis)
                    const groupName = name.split('(')[0].trim();

                    // Price cleanup
                    const priceStr = row['Final Price'] ? row['Final Price'].replace(/[$,"]/g, '') : "0";
                    const price = parseFloat(priceStr);

                    // Image Extension - try to detect, but defaulting to .jpg or .png
                    // User mentioned "Product Designs" has PNGs, but code used JPGs.
                    // I will interpret the user's intent to "pull products" as "use these definitions".
                    // I'll stick to .png if that is what they have in the folder they showed initially, OR .jpg if the code expects it. 
                    // In step 15, we saw PNGs.
                    const imagePath = `/product-images/${sku}.png`;

                    return {
                        id: sku.toLowerCase().replace(/_/g, '-'),
                        category: normalizedCategory,
                        name: name,
                        status: row['Product Status'],
                        sku: sku,
                        price: isNaN(price) ? 0 : price,
                        buyLink: row['Buy Button Links'],
                        image: imagePath,
                        groupName: groupName,
                        color: color,
                        hexColor: hexColor
                    };
                });

            // Generate TS content
            // We explicitly leave the interface and categories array as is or updated.
            const tsContent = `export interface Product {
  id: string;
  category: string;
  name: string;
  status: string;
  sku: string;
  price: number;
  buyLink: string;
  image?: string;
  groupName: string;
  color?: string;
  hexColor?: string;
}

export const products: Product[] = ${JSON.stringify(products, null, 2)};

export const categories = ["All", "Wellness", "Water Bottles", "Bundles", "Accessories"];
`;

            fs.writeFileSync(TARGET_PATH, tsContent);
            console.log(`Successfully synced ${products.length} products to ${TARGET_PATH}`);
        },
        error: (err) => {
            console.error("Error parsing CSV:", err);
        }
    });
} catch (error) {
    console.error("Error reading CSV file:", error);
}
