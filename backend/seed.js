const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Listing = require('./models/Listing');

const campuses = [
  'Main Campus', 'North Campus', 'South Campus', 'Tech Park', 'Medical Campus',
  'Science Block', 'Engineering Campus', 'Arts Campus', 'Commerce Campus', 'Law Campus'
];

const hostels = [
  'Hostel A', 'Hostel B', 'Hostel C', 'Hostel D', 'Hostel E',
  'Block 1', 'Block 2', 'Block 3', 'Block 4', 'Block 5',
  'Tower A', 'Tower B', 'Tower C', 'Tower D',
  'Phoenix Hall', 'Dragon Hall', 'Eagle Hall', 'Tiger Hall',
  'Boys Hostel 1', 'Girls Hostel 1', 'Boys Hostel 2', 'Girls Hostel 2',
  'Lakeside Hostel', 'Hillview Hostel', 'Garden Hostel', 'Sunrise Hostel'
];

const buildings = [
  '', '', '', 'Block A', 'Block B', 'Block C', 'Wing 1', 'Wing 2',
  'Floor 1', 'Floor 2', 'Floor 3', 'Near Canteen', 'Near Library'
];

const categories = [
  'Books', 'Guides', 'Calculator', 'Engineering Kit', 'Lab Kit',
  'Boneset', 'Stationery', 'Lab Coat', 'Hostel Essentials', 'Electronics',
  'Cycle', 'Furniture', 'Others'
];

const conditions = ['New', 'Good', 'Fair', 'Worn'];
const transactionTypes = ['Free', 'Sell', 'Lend'];

const sellerNames = [
  'Aarav Patel', 'Vivaan Sharma', 'Aditya Mehta', 'Arjun Reddy', 'Sai Kumar',
  'Rohan Gupta', 'Vihaan Singh', 'Kabir Joshi', 'Reyansh Nair', 'Ayaan Khan',
  'Diya Agarwal', 'Ananya Mishra', 'Isha Verma', 'Priya Das', 'Neha Patel',
  'Riya Sharma', 'Kavya Rao', 'Pooja Singh', 'Shreya Bose', 'Aisha Iyer',
  'Rahul Verma', 'Amit Singh', 'Sanjay Kumar', 'Deepak Joshi', 'Manish Tiwari',
  'Pankaj Mehta', 'Suresh Pandey', 'Rajesh Sinha', 'Vikram Chauhan', 'Mohit Bhatia',
  'Sneha Reddy', 'Divya Sharma', 'Komal Gupta', 'Sunita Devi', 'Geeta Kumari',
  'Lata Joshi', 'Meena Singh', 'Sita Patel', 'Rina Das', 'Nita Mishra',
  'Arnav Malhotra', 'Dhruv Chopra', 'Kunal Kapoor', 'Nikhil Bansal', 'Siddharth Jain',
  'Tanvi Shah', 'Meera Pillai', 'Nisha Agarwal', 'Preeti Rao', 'Swati Verma',
  'Vikash Kumar', 'Ravi Shankar', 'Ashish Dubey', 'Naveen Prasad', 'Tarun Mehta',
  'Anjali Nair', 'Bhavna Singh', 'Chitra Iyer', 'Deepa Menon', 'Esha Sharma'
];

const listingData = {
  Books: {
    titles: [
      'Engineering Mathematics Vol 1', 'Data Structures and Algorithms', 'Operating Systems Concepts',
      'Database Management Systems', 'Computer Networks', 'Digital Electronics',
      'Signals and Systems', 'Control Systems', 'Electromagnetic Theory',
      'Thermodynamics Textbook', 'Fluid Mechanics', 'Strength of Materials',
      'Organic Chemistry', 'Physics for Engineers', 'Basic Electronics',
      'Linear Algebra', 'Probability and Statistics', 'Discrete Mathematics',
      'Microprocessors and Interfacing', 'Power Systems', 'Machine Design',
      'Heat Transfer', 'Environmental Engineering', 'Geotechnical Engineering',
      'Structural Analysis', 'Concrete Technology', 'Surveying',
      'Compiler Design', 'Artificial Intelligence', 'Machine Learning',
      'Image Processing', 'VLSI Design', 'Embedded Systems',
      'Biotechnology Principles', 'Genetics Textbook', 'Molecular Biology',
      'Economics for Engineers', 'Engineering Ethics', 'Technical Communication',
      'Introduction to Robotics', 'IoT Fundamentals', 'Cloud Computing',
      'Cybersecurity Basics', 'Blockchain Technology', 'Deep Learning',
      'Quantum Computing Primer', 'Nanotechnology', 'Renewable Energy',
      'Project Management', 'Business Analytics'
    ],
    descriptions: [
      'Comprehensive textbook covering all semester topics. Minimal highlighting.',
      'Well-maintained book with no torn pages. Perfect for exam prep.',
      'Latest edition with online access code unused. Slight wear on cover.',
      'Contains detailed examples and practice problems. Good for self-study.',
      'International edition, same content as regular. Paperback format.',
      'Includes CD with supplementary materials. Barely used.',
      'Hardcover edition with dust jacket. Some notes in margins.',
      'Previous semester textbook. All chapters covered in class notes included.',
      'Reference book with extensive problem sets. Essential for competitive exams.',
      'Complete set for the full course. Both volumes included.'
    ]
  },
  Guides: {
    titles: [
      'Gate Preparation Guide 2025', 'CAT Quantitative Aptitude', 'GRE Vocabulary Builder',
      'Campus Placement Guide', 'Resume Writing Handbook', 'Interview Tips Book',
      'UPSC Prelims Guide', 'Bank Exam Preparation', 'SSC CGL Study Material',
      'JAM Physics Guide', 'GATE Computer Science', 'IES Mechanical Guide',
      'Coding Interview Bible', 'System Design Guide', 'Aptitude Test Prep',
      'Group Discussion Tips', 'HR Interview Questions', 'Technical Interview Guide',
      'Quantitative Aptitude Shortcuts', 'Logical Reasoning Practice'
    ],
    descriptions: [
      'Comprehensive guide with practice tests and previous year papers.',
      'Updated edition with latest pattern changes and strategies.',
      'Covers all sections with detailed explanations and shortcuts.',
      'Includes online mock test access (unused). Very helpful.',
      'Step-by-step approach to cracking competitive exams.'
    ]
  },
  Calculator: {
    titles: [
      'Casio fx-991EX Scientific Calculator', 'Texas Instruments TI-84 Plus',
      'Casio fx-991ES Plus', 'HP 35s Scientific Calculator',
      'Casio fx-570EX ClassWiz', 'Sharp EL-506MB',
      'Casio fx-82MS', 'Canon LS-82TE',
      'Casio fx-100MS', 'Casio fx-991CN X',
      'TI-Nspire CX CAS', 'Casio fx-5800P',
      'Sharp EL-W516TBS', 'Casio fx-350ES Plus'
    ],
    descriptions: [
      'Approved for all exams. Like new condition with original box.',
      'Graphing calculator with fresh batteries. Essential for advanced math.',
      'Multi-function calculator with natural textbook display. Minor scratches.',
      'Programmable calculator. Great for engineering courses.',
      'Scientific calculator with spreadsheet function. Barely used.',
      'Solar powered, never needs batteries. In excellent condition.',
      'Standard scientific calculator for semester exams.',
      'Casio ClassWiz with QR code feature. Current syllabus approved.'
    ]
  },
  'Engineering Kit': {
    titles: [
      'Arduino Uno Starter Kit', 'Raspberry Pi 4 Complete Kit', 'Electronics Component Kit',
      'Soldering Iron Set with Accessories', 'Oscilloscope Portable DSO',
      'Digital Multimeter Fluke', 'PCB Design Kit', 'Robotics Starter Pack',
      'IoT Development Board Kit', 'Embedded Systems Lab Kit',
      'Power Supply Unit Variable', 'Logic Analyzer Kit', 'Breadboard and Jumper Wire Set',
      'Signal Generator', 'LCR Meter'
    ],
    descriptions: [
      'Complete kit with sensors, LEDs, resistors, and project guide. Barely used.',
      'Includes case, power supply, and pre-loaded SD card. Perfect working.',
      'Assorted resistors, capacitors, ICs, and LEDs in organized box.',
      'Temperature-controlled soldering station with stand and tip set.',
      'Portable 4-channel oscilloscope with probe. Lab-quality readings.',
      'Professional-grade multimeter with all accessories and manual.',
      'KiCad design files and PCB fabrication supplies included.',
      'Servo motors, sensors, controller board, and chassis kit.',
      'ESP32 boards, sensors, and cloud platform access included.',
      'ARM Cortex development board with JTAG debugger.'
    ]
  },
  'Lab Kit': {
    titles: [
      'Physics Lab Manual Set', 'Chemistry Lab Coat and Goggles',
      'Electrical Lab Kit', 'Biology Lab Equipment Set',
      'Mechanical Lab Instruments', 'Computer Lab Accessories',
      'Civil Engineering Lab Kit', 'Material Testing Kit',
      'Surveying Instruments Set', 'Fluid Mechanics Lab Apparatus'
    ],
    descriptions: [
      'Complete set of lab manuals with blank record sheets.',
      'Fresh lab coat with safety goggles and gloves. Never used.',
      'Breadboard, connecting wires, and component box.',
      'Microscope slides, stains, and basic dissection kit.',
      'Vernier calipers, micrometer, and measuring instruments.',
      'USB hub, mouse, and keyboard cover for lab use.',
      'Soil testing kit with sieves and hydrometer.',
      'Tensile testing specimens and hardness tester accessories.',
      'Total station basics and leveling staff.',
      'Bernoulli apparatus model and flow measurement tools.'
    ]
  },
  Boneset: {
    titles: [
      'Human Anatomy Boneset', 'Skeleton Model Life Size',
      'Skull Model with Jaw', 'Vertebral Column Model',
      'Hand and Foot Bones Set', 'Pelvis and Rib Cage Model',
      'Dental Anatomy Model', 'Muscle Origin Insertion Model',
      'Joint Model Set', 'Internal Organs Model'
    ],
    descriptions: [
      'Medical-grade boneset with 206 bones. Complete and labeled.',
      'Premium articulated skeleton with stand. Hospital quality.',
      'Detachable jaw skull model for dental and anatomy study.',
      'Detailed vertebral column with disc herniation model.',
      'Paired hand and foot bones with mounting base.',
      'Anatomically correct pelvis and rib cage with sternum.',
      'Full dental arch model showing all tooth types.',
      'Detailed muscle attachment points clearly marked.',
      'Shoulder, knee, hip, and elbow joint models.',
      'Removable organ models on torso stand.'
    ]
  },
  Stationery: {
    titles: [
      'Premium Pen Set', 'Mechanical Pencil Kit', 'Highlighter Set',
      'Notebook Bundle', 'Geometry Box', 'Sticky Notes Pack',
      'Drawing Instruments Set', 'Binder Clips Collection', 'File Folders Pack',
      'Sketch Pens 50 Colors', 'Watercolor Set', 'Whiteboard Markers',
      'A4 Printing Paper Ream', 'Stapler Heavy Duty', 'Paper Cutter',
      'Ruler Set Metal', 'Compass and Protractor Set', 'Glue and Tape Set',
      'Pencil Sharpener Collection', 'Eraser Set Non-Dust'
    ],
    descriptions: [
      'Smooth-writing gel pens in assorted colors. 12-piece set.',
      'Adjustable mechanical pencils with lead refills.',
      'Fluorescent and pastel highlighters. Easy-grip design.',
      'Ruled notebooks with 200 pages each. Pack of 5.',
      'Complete geometry box with compass, divider, and rulers.',
      'Color-coded sticky notes for organizing and studying.',
      'Precision drafting instruments in zipper pouch.',
      'Assorted sizes for organizing documents and projects.',
      'Clear document folders with标签. Pack of 20.',
      'Vibrant sketch pens perfect for presentations and art.'
    ]
  },
  'Lab Coat': {
    titles: [
      'White Lab Coat Cotton', 'Lab Coat with Name Embroidery',
      'Short Lab Coat', 'Disposable Lab Gowns Pack',
      'Lab Coat with Pockets', 'Premium Lab Coat',
      'Chemistry Lab Coat', 'Medical Lab Coat',
      'Lab Coat and Goggles Combo', 'Lab Apron'
    ],
    descriptions: [
      'Standard white cotton lab coat. Size M. Barely worn.',
      'Personalized lab coat with custom name embroidery.',
      'Half-sleeve lab coat for summer labs. Fresh condition.',
      'Pack of 10 disposable non-woven gowns. Sealed pack.',
      'Multi-pocket lab coat for carrying instruments.',
      'Premium quality lab coat with reinforced stitching.',
      'Chemical-resistant lab coat for chemistry labs.',
      'Professional medical lab coat with button closure.',
      'Lab coat bundled with safety goggles at discount.',
      'Heavy-duty lab apron for workshop and lab use.'
    ]
  },
  'Hostel Essentials': {
    titles: [
      'Bed Sheet Set Double', 'Pillow with Cover', 'Desk Lamp LED',
      'Extension Board 4-Way', 'Mosquito Net', 'Bathroom Caddy',
      'Storage Organizer', 'Curtains for Hostel Window', 'Rug Floor Mat',
      'Wall Hooks Pack', 'Laundry Bag', 'Iron with Mini Board',
      'Electric Kettle', 'Room Heater Mini', 'Cooler Fan Portable',
      'Study Table Organizer', 'Wardrobe Hangers Set', 'Towel Set',
      'Slippers Bathroom', 'Water Bottle Steel'
    ],
    descriptions: [
      'Soft cotton bed sheets with matching pillow covers.',
      'Memory foam pillow with washable cover. Very comfortable.',
      'Rechargeable LED desk lamp with 3 brightness levels.',
      'Safe extension board with surge protection. 4 sockets.',
      'Easy-to-install mosquito net for single bed.',
      'Hanging bathroom organizer with multiple compartments.',
      'Stackable storage boxes for organizing hostel room.',
      'Blackout curtains that fit standard hostel windows.',
      'Soft washable floor rug. Anti-slip backing.',
      'Self-adhesive wall hooks. No drilling needed.'
    ]
  },
  Electronics: {
    titles: [
      'Laptop Dell Inspiron 15', 'MacBook Air M1', 'Laptop Charger Universal',
      'Wireless Mouse Logitech', 'Bluetooth Earbuds', 'Power Bank 20000mAh',
      'USB-C Hub Adapter', 'External Hard Drive 1TB', 'Webcam HD 1080p',
      'Portable Speaker JBL', 'Smart Watch Amazfit', 'Tablet Samsung Galaxy',
      'Monitor 24 Inch LED', 'Keyboard Mechanical RGB', 'Headphones Sony WH-1000XM4',
      'USB Flash Drive 128GB', 'Laptop Stand Adjustable', 'Screen Protector 15.6 inch',
      'Laptop Cooling Pad', 'Wireless Charger Pad'
    ],
    descriptions: [
      'i5 10th gen, 8GB RAM, 512GB SSD. Excellent condition with charger.',
      'M1 chip, 8GB RAM, 256GB SSD. Battery health 95%. With original box.',
      'Compatible with most laptops. 65W fast charging.',
      'Ergonomic wireless mouse with USB receiver. 2 year battery life.',
      'True wireless earbuds with charging case. Active noise cancelling.',
      'Fast charging power bank with dual USB ports. LED indicator.',
      '7-in-1 USB-C hub with HDMI, USB-A, SD card reader.',
      'Portable 1TB drive with USB 3.0 cable. No bad sectors.',
      'Full HD webcam with built-in microphone and clip.',
      'Portable Bluetooth speaker with waterproof design. 10hr battery.',
      'Fitness tracker with heart rate and SpO2 monitoring.',
      '10.4 inch tablet with S Pen. Great for note-taking.',
      'Full HD IPS monitor with HDMI cable included.',
      'Cherry MX switches with RGB backlighting. Full size.',
      'Premium noise-cancelling headphones. 30hr battery life.',
      'High-speed 128GB USB 3.1 flash drive.',
      'Ergonomic adjustable laptop stand. Aluminum alloy.',
      'Tempered glass screen protector. Bubble-free application.',
      'Dual fan cooling pad with LED lights. USB powered.',
      'Qi-compatible wireless charging pad. Fast charge support.'
    ]
  },
  Cycle: {
    titles: [
      'Hero Sprint Cycle', 'Firefox Mountain Bike', 'Bicycle with Carrier',
      'Electric Cycle', 'Folding Bicycle', 'Kids Cycle',
      'Bicycle Lock Heavy Duty', 'Cycle Helmet', 'Bicycle Pump',
      'Cycle Light Set LED', 'Bicycle Basket', 'Cycle Repair Kit'
    ],
    descriptions: [
      '26-inch single speed cycle. Recently serviced with new tires.',
      '21-speed mountain bike with front suspension. Off-road ready.',
      'City bicycle with rear carrier and stand. Perfect for campus commute.',
      'E-bike with 250W motor. Range 40km per charge. Barely used.',
      'Compact folding cycle. Easy to store in small spaces.',
      'Colorful kids cycle with training wheels. Age 5-8 years.',
      'Heavy-duty U-lock with two keys. Anti-theft design.',
      'Certified safety helmet with adjustable fit.',
      'Portable floor pump with pressure gauge.',
      'Bright LED front and rear light set. USB rechargeable.',
      'Wire basket for carrying books and bags.',
      'Multi-tool kit with tire levers and patch kit.'
    ]
  },
  Furniture: {
    titles: [
      'Study Table Wooden', 'Chair Ergonomic Office', 'Bookshelf 3-Tier',
      'Storage Cabinet Metal', 'Bedside Table', 'Desk Organizer',
      'Portable Laptop Table', 'Floor Cushion Large', 'Shoe Rack 3-Tier',
      'Hanging Organizer', 'Corner Shelf', 'Under-Bed Storage Box',
      'Wall-Mounted Shelf', 'Folding Table', 'Stool Wooden',
      'Mirror Full Length', 'Coat Stand', 'Magazine Rack',
      'Curtain Rod Set', 'Key Holder Wall Mount'
    ],
    descriptions: [
      'Solid wood study table with drawer. Spacious and sturdy.',
      'Adjustable height office chair with back support and wheels.',
      'Metal bookshelf with 3 adjustable shelves. Holds many books.',
      'Lockable metal cabinet for storing valuables and documents.',
      'Compact bedside table with drawer and shelf.',
      'Desktop organizer with pen holder and compartments.',
      'Adjustable height folding laptop table. Use on bed or sofa.',
      'Large floor cushion with washable cover. Comfortable for studying.',
      'Metal shoe rack with 3 tiers. Holds 12 pairs.',
      'Fabric hanging organizer for closet. Multiple pockets.'
    ]
  },
  Others: {
    titles: [
      'Sports Cricket Bat', 'Badminton Racket Set', 'Yoga Mat Premium',
      'Guitar Acoustic', 'Keyboard Piano', 'Camera Canon DSLR',
      'Projector Mini Portable', 'Board Game Collection', 'Dumbbells Set',
      'Cooking Utensils Kit', 'First Aid Kit', 'Fire Extinguisher Mini',
      'Water Purifier Portable', 'Air Freshener Set', 'Wall Clock Digital',
      'Photo Frame Set', 'Decoration Lights LED', 'Umbrella Automatic',
      'Shopping Bags Reusable', 'Travel Backpack'
    ],
    descriptions: [
      'English willow cricket bat with grip. Used one season.',
      'Lightweight rackets with cover. Includes 6 shuttlecocks.',
      'Thick non-slip yoga mat with carrying strap.',
      '6-string acoustic guitar with tuner and picks. Good tone.',
      '61-key portable keyboard with headphones and stand.',
      'EOS 200D with 18-55mm kit lens. Low shutter count.',
      'Mini LED projector with HDMI input. Great for movie nights.',
      'Collection of 5 popular board games. Complete pieces.',
      'Adjustable dumbbells 2-10kg. Home gym essential.',
      'Basic cooking utensils set for hostel cooking.',
      'Complete first aid kit with bandages and medicines.',
      'Mini fire extinguisher for safety compliance.',
      'Portable water purifier with filter. No electricity needed.',
      'Electric air freshener with 3 refill cans.',
      'Digital wall clock with temperature display.',
      'Set of 6 decorative photo frames. Various sizes.',
      'Warm white fairy lights. 10 meters long.',
      'Auto-open windproof umbrella. Compact foldable design.',
      'Set of 3 reusable shopping bags. Eco-friendly.',
      'Large travel backpack with laptop compartment. 40L capacity.'
    ]
  }
};

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDescription(category, title) {
  const data = listingData[category];
  if (data && data.descriptions.length > 0) {
    return randomFromArray(data.descriptions);
  }
  return `Good quality ${title.toLowerCase()} available for campus students. Contact for details.`;
}

function generateLendingDuration() {
  const durations = ['1 week', '2 weeks', '3 weeks', '1 month', '2 months', '1 semester', '3 months'];
  return randomFromArray(durations);
}

function generatePrice(category, transactionType) {
  if (transactionType === 'Free') return 0;
  if (transactionType === 'Lend') {
    return randomInt(10, 500);
  }
  const priceRanges = {
    'Books': [50, 800],
    'Guides': [100, 600],
    'Calculator': [200, 3000],
    'Engineering Kit': [500, 5000],
    'Lab Kit': [200, 2000],
    'Boneset': [500, 8000],
    'Stationery': [10, 500],
    'Lab Coat': [100, 1500],
    'Hostel Essentials': [50, 2000],
    'Electronics': [500, 50000],
    'Cycle': [500, 15000],
    'Furniture': [100, 5000],
    'Others': [50, 5000]
  };
  const [min, max] = priceRanges[category] || [50, 2000];
  return randomInt(min, max);
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    await User.deleteMany({});
    await Listing.deleteMany({});
    console.log('Cleared existing data.');

    const departments = ['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Chemical', 'Electronics', 'Biotechnology', 'Information Technology', 'Mathematics', 'Physics'];
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

    const sellers = [];
    for (let i = 0; i < 60; i++) {
      const fullName = sellerNames[i % sellerNames.length];
      const user = await User.create({
        fullName,
        email: `seller${i + 1}@campus.edu`,
        password: 'password123',
        collegeId: `COL${String(i + 1).padStart(4, '0')}`,
        department: randomFromArray(departments),
        year: randomFromArray(years),
        role: i < 3 ? 'admin' : 'seller',
        phone: `9${randomInt(100000000, 999999999)}`,
        campus: randomFromArray(campuses),
        studentType: 'hosteller',
        hostel: randomFromArray(hostels),
        favorites: []
      });
      sellers.push(user);
    }
    console.log(`Created ${sellers.length} seller accounts.`);

    const listings = [];
    for (let i = 0; i < 1000; i++) {
      const category = randomFromArray(categories);
      const data = listingData[category];
      const title = data ? randomFromArray(data.titles) : 'General Item';
      const transactionType = randomFromArray(transactionTypes);
      const condition = randomFromArray(conditions);
      const seller = randomFromArray(sellers);
      const campus = randomFromArray(campuses);
      const hostel = randomFromArray(hostels);

      const listing = {
        seller: seller._id,
        title: title,
        description: generateDescription(category, title),
        category: category,
        condition: condition,
        transactionType: transactionType,
        price: generatePrice(category, transactionType),
        lendingDuration: transactionType === 'Lend' ? generateLendingDuration() : '',
        depositAmount: transactionType === 'Lend' ? randomInt(100, 2000) : 0,
        images: [],
        campus: campus,
        hostel: hostel,
        building: randomFromArray(buildings),
        availability: randomFromArray(['Available', 'Available', 'Available', 'Available', 'Reserved']),
        views: randomInt(0, 500),
        isReported: false
      };

      listings.push(listing);
    }

    await Listing.insertMany(listings);
    console.log(`Seeded ${listings.length} listings successfully!`);

    const stats = await Listing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('\nListings per category:');
    stats.forEach(s => console.log(`  ${s._id}: ${s.count}`));

    const txStats = await Listing.aggregate([
      { $group: { _id: '$transactionType', count: { $sum: 1 } } }
    ]);
    console.log('\nListings per transaction type:');
    txStats.forEach(s => console.log(`  ${s._id}: ${s.count}`));

    const condStats = await Listing.aggregate([
      { $group: { _id: '$condition', count: { $sum: 1 } } }
    ]);
    console.log('\nListings per condition:');
    condStats.forEach(s => console.log(`  ${s._id}: ${s.count}`));

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
