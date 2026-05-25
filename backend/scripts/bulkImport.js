// bulkImport.js
// Run with: node ./backend/scripts/bulkImport.js
// This script reads available categories and products, matches them with local image files,
// uploads all matched images to Cloudinary, and populates MongoDB with correct associations.

import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary config - mapping variables from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Import models
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';

const IMAGES_DIR = '/Users/hatim/Projects/Sportsync-Updated/Sportsync/backend/Sportsync-images';
const CATEGORIES_DIR = '/Users/hatim/Projects/Sportsync-Updated/Sportsync/backend/Categories';

// List of recommended categories with their matching image filename in backend/Categories
const categoriesData = [
  { name: 'Cricket', slug: 'cricket', imageFile: 'cricket-category.jpg' },
  { name: 'Football', slug: 'football', imageFile: 'football-category.jpeg' },
  { name: 'Badminton', slug: 'badminton', imageFile: 'badminton-category.jpg' },
  { name: 'Fitness', slug: 'fitness', imageFile: 'fitness-category.avif' },
  { name: 'Running', slug: 'running', imageFile: 'running-category.jpeg' },
  { name: 'Basketball', slug: 'basketball', imageFile: 'basketball-category.jpeg' },
  { name: 'Volleyball', slug: 'volleyball', imageFile: 'volleyball-category.jpg' },
  { name: 'Indoor Sports', slug: 'indoor-sports', imageFile: 'indoor-category.jpeg' },
  { name: 'Training Equipment', slug: 'training-equipment', imageFile: 'Training-equipment-category.webp' },
  { name: 'Accessories', slug: 'accessories', imageFile: 'accessories-category.avif' },
];

// Raw list of potential products to add
const rawProductsData = [
  // 1. Cricket
  {
    name: 'SG Kashmir Willow Bat',
    brand: 'SG',
    price: 2499,
    discountPrice: 1999,
    description: 'Premium Kashmir willow cricket bat with standard grip and robust sweet spot.',
    stock: 15,
    sizes: ['SH', '6', '5'],
    colors: ['Wood'],
    featured: true,
    categoryName: 'Cricket',
  },
  {
    name: 'SS Ton Player Edition',
    brand: 'SS',
    price: 4999,
    discountPrice: 4299,
    description: 'Professional English willow cricket bat crafted for elite performers.',
    stock: 10,
    sizes: ['SH'],
    colors: ['Wood'],
    featured: true,
    categoryName: 'Cricket',
  },
  {
    name: 'DSC Split Cricket Bat',
    brand: 'DSC',
    price: 3999,
    discountPrice: 3499,
    description: 'Highly responsive English willow bat with excellent balance.',
    stock: 12,
    colors: ['Wood'],
    categoryName: 'Cricket',
  },
  {
    name: 'Junior Cricket Bat',
    brand: 'SG',
    price: 1499,
    discountPrice: 1199,
    description: 'Lightweight and durable cricket bat designed for young aspiring players.',
    stock: 25,
    sizes: ['3', '4', '5'],
    colors: ['Wood'],
    categoryName: 'Cricket',
  },
  {
    name: 'Tennis Cricket Bat',
    brand: 'Cosco',
    price: 999,
    discountPrice: 799,
    description: 'Specially designed tennis ball cricket bat with extra scoop for power hitting.',
    stock: 30,
    colors: ['Wood'],
    categoryName: 'Cricket',
  },
  {
    name: 'Leather Cricket Ball',
    brand: 'SG',
    price: 499,
    discountPrice: 399,
    description: 'Alum tanned, four-piece leather ball perfect for club and tournament matches.',
    stock: 100,
    colors: ['Red', 'White'],
    categoryName: 'Cricket',
  },
  {
    name: 'Tennis Cricket Ball',
    brand: 'Nivia',
    price: 199,
    discountPrice: 149,
    description: 'Heavy-weight tennis cricket ball for durable street and field play.',
    stock: 150,
    colors: ['Yellow', 'Red'],
    categoryName: 'Cricket',
  },
  {
    name: 'Wind Ball',
    brand: 'Cosco',
    price: 149,
    discountPrice: 99,
    description: 'Perfect training and practice wind ball with realistic bounce and seam.',
    stock: 200,
    colors: ['Orange', 'Yellow'],
    categoryName: 'Cricket',
  },
  {
    name: 'Practice Ball',
    brand: 'SG',
    price: 299,
    discountPrice: 229,
    description: 'Practice cricket ball.',
    stock: 45,
    colors: ['Red'],
    categoryName: 'Cricket',
  },
  {
    name: 'Batting Gloves',
    brand: 'SS',
    price: 899,
    discountPrice: 749,
    description: 'Ergonomically designed leather batting gloves with high-density foam protection.',
    stock: 40,
    sizes: ['M', 'L'],
    colors: ['White'],
    categoryName: 'Cricket',
  },
  {
    name: 'Batting Pads',
    brand: 'SG',
    price: 1499,
    discountPrice: 1299,
    description: 'Lightweight batting pads offering superior leg protection and flexibility.',
    stock: 30,
    colors: ['White'],
    categoryName: 'Cricket',
  },
  {
    name: 'Cricket Helmet',
    brand: 'DSC',
    price: 1999,
    discountPrice: 1699,
    description: 'High-impact resistant cricket helmet with steel visor and adjustable strap.',
    stock: 20,
    sizes: ['S', 'M', 'L'],
    colors: ['Blue', 'Black'],
    featured: true,
    categoryName: 'Cricket',
  },
  {
    name: 'Thigh Guard',
    brand: 'SG',
    price: 499,
    discountPrice: 399,
    description: 'Dual-density foam thigh guard for elite level quad protection.',
    stock: 50,
    colors: ['White'],
    categoryName: 'Cricket',
  },
  {
    name: 'Arm Guard',
    brand: 'SS',
    price: 399,
    discountPrice: 299,
    description: 'Lightweight forearm protector with sweat-absorbent inner lining.',
    stock: 50,
    colors: ['White'],
    categoryName: 'Cricket',
  },
  {
    name: 'Full Cricket Kit',
    brand: 'SG',
    price: 6999,
    discountPrice: 5999,
    description: 'Complete cricket gear set including bat, pads, gloves, helmet, guards, and a spacious kit bag.',
    stock: 10,
    colors: ['Blue'],
    featured: true,
    categoryName: 'Cricket',
  },
  {
    name: 'Junior Cricket Kit',
    brand: 'SS',
    price: 4999,
    discountPrice: 4199,
    description: 'Complete cricket starter set for junior players with junior-sized equipment.',
    stock: 15,
    colors: ['Red'],
    categoryName: 'Cricket',
  },
  {
    name: 'Bat Grip',
    brand: 'SG',
    price: 149,
    discountPrice: 99,
    description: 'Anti-slip chevron pattern rubber grip for maximum bat control.',
    stock: 500,
    colors: ['Black', 'Yellow', 'Blue'],
    categoryName: 'Cricket',
  },
  {
    name: 'Cricket Stumps',
    brand: 'Cosco',
    price: 799,
    discountPrice: 649,
    description: 'Set of 3 premium wooden stumps with bails for official cricket matches.',
    stock: 40,
    categoryName: 'Cricket',
  },
  {
    name: 'Cricket Kit Bag',
    brand: 'DSC',
    price: 1299,
    discountPrice: 999,
    description: 'Spacious heavy-duty kit bag with wheels and multiple zipped compartments.',
    stock: 25,
    colors: ['Black', 'Red'],
    categoryName: 'Cricket',
  },

  // 2. Football
  {
    name: 'Match Football',
    brand: 'Nivia',
    price: 1499,
    discountPrice: 1199,
    description: 'FIFA standard size 5 match football with textured cover and latex bladder.',
    stock: 50,
    sizes: ['5'],
    colors: ['White/Blue'],
    featured: true,
    categoryName: 'Football',
  },
  {
    name: 'Training Football',
    brand: 'Cosco',
    price: 899,
    discountPrice: 699,
    description: 'Durable TPU cover training football designed for grass and artificial turf.',
    stock: 80,
    sizes: ['5', '4'],
    colors: ['White/Black'],
    categoryName: 'Football',
  },
  {
    name: 'Futsal Ball',
    brand: 'Adidas',
    price: 1799,
    discountPrice: 1499,
    description: 'Low-bounce futsal ball optimized for fast-paced indoor court play.',
    stock: 30,
    sizes: ['4'],
    colors: ['Yellow/Green'],
    categoryName: 'Football',
  },
  {
    name: 'Mini Football',
    brand: 'Puma',
    price: 499,
    discountPrice: 399,
    description: 'Mini football for kids and casual play.',
    stock: 30,
    sizes: ['3'],
    categoryName: 'Football',
  },
  {
    name: 'Football Studs',
    brand: 'Nike',
    price: 3999,
    discountPrice: 3299,
    description: 'Professional football boots with molded studs for superior traction on firm grass.',
    stock: 35,
    sizes: ['7', '8', '9', '10'],
    colors: ['Orange/Black', 'Blue'],
    featured: true,
    categoryName: 'Football',
  },
  {
    name: 'Turf Football Shoes',
    brand: 'Adidas',
    price: 2999,
    discountPrice: 2499,
    description: 'Multi-stud turf shoes engineered for explosive acceleration on artificial grass.',
    stock: 40,
    sizes: ['7', '8', '9', '10'],
    colors: ['Black/White'],
    categoryName: 'Football',
  },
  {
    name: 'Indoor Football Shoes',
    brand: 'Puma',
    price: 2799,
    discountPrice: 2299,
    description: 'Non-marking gum rubber sole football shoes for ultimate grip on indoor courts.',
    stock: 30,
    sizes: ['7', '8', '9', '10'],
    colors: ['Red', 'White'],
    categoryName: 'Football',
  },
  {
    name: 'Shin Guards',
    brand: 'Nike',
    price: 799,
    discountPrice: 599,
    description: 'Protective shin guards with ankle support.',
    stock: 25,
    categoryName: 'Football',
  },
  {
    name: 'Goalkeeper Gloves',
    brand: 'Adidas',
    price: 1499,
    discountPrice: 1249,
    description: 'All-weather grip goalkeeper gloves with finger protection spine.',
    stock: 25,
    sizes: ['8', '9', '10'],
    colors: ['Green/Black'],
    featured: true,
    categoryName: 'Football',
  },
  {
    name: 'Football Pump',
    brand: 'Cosco',
    price: 299,
    discountPrice: 199,
    description: 'Portable football air pump.',
    stock: 40,
    categoryName: 'Football',
  },
  {
    name: 'Marker Cones',
    brand: 'Nivia',
    price: 499,
    discountPrice: 349,
    description: 'Set of 20 highly visible marker cones for agility drills and boundary definition.',
    stock: 120,
    colors: ['Multi'],
    categoryName: 'Football',
  },
  {
    name: 'Agility Ladder',
    brand: 'Kobo',
    price: 999,
    discountPrice: 799,
    description: 'Adjustable 4m footwork training ladder with durable rungs and carry bag.',
    stock: 60,
    colors: ['Yellow/Black'],
    featured: true,
    categoryName: 'Football',
  },
  {
    name: 'Goal Net',
    brand: 'Cosco',
    price: 1999,
    discountPrice: 1599,
    description: 'Durable football goal net.',
    stock: 10,
    categoryName: 'Football',
  },

  // 3. Badminton
  {
    name: 'Yonex Beginner Racket',
    brand: 'Yonex',
    price: 1499,
    discountPrice: 1199,
    description: 'Perfect beginner racket from Yonex.',
    stock: 50,
    categoryName: 'Badminton',
  },
  {
    name: 'Professional Carbon Racket',
    brand: 'Yonex',
    price: 3499,
    discountPrice: 2999,
    description: 'High modulus graphite badminton racket with ultra-thin aero box frame.',
    stock: 30,
    sizes: ['G4'],
    colors: ['Black/Gold'],
    featured: true,
    categoryName: 'Badminton',
  },
  {
    name: 'Aluminum Badminton Racket',
    brand: 'Yonex',
    price: 1299,
    discountPrice: 999,
    description: 'Sturdy aluminum-steel blend racket designed for beginners and recreational play.',
    stock: 50,
    sizes: ['G4'],
    colors: ['Red', 'Blue'],
    categoryName: 'Badminton',
  },
  {
    name: 'Feather Shuttlecock',
    brand: 'Yonex',
    price: 1299,
    discountPrice: 999,
    description: 'Premium goose feather shuttlecocks for tournament play.',
    stock: 40,
    categoryName: 'Badminton',
  },
  {
    name: 'Nylon Shuttlecock',
    brand: 'Yonex',
    price: 699,
    discountPrice: 549,
    description: 'Precision-engineered synthetic nylon shuttlecocks with natural cork base.',
    stock: 200,
    colors: ['Yellow', 'White'],
    categoryName: 'Badminton',
  },
  {
    name: 'Grip Tape',
    brand: 'Yonex',
    price: 299,
    discountPrice: 199,
    description: 'Comfortable grip tape for rackets.',
    stock: 100,
    categoryName: 'Badminton',
  },
  {
    name: 'Badminton Net',
    brand: 'Nivia',
    price: 899,
    discountPrice: 699,
    description: 'Official tournament-size nylon badminton net with thick top cable.',
    stock: 45,
    colors: ['Brown'],
    categoryName: 'Badminton',
  },
  {
    name: 'Racket Bag',
    brand: 'Yonex',
    price: 1499,
    discountPrice: 1199,
    description: 'Double compartment thermal insulated racket bag to protect your gear.',
    stock: 35,
    colors: ['Blue/Black', 'Red'],
    categoryName: 'Badminton',
  },
  {
    name: 'Badminton Shoes',
    brand: 'Yonex',
    price: 2999,
    discountPrice: 2499,
    description: 'Premium badminton court shoes.',
    stock: 30,
    categoryName: 'Badminton',
  },

  // 4. Fitness
  {
    name: 'Dumbbells',
    brand: 'Kobo',
    price: 2499,
    discountPrice: 1999,
    description: 'Hexagonal rubber-encased dumbbells for noise reduction and floor protection.',
    stock: 40,
    sizes: ['5kg Pair', '10kg Pair'],
    colors: ['Black'],
    featured: true,
    categoryName: 'Fitness',
  },
  {
    name: 'Adjustable Dumbbells',
    brand: 'Kobo',
    price: 9999,
    discountPrice: 7999,
    description: 'Heavy duty adjustable dumbbells.',
    stock: 15,
    categoryName: 'Fitness',
  },
  {
    name: 'Kettlebells',
    brand: 'Kobo',
    price: 1999,
    discountPrice: 1499,
    description: 'Cast iron kettlebells for strength training.',
    stock: 25,
    categoryName: 'Fitness',
  },
  {
    name: 'Barbell Rod',
    brand: 'Kobo',
    price: 1999,
    discountPrice: 1599,
    description: '5-foot solid steel chrome-plated barbell rod with spring collars.',
    stock: 30,
    sizes: ['5ft'],
    colors: ['Silver'],
    categoryName: 'Fitness',
  },
  {
    name: 'Weight Plates',
    brand: 'Kobo',
    price: 2999,
    discountPrice: 2299,
    description: 'Premium rubber weight plates.',
    stock: 30,
    categoryName: 'Fitness',
  },
  {
    name: 'Resistance Bands',
    brand: 'Kobo',
    price: 799,
    discountPrice: 599,
    description: 'Set of 5 latex resistance loop bands with varying tension levels and handles.',
    stock: 100,
    colors: ['Multi'],
    categoryName: 'Fitness',
  },
  {
    name: 'Battle Rope',
    brand: 'Kobo',
    price: 2999,
    discountPrice: 2499,
    description: 'Heavy duty training battle rope.',
    stock: 20,
    categoryName: 'Fitness',
  },
  {
    name: 'Push-Up Board',
    brand: 'Kobo',
    price: 999,
    discountPrice: 799,
    description: 'Multi-functional push up board.',
    stock: 45,
    categoryName: 'Fitness',
  },
  {
    name: 'Pull-Up Bar',
    brand: 'Kobo',
    price: 1299,
    discountPrice: 999,
    description: 'Heavy-duty doorway pull-up bar with soft foam grips and adjustable length.',
    stock: 50,
    colors: ['Black/Red'],
    featured: true,
    categoryName: 'Fitness',
  },
  {
    name: 'Yoga Mat',
    brand: 'Kobo',
    price: 999,
    discountPrice: 799,
    description: 'Comfortable yoga mat.',
    stock: 50,
    categoryName: 'Fitness',
  },
  {
    name: 'Foam Roller',
    brand: 'Kobo',
    price: 899,
    discountPrice: 699,
    description: 'High-density EVA foam roller for deep tissue massage and myofascial release.',
    stock: 75,
    colors: ['Blue', 'Black'],
    categoryName: 'Fitness',
  },
  {
    name: 'Yoga Block',
    brand: 'Kobo',
    price: 399,
    discountPrice: 299,
    description: 'Supportive EVA foam yoga block.',
    stock: 60,
    categoryName: 'Fitness',
  },
  {
    name: 'Skipping Rope',
    brand: 'Kobo',
    price: 299,
    discountPrice: 199,
    description: 'Speed skipping rope.',
    stock: 150,
    categoryName: 'Fitness',
  },
  {
    name: 'Exercise Bike',
    brand: 'Powermax',
    price: 14999,
    discountPrice: 11999,
    description: 'Indoor exercise training bike.',
    stock: 10,
    categoryName: 'Fitness',
  },
  {
    name: 'Treadmill',
    brand: 'Powermax',
    price: 34999,
    discountPrice: 29999,
    description: 'Foldable motorized treadmill with digital display, pulse sensor, and preset programs.',
    stock: 15,
    colors: ['Black'],
    featured: true,
    categoryName: 'Fitness',
  },

  // 5. Running
  {
    name: 'Running Shoes',
    brand: 'Nike',
    price: 4599,
    discountPrice: 3799,
    description: 'Ultra-cushioned responsive running shoes engineered for long-distance comfort.',
    stock: 40,
    sizes: ['7', '8', '9', '10'],
    colors: ['Gray/Lime', 'Blue'],
    featured: true,
    categoryName: 'Running',
  },
  {
    name: 'Walking Shoes',
    brand: 'Puma',
    price: 2999,
    discountPrice: 2499,
    description: 'Breathable slip-on walking shoes with memory foam insoles for all-day comfort.',
    stock: 50,
    sizes: ['7', '8', '9', '10'],
    colors: ['Black', 'Navy'],
    categoryName: 'Running',
  },
  {
    name: 'Trail Running Shoes',
    brand: 'Nike',
    price: 5499,
    discountPrice: 4799,
    description: 'Durable trail running shoes.',
    stock: 20,
    categoryName: 'Running',
  },
  {
    name: 'Running Socks',
    brand: 'Nike',
    price: 399,
    discountPrice: 299,
    description: 'Cushioned running socks.',
    stock: 100,
    categoryName: 'Running',
  },
  {
    name: 'Sports Cap',
    brand: 'Nike',
    price: 499,
    discountPrice: 399,
    description: 'Moisture-wicking, adjustable running cap with reflective accents for night safety.',
    stock: 120,
    colors: ['Black', 'White'],
    categoryName: 'Running',
  },
  {
    name: 'Waist Pouch',
    brand: 'Puma',
    price: 699,
    discountPrice: 499,
    description: 'Slim water-resistant running waist pack with zip pockets and headphone port.',
    stock: 90,
    colors: ['Black'],
    categoryName: 'Running',
  },
  {
    name: 'Water Bottle',
    brand: 'Puma',
    price: 799,
    discountPrice: 599,
    description: 'Double-walled vacuum insulated stainless steel water bottle, cold for 24 hours.',
    stock: 150,
    colors: ['Black', 'Blue'],
    categoryName: 'Running',
  },

  // 6. Basketball
  {
    name: 'Basketball',
    brand: 'Spalding',
    price: 1199,
    discountPrice: 949,
    description: 'Composite leather indoor/outdoor size 7 basketball with premium grip channels.',
    stock: 60,
    sizes: ['7'],
    colors: ['Orange'],
    featured: true,
    categoryName: 'Basketball',
  },
  {
    name: 'Basketball Shoes',
    brand: 'Nike',
    price: 5499,
    discountPrice: 4799,
    description: 'High-top basketball shoes offering maximum ankle support and impact cushioning.',
    stock: 25,
    sizes: ['8', '9', '10', '11'],
    colors: ['Red/Black', 'White'],
    featured: true,
    categoryName: 'Basketball',
  },
  {
    name: 'Basketball Hoop',
    brand: 'Spalding',
    price: 4999,
    discountPrice: 3999,
    description: 'Wall-mountable solid steel basketball ring with all-weather nylon net.',
    stock: 15,
    colors: ['Red/White/Blue'],
    categoryName: 'Basketball',
  },
  {
    name: 'Basketball Net',
    brand: 'Spalding',
    price: 599,
    discountPrice: 449,
    description: 'Replacement basketball net.',
    stock: 40,
    categoryName: 'Basketball',
  },
  {
    name: 'Arm Sleeve',
    brand: 'Nike',
    price: 399,
    discountPrice: 299,
    description: 'Compression arm sleeve with moisture transport system for peak performance.',
    stock: 100,
    sizes: ['M', 'L'],
    colors: ['Black', 'White'],
    categoryName: 'Basketball',
  },

  // 7. Volleyball
  {
    name: 'Volleyball',
    brand: 'Nivia',
    price: 999,
    discountPrice: 799,
    description: 'Official size 5 soft touch volleyball made with PU leather panels.',
    stock: 70,
    sizes: ['5'],
    colors: ['Yellow/Blue'],
    featured: true,
    categoryName: 'Volleyball',
  },
  {
    name: 'Knee Pads',
    brand: 'Nivia',
    price: 599,
    discountPrice: 449,
    description: 'High-density protective foam volleyball knee pads with breathable sleeve.',
    stock: 80,
    sizes: ['S', 'M', 'L'],
    colors: ['Black'],
    categoryName: 'Volleyball',
  },
  {
    name: 'Volleyball Net',
    brand: 'Nivia',
    price: 1299,
    discountPrice: 999,
    description: 'Official volleyball net.',
    stock: 30,
    categoryName: 'Volleyball',
  },
  {
    name: 'Volleyball Shoes',
    brand: 'Asics',
    price: 3499,
    discountPrice: 2999,
    description: 'Lightweight volleyball court shoes with gum rubber outsole for lateral stability.',
    stock: 30,
    sizes: ['7', '8', '9', '10'],
    colors: ['White/Blue'],
    featured: true,
    categoryName: 'Volleyball',
  },

  // 8. Indoor Sports
  {
    name: 'Table Tennis Racket',
    brand: 'Stiga',
    price: 1199,
    discountPrice: 999,
    description: 'ITTF approved rubber TT bat with responsive sponge and 5-ply wood blade.',
    stock: 40,
    colors: ['Red/Black'],
    categoryName: 'Indoor Sports',
  },
  {
    name: 'TT Balls',
    brand: 'Stiga',
    price: 299,
    discountPrice: 199,
    description: 'Pack of 6 seamless 3-star 40mm table tennis balls for training and matches.',
    stock: 150,
    colors: ['White', 'Orange'],
    categoryName: 'Indoor Sports',
  },
  {
    name: 'Carrom Board',
    brand: 'Precise',
    price: 2499,
    discountPrice: 1999,
    description: 'Full-size wooden carrom board with smooth playing surface and sturdy borders.',
    stock: 20,
    sizes: ['32 inch'],
    colors: ['Natural Wood'],
    featured: true,
    categoryName: 'Indoor Sports',
  },
  {
    name: 'Chess Board',
    brand: 'Precise',
    price: 1499,
    discountPrice: 1199,
    description: 'Magnetic folding wooden chess set with hand-carved chess pieces and storage slots.',
    stock: 35,
    colors: ['Brown/Maple'],
    categoryName: 'Indoor Sports',
  },
  {
    name: 'Dart Board',
    brand: 'Precise',
    price: 1999,
    discountPrice: 1599,
    description: 'Official self-healing bristle paper dartboard with 6 brass tipped steel darts.',
    stock: 25,
    colors: ['Black/Green/Red'],
    categoryName: 'Indoor Sports',
  },

  // 9. Training Equipment
  {
    name: 'Agility Ladder',
    brand: 'Kobo',
    price: 999,
    discountPrice: 799,
    description: 'Adjustable agility footwork ladder for speed training.',
    stock: 50,
    colors: ['Yellow/Black'],
    featured: true,
    categoryName: 'Training Equipment',
  },
  {
    name: 'Speed Hurdles',
    brand: 'Kobo',
    price: 1499,
    discountPrice: 1199,
    description: 'Set of 5 high-impact plastic speed hurdles for explosive stride training.',
    stock: 30,
    colors: ['Neon Orange'],
    categoryName: 'Training Equipment',
  },
  {
    name: 'Marker Cones',
    brand: 'Nivia',
    price: 499,
    discountPrice: 349,
    description: 'Agility disc training cones set.',
    stock: 100,
    colors: ['Multi'],
    categoryName: 'Training Equipment',
  },
  {
    name: 'Resistance Parachute',
    brand: 'Kobo',
    price: 999,
    discountPrice: 799,
    description: 'Speed running parachute for wind resistance and sprint acceleration training.',
    stock: 45,
    colors: ['Black'],
    categoryName: 'Training Equipment',
  },
  {
    name: 'Stopwatch',
    brand: 'Nivia',
    price: 599,
    discountPrice: 449,
    description: 'Digital sports timer stopwatch with calendar, alarm, and water-resistance.',
    stock: 80,
    colors: ['Black'],
    categoryName: 'Training Equipment',
  },
  {
    name: 'Whistle',
    brand: 'Nivia',
    price: 199,
    discountPrice: 149,
    description: 'Loud whistles for coaching.',
    stock: 100,
    categoryName: 'Training Equipment',
  },

  // 10. Accessories
  {
    name: 'Sports Water Bottle',
    brand: 'Nivia',
    price: 499,
    discountPrice: 399,
    description: 'BPA-free plastic sports squeeze water bottle with leakproof dust cover.',
    stock: 200,
    colors: ['Red', 'Blue', 'Black'],
    categoryName: 'Accessories',
  },
  {
    name: 'Wrist Band',
    brand: 'Nike',
    price: 199,
    discountPrice: 149,
    description: 'Pack of 2 highly absorbent cotton elastic athletic sweat wristbands.',
    stock: 300,
    colors: ['Black', 'White'],
    categoryName: 'Accessories',
  },
  {
    name: 'Gym Gloves',
    brand: 'Kobo',
    price: 799,
    discountPrice: 599,
    description: 'Padded weightlifting gym gloves with integrated wrist wrap support.',
    stock: 120,
    sizes: ['M', 'L', 'XL'],
    colors: ['Black'],
    featured: true,
    categoryName: 'Accessories',
  },
  {
    name: 'Sports Backpack',
    brand: 'Puma',
    price: 1999,
    discountPrice: 1499,
    description: 'Waterproof athletic travel daypack with ventilated shoe compartment.',
    stock: 40,
    colors: ['Black/Gray', 'Navy'],
    featured: true,
    categoryName: 'Accessories',
  },
  {
    name: 'Sports Socks',
    brand: 'Nike',
    price: 299,
    discountPrice: 199,
    description: 'Pack of 3 moisture-wicking cushioned ankle athletic sports socks.',
    stock: 250,
    sizes: ['Free Size'],
    colors: ['White', 'Black'],
    categoryName: 'Accessories',
  },
];

// Helper to generate dynamic clean slug
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Function to find exact 4 images for a product inside Sportsync-images
function getProductImages(productName) {
  // Special overrides for inconsistent filenames in images directory
  if (productName === 'Sports Cap') {
    return [
      path.join(IMAGES_DIR, 'Sports Cap-1.jpg'),
      path.join(IMAGES_DIR, 'Sports-cap-2.jpg'),
      path.join(IMAGES_DIR, 'Sports-cap-3.jpg'),
      path.join(IMAGES_DIR, 'Sports-cap-4.jpg'),
    ];
  }
  if (productName === 'Chess Board') {
    return [
      path.join(IMAGES_DIR, 'Chess Board-1.jpg'),
      path.join(IMAGES_DIR, 'chessboard-2.jpg'),
      path.join(IMAGES_DIR, 'chessboard-3.jpg'),
      path.join(IMAGES_DIR, 'chessboard-4.jpg'),
    ];
  }

  // Scan folder for <productName>-1.* up to <productName>-4.* (case insensitive)
  const files = fs.readdirSync(IMAGES_DIR);
  const matchedFiles = [];
  const baseNameLower = productName.toLowerCase();
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

  for (let i = 1; i <= 4; i++) {
    const targetSuffixLower = `-${i}.`;
    const found = files.find((file) => {
      const fileLower = file.toLowerCase();
      // Must start with product name lower
      if (!fileLower.startsWith(baseNameLower)) return false;
      // Must contain -[index].
      if (!fileLower.includes(targetSuffixLower)) return false;
      // Must end with a valid image extension
      return validExtensions.some(ext => fileLower.endsWith(ext));
    });

    if (found) {
      matchedFiles.push(path.join(IMAGES_DIR, found));
    }
  }

  return matchedFiles;
}

// Cloudinary uploader helper
async function uploadToCloudinary(filePath, folderName) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderName,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (error) {
    console.error(`🚨 Error uploading ${filePath} to Cloudinary:`, error.message);
    throw error;
  }
}

async function bulkImport() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // ──────────────────────────────────────────────────
    // 1. RESUME-SAFE: Load or create categories
    // ──────────────────────────────────────────────────
    const createdCategories = {};
    console.log('\n📂 Processing Categories...');

    for (const cat of categoriesData) {
      // Check if category already exists in MongoDB
      const existing = await Category.findOne({ name: cat.name });
      if (existing) {
        createdCategories[cat.name] = existing;
        console.log(`⏭️  Category "${cat.name}" already exists (ID: ${existing._id}). Skipping upload.`);
        continue;
      }

      // Category doesn't exist — upload image and create it
      const imgPath = path.join(CATEGORIES_DIR, cat.imageFile);
      if (!fs.existsSync(imgPath)) {
        console.error(`❌ Category image not found locally: ${imgPath}`);
        continue;
      }

      console.log(`📤 Uploading category image for "${cat.name}"...`);
      const cloudinaryUrl = await uploadToCloudinary(imgPath, 'SportsyncCategories');

      const newCategory = new Category({
        name: cat.name,
        slug: cat.slug,
        image: [cloudinaryUrl],
        products: [],
      });

      const savedCategory = await newCategory.save();
      createdCategories[cat.name] = savedCategory;
      console.log(`✅ Category "${cat.name}" created with ID: ${savedCategory._id}`);
    }

    // ──────────────────────────────────────────────────
    // 2. Scan for products with all 4 images available
    // ──────────────────────────────────────────────────
    console.log('\n🔍 Scanning for products with all 4 images available...');
    const eligibleProducts = [];
    for (const prod of rawProductsData) {
      const matchedImages = getProductImages(prod.name);
      if (matchedImages.length >= 3) {
        eligibleProducts.push({
          ...prod,
          localImages: matchedImages,
        });
        console.log(`   ✔ Product "${prod.name}" has ${matchedImages.length} images.`);
      } else {
        console.warn(`   ⚠️ Skipping "${prod.name}" - only found ${matchedImages.length} images (need at least 3).`);
      }
    }

    console.log(`\n📦 Found ${eligibleProducts.length} eligible products for import.`);

    // ──────────────────────────────────────────────────
    // 3. RESUME-SAFE: Import only products that don't exist yet
    // ──────────────────────────────────────────────────
    let created = 0;
    let skipped = 0;

    for (const prod of eligibleProducts) {
      // Check if product already exists in MongoDB (by name, case-insensitive)
      const existingProduct = await Product.findOne({
        name: { $regex: `^${prod.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
      });

      if (existingProduct) {
        skipped++;
        console.log(`⏭️  Product "${prod.name}" already exists. Skipping.`);
        continue;
      }

      const categoryDoc = createdCategories[prod.categoryName];
      if (!categoryDoc) {
        console.error(`❌ Category "${prod.categoryName}" not found for product "${prod.name}". Skipping.`);
        continue;
      }

      console.log(`\n📤 Uploading ${prod.localImages.length} images for product "${prod.name}"...`);
      const cloudinaryUrls = [];
      for (const localImgPath of prod.localImages) {
        const url = await uploadToCloudinary(localImgPath, 'SportsyncProducts');
        cloudinaryUrls.push(url);
      }

      // Generate slug and construct product
      const productSlug = generateSlug(prod.name);
      const newProduct = new Product({
        name: prod.name,
        slug: productSlug,
        brand: prod.brand || 'Sportsync',
        price: prod.price,
        discountPrice: prod.discountPrice || undefined,
        description: prod.description,
        image: cloudinaryUrls,
        coverImageIndex: 0,
        stock: prod.stock || 0,
        sizes: prod.sizes || [],
        colors: prod.colors || [],
        rating: 0,
        reviewsCount: 0,
        featured: prod.featured || false,
        isActive: true,
        categoryId: categoryDoc._id,
        categoryName: categoryDoc.name,
      });

      const savedProduct = await newProduct.save();
      created++;
      console.log(`✅ Product "${prod.name}" saved successfully.`);

      // Update category products list (following the admin/controller relationship standard)
      categoryDoc.products.push(savedProduct._id);
      await categoryDoc.save();
      console.log(`🔗 Linked Product "${prod.name}" to Category "${categoryDoc.name}".`);
    }

    console.log(`\n🎉 Bulk Seeding Completed Successfully!`);
    console.log(`   📊 Created: ${created} | Skipped (already existed): ${skipped}`);
  } catch (error) {
    console.error('\n🚨 Bulk Seeding Failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB Disconnected.');
  }
}

bulkImport();
