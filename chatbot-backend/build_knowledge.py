"""
Build comprehensive knowledge base from all website content and training documents
"""
import json
import os
from pathlib import Path

def extract_training_docs():
    """Extract content from training documents"""
    training_dir = Path("Training docs")
    entries = []
    
    if not training_dir.exists():
        print("⚠️  Training docs folder not found")
        return entries
    
    try:
        import PyPDF2
        from docx import Document
    except ImportError:
        print("⚠️  Install PyPDF2 and python-docx: pip install PyPDF2 python-docx")
        return entries
    
    for file_path in training_dir.glob("*"):
        if file_path.is_file():
            content = None
            try:
                if file_path.suffix.lower() == '.pdf':
                    with open(file_path, 'rb') as f:
                        reader = PyPDF2.PdfReader(f)
                        content = "\n".join([page.extract_text() for page in reader.pages])
                elif file_path.suffix.lower() in ['.docx', '.doc']:
                    doc = Document(file_path)
                    content = "\n".join([p.text for p in doc.paragraphs])
                
                if content and content.strip():
                    entries.append({
                        "title": f"Training Document: {file_path.stem}",
                        "content": content.strip()
                    })
                    print(f"  ✅ Extracted: {file_path.name}")
            except Exception as e:
                print(f"  ❌ Error with {file_path.name}: {e}")
    
    return entries

def build_knowledge_base():
    """Build the complete knowledge base"""
    print("🚀 Building comprehensive knowledge base...\n")
    
    knowledge = []
    
    # ============================================
    # COMPANY INFORMATION
    # ============================================
    print("📋 Adding company information...")
    
    knowledge.append({
        "title": "Company Overview - Thrive Wellness",
        "content": """
Thrive Wellness is a Virtual Enterprises International (VEI) educational project for the 2025-2026 academic year.

COMPANY NAME: Thrive Wellness
TYPE: Virtual Enterprises International Educational Project
LOCATION: Aurora, Illinois, USA
ADDRESS: 2590 Ogden Ave, Aurora, IL 60504
EMAIL: thrivewellness.il@veinternational.org
WEBSITE: thrivewellness.com

MISSION: At Thrive, we believe that wellness should be simple, accessible, and sustainable. Our mission is to create innovative products that empower you to live your best life while caring for the planet we all share.

VISION: Revolutionizing wellness through premium, science-backed products.

COMPANY VALUES:
- Health First: Every product is designed with your health and wellness at the forefront
- Sustainability: Committed to reducing environmental impact through sustainable materials and practices
- Quality: Maintaining the highest standards from sourcing to manufacturing
- Community: Building a community of wellness-minded individuals who support and inspire each other
- Pure & Natural: Made with the finest natural ingredients
- Lab Tested: Rigorously tested for quality and safety
- Customer First: Your satisfaction is our priority
- Real Results: Proven effectiveness you can feel

ACHIEVEMENTS:
- Products Available: 15+ active products
- Products Sold: 1500+
- Customers Served: 500+
- Years Strong: 1

This is an educational simulation - products shown are for educational purposes within the VEI ecosystem.
"""
    })
    
    # ============================================
    # CONTACT INFORMATION
    # ============================================
    print("📞 Adding contact information...")
    
    knowledge.append({
        "title": "Contact Information",
        "content": """
THRIVE WELLNESS CONTACT INFORMATION

EMAIL: thrivewellness.il@veinternational.org
This is our primary contact email for all inquiries.

LOCATION:
Thrive Wellness Headquarters
2590 Ogden Ave, Aurora, IL 60504
United States

BUSINESS HOURS:
Monday - Friday: 9:00 AM - 5:00 PM CST
Saturday - Sunday: Closed

RESPONSE TIME:
We typically respond to all inquiries within 24-48 business hours.

DEPARTMENTS:
- Sales Team (CSO Vinanya Penumadula): Product inquiries and orders
- Marketing Team (CMO Mary Howard): Partnerships and collaborations
- Customer Service: General questions and support
- Accounting (CFO Lily Elsea): Billing and financial inquiries
- Creative (CDO Hita Khandelwal): Design and branding questions
- HR (Ethan Hsu, Munis Kodirova, Ryan Lucas): Career inquiries

For urgent matters, please email us directly at thrivewellness.il@veinternational.org
"""
    })
    
    # ============================================
    # LEADERSHIP TEAM
    # ============================================
    print("👥 Adding team information...")
    
    knowledge.append({
        "title": "Leadership Team",
        "content": """
THRIVE WELLNESS LEADERSHIP TEAM

EXECUTIVE LEADERSHIP:

Alice Ho - Chief Executive Officer (CEO)
Leading Thrive's vision with passion for wellness. Alice oversees all company operations and strategic direction.

Lily Elsea - Chief Financial Officer (CFO)
Overseeing financial strategy and growth. Lily leads the Accounting department and manages all financial operations.

Hita Khandelwal - Chief Design Officer (CDO)
Shaping visual identity and UX. Hita leads the Creative department and is responsible for all design and branding.

Macy Evans - Chief Administrative Officer (CAO)
Ensuring operational excellence. Macy manages day-to-day operations and administrative functions.

Mary Howard - Chief Marketing Officer (CMO)
Driving brand awareness. Mary leads the Marketing department and oversees all promotional activities.

Vinanya Penumadula - Chief Sales Officer (CSO)
Leading sales initiatives. Vinanya heads the Sales department and manages customer relationships.
"""
    })
    
    knowledge.append({
        "title": "Department Teams",
        "content": """
THRIVE WELLNESS DEPARTMENTS

ACCOUNTING DEPARTMENT (Led by CFO Lily Elsea):
- Ansh Jain - Financial Analyst: Crunching numbers and forecasting growth with precision
- Siyansh Virmani - Accountant: Keeping the books balanced and the finances flowing
- Alex Wohlfahrt - Financial Associate: Supporting financial operations with attention to detail

CREATIVE DEPARTMENT (Led by CDO Hita Khandelwal):
- Ronika Gajulapalli - Graphic Designer: Bringing bold ideas to life through stunning visuals
- Grace Helbing - UX/UI Designer: Crafting seamless experiences that users love
- Eshan Khan - Creative Director: Leading creative vision with innovation and style

SALES DEPARTMENT (Led by CSO Vinanya Penumadula):
- Dumitru Busuioc - Sales Representative: Building relationships and closing deals with confidence
- Ishaan Manoor - Sales Person: Driving revenue and connecting with customers

MARKETING DEPARTMENT (Led by CMO Mary Howard):
- Reece Clavey - Marketing Specialist: Creating campaigns that resonate and convert
- Eshanvi Sharma - Digital Marketer: Mastering social media and digital engagement
- Carter Shaw - Content Strategist: Telling stories that captivate and inspire action

HUMAN RESOURCES DEPARTMENT:
- Ethan Hsu - HR Specialist: Nurturing talent and fostering a positive culture
- Munis Kodirova - Talent Acquisition: Finding the best people to join our mission
- Ryan Lucas - HR Coordinator: Keeping the team organized and supported

Total Team Members: 20 dedicated professionals
"""
    })
    
    # ============================================
    # PRODUCTS - WATER BOTTLES
    # ============================================
    print("🍶 Adding product information...")
    
    knowledge.append({
        "title": "Water Bottles - Product Line",
        "content": """
THRIVE WELLNESS WATER BOTTLES

THE GLACIER (64oz)
SKU: BO-46
Our largest premium insulated water bottle with 64oz capacity.

Features:
- 64oz capacity - perfect for all-day hydration
- Double-wall vacuum insulation
- Keeps drinks cold for 24+ hours
- Keeps drinks hot for 12+ hours
- BPA-free stainless steel construction
- Leak-proof Ice Cap lid included
- Wide mouth for easy filling and cleaning
- Fits most cup holders
- Durable powder-coated white finish

Perfect for: Gym enthusiasts, office workers, outdoor adventures, anyone wanting maximum hydration capacity.

---

THE ICEBERG (40oz)
SKU: BO-36
Our most popular water bottle with perfect balance of size and portability.

Features:
- 40oz capacity - ideal for workouts and daily use
- Double-wall vacuum insulation
- Keeps drinks cold for 24+ hours
- Keeps drinks hot for 12+ hours
- BPA-free stainless steel construction
- Leak-proof Ice Cap lid included
- Wide mouth for easy filling
- Fits cup holders
- White powder-coated finish

Perfect for: Workouts, daily hydration, students, commuters.

BOTTLE CARE:
- Dishwasher safe (top rack recommended)
- Hand wash with warm soapy water for best results
- Let air dry completely
- All bottles are BPA-free and food-grade safe

Note: For current prices, the chatbot fetches live data from our database.
"""
    })
    
    # ============================================
    # PRODUCTS - SUPPLEMENTS
    # ============================================
    knowledge.append({
        "title": "Supplements - Surge IV Electrolytes",
        "content": """
SURGE IV ELECTROLYTES

Premium electrolyte supplement for rapid hydration and peak performance.

AVAILABLE FLAVORS:
1. Blue Razzberry (SU-EL-1) - Classic blue raspberry flavor
2. Fruit Punch (SU-EL-2) - Delicious fruit punch blend
3. Lemonade (SU-EL-3) - Refreshing lemon flavor, perfect for summer
4. Pina Colada (SU-EL-4) - Tropical vacation-inspired flavor
5. Strawberry (SU-EL-5) - Sweet strawberry, one of our most popular
6. Tropical Vibes (SU-EL-6) - Exotic tropical fruit blend
7. Cucumber Lime (SU-EL-7) - Light and crisp, perfect for hot weather
8. Apple Cider (SU-EL-8) - Fall-inspired warm apple notes

PRODUCT DETAILS:
- Servings: 30 per container
- Formula: Zero sugar
- Contains: Essential minerals (sodium, potassium, magnesium, calcium)
- Flavoring: Natural flavors, no artificial colors

BENEFITS:
- Rapid electrolyte replenishment
- Enhances hydration during workouts
- Supports endurance and stamina
- Helps prevent muscle cramps
- Speeds up recovery time
- Boosts energy levels naturally

USAGE: Mix one scoop with 16-20oz of water. Consume during or after exercise for optimal hydration.

DIETARY INFO: Vegan-friendly, zero sugar, no artificial colors.

Note: For current prices, the chatbot fetches live data from our database.
"""
    })
    
    knowledge.append({
        "title": "Supplements - Peak Protein",
        "content": """
PEAK PROTEIN

Premium whey isolate protein powder for maximum muscle recovery and growth.

AVAILABLE FLAVORS:
1. Chocolate (SU-PR-1) - Rich chocolate flavor, our most popular
2. Vanilla (SU-PR-2) - Classic vanilla, perfect for smoothies
3. Pumpkin Spice (SU-PR-3) - Seasonal favorite, tastes like pumpkin pie

NUTRITION FACTS (per serving):
- Protein: 25g pure whey isolate
- Calories: 120
- Carbohydrates: 2g
- Fat: 1g
- Servings per container: 30

PRODUCT FEATURES:
- Fast-absorbing whey isolate protein
- Mixes easily with no clumps
- Delicious taste that's not too sweet
- Low carb, low fat formula
- No artificial sweeteners
- Gluten-free

BENEFITS:
- Supports muscle growth and repair
- Aids in post-workout recovery
- Helps maintain lean muscle mass
- Satisfies hunger between meals
- Boosts daily protein intake

USAGE: Mix one scoop with 8-12oz of water or milk. Best consumed within 30 minutes after workout or as a meal replacement.

DIETARY INFO: Contains milk ingredients (whey protein). Vegetarian but not vegan. Gluten-free.

Note: For current prices, the chatbot fetches live data from our database.
"""
    })
    
    # ============================================
    # PRODUCTS - ACCESSORIES
    # ============================================
    knowledge.append({
        "title": "Accessories",
        "content": """
THRIVE WELLNESS ACCESSORIES

SHAKER BALL
SKU: O-SB

Essential accessory for mixing protein shakes smoothly.

Features:
- Stainless steel wire whisk design
- Fits all standard shaker bottles
- Creates smooth, lump-free shakes every time
- Durable construction
- Dishwasher safe
- Reusable and long-lasting

Usage: Drop the shaker ball into your bottle with powder and liquid, then shake vigorously for 10-15 seconds. Eliminates powder clumps and mixes supplements evenly.

A must-have for any supplement user!

---

THE ANCHOR (Snack Compartment)
SKU: O-AN

Convenient snack storage that attaches to your water bottle.

Features:
- Secure screw-on attachment
- Airtight seal keeps contents fresh
- BPA-free food-grade plastic
- Easy to clean
- Compatible with most wide-mouth bottles
- Capacity: Holds approximately 2 cups of snacks or supplements

Benefits:
- Carry snacks and hydration together
- Perfect for pre/post-workout nutrition
- Keeps supplements dry and accessible
- Reduces need for extra bags
- Great for hiking, gym, and travel

The perfect companion for your water bottle!

Note: For current prices, the chatbot fetches live data from our database.
"""
    })
    
    # ============================================
    # PRODUCTS - BUNDLES
    # ============================================
    knowledge.append({
        "title": "Bundles - Premium Value Packages",
        "content": """
THRIVE WELLNESS BUNDLES

ALO X THRIVE BUNDLE
SKU: SE-F-1
Premium wellness bundle combining Alo yoga products with Thrive supplements.

INCLUDES:
- Alo Yoga Mat (premium quality)
- Alo Yoga Blocks (set of 2)
- Alo Resistance Bands (set of 3)
- Peak Protein (choice of flavor)
- Surge IV Electrolytes (choice of 2 flavors)
- Thrive Water Bottle (40oz Iceberg)
- Exclusive Alo x Thrive gym bag

Perfect for: Yoga enthusiasts, home workout setups, fitness beginners, gift giving.

---

PELOTON X THRIVE BUNDLE
SKU: SE-F-2
Our most comprehensive fitness package.

INCLUDES:
- Peloton Bike (or Bike+)
- Peloton All-Access Membership (3 months)
- Peloton Cycling Shoes
- Peloton Weights Set
- Peak Protein (3 tubs, all flavors)
- Surge IV Electrolytes (full flavor collection)
- Thrive Water Bottle (64oz Glacier)
- Thrive Shaker Ball
- Exclusive Peloton x Thrive accessories

Perfect for: Serious fitness enthusiasts, home gym setups, cycling lovers, complete wellness transformation.

---

FALL BUNDLE
SKU: SE-F-3
Limited-edition seasonal collection featuring autumn-inspired products.

INCLUDES:
- Peak Protein Pumpkin Spice (2 tubs)
- Surge IV Apple Cider (2 containers)
- Thrive Water Bottle (choice of size)
- Seasonal recipe guide
- Exclusive fall-themed accessories

Perfect for: Fall season enthusiasts, pumpkin spice lovers, seasonal wellness routines, holiday gift giving.

Limited availability - only available during fall season!

Note: For current prices, the chatbot fetches live data from our database.
"""
    })
    
    # ============================================
    # PRODUCT CATEGORIES INFO
    # ============================================
    knowledge.append({
        "title": "Product Categories Overview",
        "content": """
THRIVE WELLNESS - PRODUCT CATEGORIES

WATER BOTTLES:
- The Glacier (64oz) - Our largest bottle for all-day hydration
- The Iceberg (40oz) - Most popular, perfect balance of size and portability

SURGE IV ELECTROLYTES (8 flavors):
- Blue Razzberry, Fruit Punch, Lemonade, Pina Colada
- Strawberry, Tropical Vibes, Cucumber Lime, Apple Cider

PEAK PROTEIN (3 flavors):
- Chocolate (most popular)
- Vanilla
- Pumpkin Spice (seasonal)

ACCESSORIES:
- Shaker Ball - For smooth protein shakes
- The Anchor - Snack compartment attachment

BUNDLES:
- Alo x Thrive Bundle - Yoga + wellness combo
- Peloton x Thrive Bundle - Ultimate fitness package
- Fall Bundle - Seasonal limited edition

For current prices, ask me about any specific product and I'll fetch the latest pricing from our database!
"""
    })
    
    # ============================================
    # SHIPPING INFORMATION
    # ============================================
    print("📦 Adding shipping information...")
    
    knowledge.append({
        "title": "Shipping Information",
        "content": """
THRIVE WELLNESS SHIPPING

SHIPPING OPTIONS:

STANDARD SHIPPING
- Cost: FREE on all orders
- Delivery Time: 5-7 business days
- Description: Our reliable standard shipping option from our Aurora, IL facility. Orders are processed within 1-2 business days.

EXPRESS SHIPPING
- Cost: $9.99
- Delivery Time: 2-3 business days
- Description: Need it faster? Express shipping gets your order to you in no time from our Illinois warehouse.

INTERNATIONAL SHIPPING
- Cost: FREE on all orders
- Delivery Time: 10-14 business days
- Description: We now ship globally from our Aurora headquarters! International rates apply based on destination.

SHIPPING HEADQUARTERS:
2590 Ogden Ave, Aurora, IL 60504

PROCESSING HOURS:
Monday - Friday: 9AM - 5PM CST

ORDER PROCESSING:
All orders are processed at our Illinois headquarters within 1-2 business days before shipping.

SHIPPING COVERAGE:
We ship to all 50 US states and internationally to select countries from our Aurora, IL facility.

DELIVERY ISSUES:
If your package is lost, damaged, or hasn't arrived within the expected timeframe, please contact us at thrivewellness.il@veinternational.org

HOLIDAY SHIPPING:
During peak holiday seasons, shipping times may be slightly longer. We recommend ordering early to ensure timely delivery from our Aurora facility.

Note: This is an educational VEI project - actual shipping is simulated within the VEI ecosystem.
"""
    })
    
    # ============================================
    # FAQ
    # ============================================
    print("❓ Adding FAQ...")
    
    knowledge.append({
        "title": "Frequently Asked Questions (FAQ)",
        "content": """
THRIVE WELLNESS - FREQUENTLY ASKED QUESTIONS

Q: How long does shipping take?
A: Standard shipping takes 5-7 business days within the US. Express shipping (2-3 business days) is available at checkout for $9.99.

Q: What is your return policy?
A: Since our products are tangible wellness items, we do not accept returns. However, if you receive a damaged or defective product, please contact us immediately at thrivewellness.il@veinternational.org for a replacement.

Q: Are your products BPA-free?
A: Yes! All Thrive products are made with BPA-free, food-grade materials that are safe for everyday use.

Q: How do I clean my water bottle?
A: Our bottles are dishwasher safe (top rack). For best results, we recommend hand washing with warm soapy water and letting it air dry.

Q: Do you ship internationally?
A: Yes! We ship to all 50 US states and internationally to select countries. International shipping takes 10-14 business days.

Q: What payment methods do you accept?
A: We accept Visa, MasterCard, American Express, Discover, and other major credit and debit cards. We also support bank transfers and digital payment methods. All transactions are processed through the VEI portal.

Q: Are the supplements vegan?
A: Our Surge IV electrolytes are vegan-friendly. Peak Protein contains whey protein, which is vegetarian but not vegan. Check individual product pages for detailed ingredient information.

Q: What is Thrive Wellness?
A: Thrive Wellness is a Virtual Enterprises International (VEI) educational project. We create premium wellness products including water bottles, supplements, and accessories as part of our business education curriculum.

Q: How can I contact you?
A: Email us at thrivewellness.il@veinternational.org. We typically respond within 24-48 business hours.

Q: Where are you located?
A: Our headquarters is at 2590 Ogden Ave, Aurora, IL 60504.

Q: What are your business hours?
A: Monday - Friday, 9AM - 5PM CST.

Q: Who is the CEO?
A: Alice Ho is our Chief Executive Officer.

Q: What's your most popular product?
A: Peak Protein Chocolate and The Iceberg water bottle are customer favorites!

Q: Do you offer discounts?
A: Yes! Our bundles offer significant savings - up to $500+ off with the Peloton x Thrive Bundle.
"""
    })
    
    # ============================================
    # TRAINING DOCUMENTS
    # ============================================
    print("📄 Extracting training documents...")
    training_entries = extract_training_docs()
    for entry in training_entries:
        knowledge.append(entry)
    
    # ============================================
    # SAVE KNOWLEDGE BASE
    # ============================================
    print(f"\n💾 Saving knowledge base with {len(knowledge)} entries...")
    
    with open('knowledge_base.json', 'w', encoding='utf-8') as f:
        json.dump(knowledge, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Knowledge base built successfully!")
    print(f"   Total entries: {len(knowledge)}")
    print(f"\n🎯 Next step: Run 'python ingest.py' to build the vector index")

if __name__ == "__main__":
    build_knowledge_base()
