const products = [

  // =========================
  // CRICKET
  // =========================

  {
    name: "SG Kashmir Willow Bat",
    slug: "sg-kashmir-willow-bat",
    brand: "SG",
    price: 2499,
    discountPrice: 1999,
    description: "Premium Kashmir willow cricket bat.",
    image: ["sg-bat.jpg"],
    stock: 20,
    sizes: ["SH", "6"],
    colors: ["Brown"],
    featured: true,
    categoryName: "Cricket"
  },

  {
    name: "SS Ton Player Edition",
    slug: "ss-ton-player-edition",
    brand: "SS",
    price: 4999,
    description: "Professional cricket bat.",
    image: ["ss-bat.jpg"],
    stock: 10,
    sizes: ["SH"],
    colors: ["Brown"],
    categoryName: "Cricket"
  },

  {
    name: "DSC Split Cricket Bat",
    slug: "dsc-split-cricket-bat",
    brand: "DSC",
    price: 3999,
    description: "Balanced cricket bat for match play.",
    image: ["dsc-bat.jpg"],
    stock: 15,
    colors: ["Brown"],
    categoryName: "Cricket"
  },

  {
    name: "Junior Cricket Bat",
    slug: "junior-cricket-bat",
    brand: "SG",
    price: 1499,
    description: "Cricket bat for juniors.",
    image: ["junior-bat.jpg"],
    stock: 18,
    sizes: ["4", "5"],
    colors: ["Brown"],
    categoryName: "Cricket"
  },

  {
    name: "Tennis Cricket Bat",
    slug: "tennis-cricket-bat",
    brand: "Cosco",
    price: 999,
    description: "Lightweight tennis cricket bat.",
    image: ["tennis-bat.jpg"],
    stock: 25,
    colors: ["Brown"],
    categoryName: "Cricket"
  },

  {
    name: "Leather Cricket Ball",
    slug: "leather-cricket-ball",
    brand: "SG",
    price: 499,
    description: "Professional leather cricket ball.",
    image: ["leather-ball.jpg"],
    stock: 40,
    colors: ["Red"],
    categoryName: "Cricket"
  },

  {
    name: "Tennis Cricket Ball",
    slug: "tennis-cricket-ball",
    brand: "Nivia",
    price: 199,
    description: "Soft tennis cricket ball.",
    image: ["tennis-ball.jpg"],
    stock: 60,
    colors: ["Yellow"],
    categoryName: "Cricket"
  },

  {
    name: "Wind Ball",
    slug: "wind-ball",
    brand: "Cosco",
    price: 149,
    description: "Wind ball for practice.",
    image: ["wind-ball.jpg"],
    stock: 50,
    colors: ["Green"],
    categoryName: "Cricket"
  },

  {
    name: "Practice Ball",
    slug: "practice-ball",
    brand: "SG",
    price: 299,
    description: "Practice cricket ball.",
    image: ["practice-ball.jpg"],
    stock: 45,
    colors: ["Red"],
    categoryName: "Cricket"
  },

  {
    name: "Batting Gloves",
    slug: "batting-gloves",
    brand: "SS",
    price: 899,
    description: "Comfortable batting gloves.",
    image: ["batting-gloves.jpg"],
    stock: 20,
    sizes: ["Adult", "Youth"],
    colors: ["White"],
    categoryName: "Cricket"
  },

  {
    name: "Batting Pads",
    slug: "batting-pads",
    brand: "SG",
    price: 1499,
    description: "Protective cricket batting pads.",
    image: ["pads.jpg"],
    stock: 12,
    colors: ["White"],
    categoryName: "Cricket"
  },

  {
    name: "Cricket Helmet",
    slug: "cricket-helmet",
    brand: "DSC",
    price: 1999,
    description: "Protective cricket helmet.",
    image: ["helmet.jpg"],
    stock: 10,
    sizes: ["M", "L"],
    colors: ["Black"],
    categoryName: "Cricket"
  },

  {
    name: "Thigh Guard",
    slug: "thigh-guard",
    brand: "SG",
    price: 499,
    description: "Cricket thigh guard.",
    image: ["thigh-guard.jpg"],
    stock: 18,
    colors: ["White"],
    categoryName: "Cricket"
  },

  {
    name: "Arm Guard",
    slug: "arm-guard",
    brand: "SS",
    price: 399,
    description: "Cricket arm guard.",
    image: ["arm-guard.jpg"],
    stock: 18,
    colors: ["White"],
    categoryName: "Cricket"
  },

  {
    name: "Full Cricket Kit",
    slug: "full-cricket-kit",
    brand: "SG",
    price: 6999,
    description: "Complete cricket kit.",
    image: ["full-kit.jpg"],
    stock: 8,
    categoryName: "Cricket"
  },

  {
    name: "Junior Cricket Kit",
    slug: "junior-cricket-kit",
    brand: "SS",
    price: 4999,
    description: "Junior cricket kit set.",
    image: ["junior-kit.jpg"],
    stock: 10,
    categoryName: "Cricket"
  },

  {
    name: "Bat Grip",
    slug: "bat-grip",
    brand: "SG",
    price: 149,
    description: "Cricket bat grip.",
    image: ["grip.jpg"],
    stock: 100,
    colors: ["Black", "Blue"],
    categoryName: "Cricket"
  },

  {
    name: "Cricket Stumps",
    slug: "cricket-stumps",
    brand: "Cosco",
    price: 799,
    description: "Wooden cricket stumps.",
    image: ["stumps.jpg"],
    stock: 15,
    categoryName: "Cricket"
  },

  {
    name: "Cricket Kit Bag",
    slug: "cricket-kit-bag",
    brand: "DSC",
    price: 1299,
    description: "Large cricket kit bag.",
    image: ["kit-bag.jpg"],
    stock: 14,
    colors: ["Black"],
    categoryName: "Cricket"
  },


  // =========================
  // FOOTBALLS
  // =========================

  {
    name: "Match Football",
    slug: "match-football",
    brand: "Nivia",
    price: 1499,
    discountPrice: 1299,
    description: "Professional match football for tournaments and training.",
    image: ["match-football.jpg"],
    stock: 20,
    sizes: ["5"],
    colors: ["White", "Blue"],
    featured: true,
    categoryName: "Football"
  },

  {
    name: "Training Football",
    slug: "training-football",
    brand: "Cosco",
    price: 899,
    discountPrice: 699,
    description: "Durable football for daily practice sessions.",
    image: ["training-football.jpg"],
    stock: 35,
    sizes: ["5"],
    colors: ["White", "Black"],
    categoryName: "Football"
  },

  {
    name: "Futsal Ball",
    slug: "futsal-ball",
    brand: "Adidas",
    price: 1799,
    description: "Low bounce futsal ball for indoor games.",
    image: ["futsal-ball.jpg"],
    stock: 15,
    sizes: ["4"],
    colors: ["Yellow", "Black"],
    categoryName: "Football"
  },

  {
    name: "Mini Football",
    slug: "mini-football",
    brand: "Puma",
    price: 499,
    description: "Mini football for kids and casual play.",
    image: ["mini-football.jpg"],
    stock: 30,
    sizes: ["3"],
    colors: ["Red", "White"],
    categoryName: "Football"
  },



  // =========================
  // FOOTWEAR
  // =========================

  {
    name: "Football Studs",
    slug: "football-studs",
    brand: "Nike",
    price: 3999,
    discountPrice: 3499,
    description: "High grip football studs for grass grounds.",
    image: ["football-studs.jpg"],
    stock: 18,
    sizes: ["7", "8", "9", "10"],
    colors: ["Black", "Orange"],
    featured: true,
    categoryName: "Football"
  },

  {
    name: "Turf Football Shoes",
    slug: "turf-football-shoes",
    brand: "Adidas",
    price: 2999,
    description: "Comfortable turf football shoes.",
    image: ["turf-shoes.jpg"],
    stock: 16,
    sizes: ["7", "8", "9"],
    colors: ["Blue", "White"],
    categoryName: "Football"
  },

  {
    name: "Indoor Football Shoes",
    slug: "indoor-football-shoes",
    brand: "Puma",
    price: 2799,
    description: "Indoor football shoes with anti-slip sole.",
    image: ["indoor-shoes.jpg"],
    stock: 14,
    sizes: ["7", "8", "9"],
    colors: ["Black"],
    categoryName: "Football"
  },



  // =========================
  // GEAR
  // =========================

  {
    name: "Shin Guards",
    slug: "shin-guards",
    brand: "Nike",
    price: 799,
    description: "Protective shin guards with ankle support.",
    image: ["shin-guards.jpg"],
    stock: 25,
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    categoryName: "Football"
  },

  {
    name: "Goalkeeper Gloves",
    slug: "goalkeeper-gloves",
    brand: "Adidas",
    price: 1499,
    description: "Professional goalkeeper gloves with strong grip.",
    image: ["goalkeeper-gloves.jpg"],
    stock: 12,
    sizes: ["8", "9", "10"],
    colors: ["Green", "Black"],
    featured: true,
    categoryName: "Football"
  },

  {
    name: "Football Pump",
    slug: "football-pump",
    brand: "Cosco",
    price: 299,
    description: "Portable football air pump.",
    image: ["football-pump.jpg"],
    stock: 40,
    colors: ["Black"],
    categoryName: "Football"
  },



  // =========================
  // TRAINING EQUIPMENT
  // =========================

  {
    name: "Marker Cones",
    slug: "marker-cones",
    brand: "Nivia",
    price: 499,
    description: "Training marker cones for football drills.",
    image: ["marker-cones.jpg"],
    stock: 30,
    colors: ["Orange"],
    categoryName: "Football"
  },

  {
    name: "Agility Ladder",
    slug: "agility-ladder",
    brand: "Kobo",
    price: 999,
    description: "Speed and agility ladder for football training.",
    image: ["agility-ladder.jpg"],
    stock: 18,
    colors: ["Yellow"],
    categoryName: "Football"
  },

  {
    name: "Goal Net",
    slug: "goal-net",
    brand: "Cosco",
    price: 1999,
    description: "Durable football goal net.",
    image: ["goal-net.jpg"],
    stock: 10,
    colors: ["White"],
    categoryName: "Football"
  },



  // =========================
  // EXTRA PRODUCTS
  // =========================

  {
    name: "Football Jersey",
    slug: "football-jersey",
    brand: "Puma",
    price: 999,
    description: "Breathable football jersey for matches.",
    image: ["football-jersey.jpg"],
    stock: 22,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "Red"],
    categoryName: "Football"
  },

  {
    name: "Football Socks",
    slug: "football-socks",
    brand: "Nike",
    price: 399,
    description: "Comfortable football socks.",
    image: ["football-socks.jpg"],
    stock: 35,
    sizes: ["Free Size"],
    colors: ["White", "Black"],
    categoryName: "Football"
  }

  
];

export default products;