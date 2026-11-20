/* ============================================================
   YazFit — Data Layer
   American-lifestyle food database (USDA-based values per 100 g),
   exercise library, meal templates, eating-out guide, pricing.
   ============================================================ */

/* ---------- FOODS ----------
   k = kcal/100g, p/c/f = grams per 100g
   sg = default serving grams, sl = serving label (US units)
   tags: veg vegan keto gluten dairy egg fish shell soy nuts pork alcohol
         cafe drink fast rest sweet ing
*/
const FOODS = {
  // ---- Proteins ----
  'chicken-breast':{n:'Grilled Chicken Breast',cats:['l','d','ing'],k:165,p:31,c:0,f:3.6,sg:100,sl:'3.5 oz portion',tags:['veg','keto','ing']},
  'chicken-thigh':{n:'Chicken Thigh (roasted)',cats:['l','d'],k:209,p:26,c:0,f:10.9,sg:110,sl:'1 thigh (4 oz)',tags:['veg','keto']},
  'rotisserie-chicken':{n:'Rotisserie Chicken (no skin)',cats:['l','d'],k:190,p:27,c:0,f:8,sg:140,sl:'4–5 oz portion',tags:['veg','fast','keto']},
  'ground-beef-90':{n:'Ground Beef 90/10',cats:['l','d','ing'],k:176,p:20,c:0,f:10,sg:113,sl:'4 oz patty',tags:['veg','keto','ing']},
  'sirloin':{n:'Sirloin Steak (lean)',cats:['l','d'],k:206,p:29,c:0,f:9,sg:170,sl:'6 oz steak',tags:['veg','keto']},
  'ribeye':{n:'Ribeye Steak',cats:['d'],k:291,p:25,c:0,f:20,sg:170,sl:'6 oz steak',tags:['veg','keto']},
  'pork-chop':{n:'Pork Chop (lean)',cats:['d'],k:231,p:26,c:0,f:13,sg:145,sl:'5 oz chop',tags:['veg','pork','keto']},
  'bacon':{n:'Bacon',cats:['b','ing'],k:541,p:37,c:1.4,f:42,sg:28,sl:'2 slices',tags:['pork','keto','ing']},
  'turkey-ground':{n:'Ground Turkey 93/7',cats:['l','d','ing'],k:150,p:22,c:0,f:7,sg:113,sl:'4 oz',tags:['veg','keto','ing']},
  'turkey-deli':{n:'Turkey Breast (deli sliced)',cats:['b','l','ing'],k:104,p:17,c:4,f:2,sg:56,sl:'2 oz',tags:['veg','ing']},
  'salmon':{n:'Salmon Fillet',cats:['l','d'],k:208,p:20,c:0,f:13,sg:140,sl:'5 oz fillet',tags:['veg','fish','keto']},
  'tuna-can':{n:'Canned Tuna (in water)',cats:['l','sn','ing'],k:116,p:26,c:0,f:1,sg:142,sl:'1 can (5 oz)',tags:['veg','fish','keto','ing']},
  'tilapia':{n:'Tilapia Fillet',cats:['d'],k:129,p:26,c:0,f:2.7,sg:140,sl:'5 oz fillet',tags:['veg','fish','keto']},
  'shrimp':{n:'Shrimp (cooked)',cats:['l','d'],k:99,p:24,c:0.2,f:0.3,sg:120,sl:'4 oz',tags:['veg','shell','keto']},
  'cod':{n:'Cod Fillet',cats:['d'],k:105,p:23,c:0,f:0.9,sg:140,sl:'5 oz fillet',tags:['veg','fish','keto']},
  'eggs':{n:'Eggs (large)',cats:['b','ing'],k:143,p:12.6,c:0.7,f:9.5,sg:50,sl:'1 large egg',tags:['veg','egg','keto','ing']},
  'egg-whites':{n:'Egg Whites',cats:['b','ing'],k:52,p:11,c:0.7,f:0.2,sg:100,sl:'3 oz',tags:['veg','egg','keto','ing']},
  'whey':{n:'Whey Protein Powder',cats:['b','sn','ing'],k:400,p:80,c:8,f:5,sg:30,sl:'1 scoop',tags:['veg','dairy','ing']},
  'plant-protein':{n:'Plant Protein Powder',cats:['b','sn','ing'],k:385,p:75,c:10,f:4,sg:32,sl:'1 scoop',tags:['vegan','veg','soy','ing']},
  'tofu':{n:'Tofu (firm)',cats:['l','d','ing'],k:144,p:17,c:3,f:9,sg:150,sl:'5 oz',tags:['vegan','veg','soy','keto','ing']},
  'tempeh':{n:'Tempeh',cats:['l','d'],k:192,p:20,c:8,f:11,sg:100,sl:'3.5 oz',tags:['vegan','veg','soy','keto']},
  'edamame':{n:'Edamame',cats:['sn','l'],k:121,p:12,c:9,f:5,sg:100,sl:'½ cup',tags:['vegan','veg','soy']},
  'black-beans':{n:'Black Beans',cats:['l','d','ing'],k:132,p:9,c:24,f:0.5,sg:130,sl:'¾ cup',tags:['vegan','veg','ing']},
  'chickpeas':{n:'Chickpeas',cats:['l','d','sn'],k:164,p:9,c:27,f:2.6,sg:130,sl:'¾ cup',tags:['vegan','veg','ing']},
  'lentils':{n:'Lentils (cooked)',cats:['l','d'],k:116,p:9,c:20,f:0.4,sg:200,sl:'1 cup cooked',tags:['vegan','veg','ing']},
  'kidney-beans':{n:'Kidney Beans',cats:['l','d'],k:127,p:9,c:23,f:0.5,sg:130,sl:'¾ cup',tags:['vegan','veg']},

  // ---- Dairy ----
  'greek-yog-0':{n:'Greek Yogurt (plain, nonfat)',cats:['b','sn'],k:59,p:10,c:3.6,f:0.4,sg:170,sl:'6 oz cup',tags:['veg','dairy','keto']},
  'greek-yog-whole':{n:'Greek Yogurt (whole milk)',cats:['b','sn'],k:97,p:9,c:3.9,f:5,sg:170,sl:'6 oz cup',tags:['veg','dairy']},
  'cottage-2':{n:'Cottage Cheese (2%)',cats:['b','sn'],k:84,p:11,c:4.3,f:2.1,sg:226,sl:'1 cup',tags:['veg','dairy','keto']},
  'milk-2':{n:'Milk (2%)',cats:['b','sn','ing'],k:50,p:3.3,c:4.8,f:1.9,sg:240,sl:'1 cup (8 oz)',tags:['veg','dairy','ing']},
  'whole-milk':{n:'Whole Milk',cats:['b','sn'],k:61,p:3.2,c:4.8,f:3.3,sg:240,sl:'1 cup',tags:['veg','dairy']},
  'almond-milk':{n:'Almond Milk (unsweetened)',cats:['b','sn','ing'],k:15,p:0.6,c:0.6,f:1.2,sg:240,sl:'1 cup',tags:['vegan','veg','nuts','keto','ing']},
  'oat-milk':{n:'Oat Milk',cats:['b','sn','ing'],k:43,p:1,c:6.7,f:1.5,sg:240,sl:'1 cup',tags:['vegan','veg','gluten','ing']},
  'cheddar':{n:'Cheddar Cheese',cats:['b','l','d','ing'],k:403,p:25,c:1.3,f:33,sg:28,sl:'1 slice / 1 oz',tags:['veg','dairy','keto','ing']},
  'mozzarella':{n:'Mozzarella (part-skim)',cats:['d'],k:290,p:32,c:2.8,f:16,sg:85,sl:'3 oz',tags:['veg','dairy','keto']},
  'string-cheese':{n:'String Cheese',cats:['sn'],k:250,p:25,c:3,f:15,sg:28,sl:'1 stick',tags:['veg','dairy','keto']},
  'parmesan':{n:'Parmesan (grated)',cats:['l','d','ing'],k:431,p:38,c:4,f:29,sg:10,sl:'1 tbsp',tags:['veg','dairy','keto','ing']},
  'cream-cheese':{n:'Cream Cheese',cats:['b'],k:342,p:6,c:4,f:34,sg:15,sl:'1 tbsp',tags:['veg','dairy','keto']},

  // ---- Carbs ----
  'oats':{n:'Rolled Oats (dry)',cats:['b'],k:389,p:17,c:66,f:7,sg:40,sl:'½ cup dry',tags:['vegan','veg','gluten','ing']},
  'gf-oats':{n:'Certified GF Rolled Oats',cats:['b'],k:389,p:17,c:66,f:7,sg:40,sl:'½ cup dry',tags:['vegan','veg','ing']},
  'cheerios':{n:'Toasted Oat Cereal',cats:['b'],k:390,p:12,c:73,f:5,sg:28,sl:'1 cup',tags:['veg','gluten']},
  'granola':{n:'Granola',cats:['b','sn'],k:471,p:10,c:64,f:20,sg:45,sl:'½ cup',tags:['veg','gluten','nuts']},
  'ww-bread':{n:'Whole-Wheat Bread',cats:['b','l','d','ing'],k:247,p:13,c:41,f:3.5,sg:43,sl:'1 slice',tags:['veg','gluten','ing']},
  'white-bread':{n:'White Bread',cats:['b','l'],k:265,p:9,c:49,f:3.2,sg:43,sl:'1 slice',tags:['veg','gluten']},
  'bagel':{n:'Plain Bagel',cats:['b'],k:257,p:10,c:51,f:1.5,sg:98,sl:'1 medium bagel',tags:['veg','gluten']},
  'english-muffin':{n:'English Muffin',cats:['b'],k:227,p:9,c:45,f:1.7,sg:57,sl:'1 muffin',tags:['veg','gluten']},
  'tortilla-8':{n:'Flour Tortilla (8")',cats:['b','l','d','ing'],k:306,p:8,c:51,f:7.5,sg:49,sl:'1 tortilla',tags:['veg','gluten','ing']},
  'corn-tortilla':{n:'Corn Tortilla',cats:['l','d','ing'],k:218,p:5.7,c:45,f:2.9,sg:26,sl:'1 tortilla',tags:['vegan','veg','gluten-free','ing']},
  'white-rice':{n:'White Rice (cooked)',cats:['l','d','ing'],k:130,p:2.7,c:28,f:0.3,sg:158,sl:'1 cup cooked',tags:['vegan','veg','gluten-free','ing']},
  'brown-rice':{n:'Brown Rice (cooked)',cats:['l','d','ing'],k:112,p:2.6,c:24,f:0.9,sg:195,sl:'1 cup cooked',tags:['vegan','veg','gluten-free','ing']},
  'quinoa':{n:'Quinoa (cooked)',cats:['l','d'],k:120,p:4.4,c:21,f:1.9,sg:185,sl:'1 cup cooked',tags:['vegan','veg','gluten-free']},
  'pasta':{n:'Pasta (cooked)',cats:['d'],k:158,p:5.8,c:31,f:0.9,sg:140,sl:'1 cup cooked',tags:['vegan','veg','gluten']},
  'ww-pasta':{n:'Whole-Wheat Pasta (cooked)',cats:['d'],k:149,p:6.3,c:30,f:1.8,sg:140,sl:'1 cup cooked',tags:['vegan','veg','gluten']},
  'rice-pasta':{n:'Rice Pasta (cooked)',cats:['d'],k:139,p:2.9,c:31,f:0.2,sg:140,sl:'1 cup cooked',tags:['vegan','veg','gluten-free']},
  'sweet-potato':{n:'Sweet Potato (baked)',cats:['d','l'],k:90,p:2,c:21,f:0.1,sg:150,sl:'1 medium',tags:['vegan','veg','gluten-free']},
  'potato':{n:'Potato (baked)',cats:['d','l'],k:93,p:2.5,c:21,f:0.1,sg:170,sl:'1 medium',tags:['vegan','veg','gluten-free']},
  'fries':{n:'French Fries',cats:['d','sn'],k:312,p:3.4,c:41,f:15,sg:115,sl:'medium order',tags:['veg','fast','gluten-free']},
  'mac-cheese':{n:'Mac & Cheese',cats:['d'],k:164,p:6.5,c:20,f:6.6,sg:200,sl:'1 cup',tags:['veg','gluten','dairy','rest']},
  'pancakes':{n:'Pancakes',cats:['b'],k:227,p:6.4,c:28,f:9.7,sg:115,sl:'2 medium',tags:['veg','gluten','dairy','egg']},
  'waffle':{n:'Waffle',cats:['b'],k:291,p:7.9,c:33,f:14,sg:75,sl:'1 waffle',tags:['veg','gluten','dairy','egg']},
  'french-toast':{n:'French Toast',cats:['b'],k:229,p:7,c:25,f:11,sg:130,sl:'2 slices',tags:['veg','gluten','dairy','egg']},
  'cauliflower-rice':{n:'Cauliflower Rice',cats:['d','l'],k:25,p:2,c:5,f:0.3,sg:100,sl:'1 cup',tags:['vegan','veg','keto','gluten-free']},
  'honey':{n:'Honey',cats:['b','sn','ing'],k:304,p:0.3,c:82,f:0,sg:21,sl:'1 tbsp',tags:['veg','sweet','ing']},
  'maple-syrup':{n:'Maple Syrup',cats:['b'],k:260,p:0,c:67,f:0,sg:20,sl:'1 tbsp',tags:['vegan','veg','sweet','ing']},

  // ---- Fats & Nuts ----
  'pb':{n:'Peanut Butter',cats:['b','sn','ing'],k:588,p:25,c:20,f:50,sg:32,sl:'2 tbsp',tags:['vegan','veg','nuts','ing']},
  'almonds':{n:'Almonds',cats:['sn','b','ing'],k:579,p:21,c:22,f:50,sg:28,sl:'small handful (1 oz)',tags:['vegan','veg','nuts','keto','ing']},
  'walnuts':{n:'Walnuts',cats:['sn'],k:654,p:15,c:14,f:65,sg:28,sl:'1 oz',tags:['vegan','veg','nuts','keto']},
  'cashews':{n:'Cashews',cats:['sn'],k:553,p:18,c:30,f:44,sg:28,sl:'1 oz',tags:['vegan','veg','nuts']},
  'avocado':{n:'Avocado',cats:['b','l','d','ing'],k:160,p:2,c:9,f:15,sg:100,sl:'½ medium',tags:['vegan','veg','keto','gluten-free','ing']},
  'olive-oil':{n:'Olive Oil',cats:['ing'],k:884,p:0,c:0,f:100,sg:14,sl:'1 tbsp',tags:['vegan','veg','keto','ing']},
  'butter':{n:'Butter',cats:['b','d','ing'],k:717,p:0.9,c:0.1,f:81,sg:14,sl:'1 tbsp',tags:['veg','dairy','keto','ing']},
  'ranch':{n:'Ranch Dressing',cats:['l','d'],k:430,p:1.3,c:6.8,f:45,sg:30,sl:'2 tbsp',tags:['veg','dairy','keto']},
  'caesar-dressing':{n:'Caesar Dressing',cats:['l'],k:470,p:1,c:2,f:50,sg:30,sl:'2 tbsp',tags:['veg','dairy','egg','keto']},
  'mayo':{n:'Mayonnaise',cats:['l','ing'],k:680,p:1,c:0.6,f:75,sg:14,sl:'1 tbsp',tags:['veg','egg','keto','ing']},
  'hummus':{n:'Hummus',cats:['sn','l'],k:166,p:8,c:14,f:10,sg:60,sl:'¼ cup',tags:['vegan','veg']},
  'guacamole':{n:'Guacamole',cats:['sn','d'],k:157,p:1.9,c:8.6,f:14,sg:60,sl:'¼ cup',tags:['vegan','veg','keto']},

  // ---- Vegetables ----
  'broccoli':{n:'Broccoli (steamed)',cats:['l','d','ing'],k:34,p:2.8,c:7,f:0.4,sg:150,sl:'1 cup',tags:['vegan','veg','keto','ing']},
  'spinach':{n:'Spinach',cats:['b','l','d','ing'],k:23,p:2.9,c:3.6,f:0.4,sg:80,sl:'2 cups raw',tags:['vegan','veg','keto','ing']},
  'salad-mix':{n:'Mixed Salad Greens',cats:['l','d','ing'],k:17,p:1.4,c:3,f:0.2,sg:85,sl:'2 cups',tags:['vegan','veg','keto','ing']},
  'bell-pepper':{n:'Bell Pepper',cats:['l','d','ing'],k:26,p:1,c:6,f:0.3,sg:120,sl:'1 pepper',tags:['vegan','veg','keto','ing']},
  'cucumber':{n:'Cucumber',cats:['l','sn'],k:15,p:0.7,c:3.6,f:0.1,sg:100,sl:'1 cup sliced',tags:['vegan','veg','keto']},
  'tomato':{n:'Tomato',cats:['l','d','ing'],k:18,p:0.9,c:3.9,f:0.2,sg:120,sl:'1 medium',tags:['vegan','veg','keto','ing']},
  'carrot':{n:'Carrots',cats:['sn','l'],k:41,p:0.9,c:10,f:0.2,sg:80,sl:'1 cup sticks',tags:['vegan','veg']},
  'celery':{n:'Celery',cats:['sn'],k:14,p:0.7,c:3,f:0.2,sg:60,sl:'2 stalks',tags:['vegan','veg','keto']},
  'green-beans':{n:'Green Beans',cats:['d'],k:31,p:1.8,c:7,f:0.2,sg:100,sl:'1 cup',tags:['vegan','veg','keto']},
  'corn':{n:'Corn',cats:['d','sn'],k:86,p:3.3,c:19,f:1.4,sg:150,sl:'1 cup',tags:['vegan','veg','gluten-free']},
  'asparagus':{n:'Asparagus',cats:['d'],k:20,p:2.2,c:3.9,f:0.1,sg:100,sl:'1 cup',tags:['vegan','veg','keto']},
  'mushrooms':{n:'Mushrooms',cats:['b','d'],k:22,p:3.1,c:3.3,f:0.3,sg:70,sl:'1 cup',tags:['vegan','veg','keto']},
  'zucchini':{n:'Zucchini',cats:['d','l'],k:17,p:1.2,c:3.1,f:0.3,sg:120,sl:'1 cup',tags:['vegan','veg','keto']},
  'onion':{n:'Onion',cats:['d','ing'],k:40,p:1.1,c:9,f:0.1,sg:50,sl:'½ onion',tags:['vegan','veg','keto','ing']},
  'coleslaw':{n:'Coleslaw',cats:['d','sn'],k:84,p:1,c:10,f:4.5,sg:100,sl:'1 cup',tags:['veg','dairy','egg','fast']},

  // ---- Fruit ----
  'banana':{n:'Banana',cats:['b','sn','ing'],k:89,p:1.1,c:23,f:0.3,sg:118,sl:'1 medium',tags:['vegan','veg','gluten-free','ing']},
  'apple':{n:'Apple',cats:['b','sn','l'],k:52,p:0.3,c:14,f:0.2,sg:180,sl:'1 medium',tags:['vegan','veg','gluten-free']},
  'orange':{n:'Orange',cats:['b','sn'],k:47,p:0.9,c:12,f:0.1,sg:130,sl:'1 medium',tags:['vegan','veg','gluten-free']},
  'strawberries':{n:'Strawberries',cats:['b','sn'],k:32,p:0.7,c:7.7,f:0.3,sg:150,sl:'1 cup',tags:['vegan','veg','keto','gluten-free']},
  'blueberries':{n:'Blueberries',cats:['b','sn'],k:57,p:0.7,c:14,f:0.3,sg:148,sl:'1 cup',tags:['vegan','veg','gluten-free']},
  'grapes':{n:'Grapes',cats:['sn'],k:69,p:0.7,c:18,f:0.2,sg:120,sl:'1 cup',tags:['vegan','veg','gluten-free']},
  'watermelon':{n:'Watermelon',cats:['sn'],k:30,p:0.6,c:7.6,f:0.2,sg:280,sl:'2 cups',tags:['vegan','veg','gluten-free']},
  'pineapple':{n:'Pineapple',cats:['b','sn'],k:50,p:0.4,c:13,f:0.1,sg:165,sl:'1 cup',tags:['vegan','veg','gluten-free']},
  'mango':{n:'Mango',cats:['sn'],k:60,p:0.8,c:15,f:0.4,sg:165,sl:'1 cup',tags:['vegan','veg','gluten-free']},
  'raisins':{n:'Raisins',cats:['sn'],k:299,p:3,c:79,f:0.5,sg:40,sl:'small box',tags:['vegan','veg','gluten-free']},

  // ---- Snacks & Sweets ----
  'protein-bar':{n:'Protein Bar (20 g protein)',cats:['sn'],k:350,p:30,c:40,f:10,sg:60,sl:'1 bar',tags:['veg','snack']},
  'jerky':{n:'Beef Jerky',cats:['sn'],k:410,p:33,c:11,f:26,sg:28,sl:'1 oz',tags:['veg','keto','snack']},
  'chips':{n:'Potato Chips',cats:['sn','d'],k:536,p:7,c:53,f:34,sg:28,sl:'1 oz bag',tags:['veg','fast','snack']},
  'tortilla-chips':{n:'Tortilla Chips',cats:['sn','d'],k:497,p:7,c:64,f:23,sg:28,sl:'1 oz',tags:['vegan','veg','fast','snack']},
  'popcorn':{n:'Popcorn (air-popped)',cats:['sn'],k:387,p:13,c:78,f:4.5,sg:24,sl:'3 cups',tags:['vegan','veg','gluten-free','snack']},
  'pretzels':{n:'Pretzels',cats:['sn'],k:380,p:10,c:80,f:3,sg:28,sl:'1 oz',tags:['veg','gluten','snack']},
  'dark-choc':{n:'Dark Chocolate (70%)',cats:['sn'],k:546,p:8,c:61,f:31,sg:20,sl:'2 squares',tags:['veg','dairy','snack']},
  'milk-choc':{n:'Milk Chocolate',cats:['sn'],k:535,p:7.6,c:59,f:30,sg:40,sl:'1 bar',tags:['veg','dairy','snack','sweet']},
  'ice-cream':{n:'Vanilla Ice Cream',cats:['sn','d'],k:207,p:3.5,c:24,f:11,sg:66,sl:'½ cup',tags:['veg','dairy','snack','sweet']},
  'cookies':{n:'Chocolate-Chip Cookies',cats:['sn'],k:480,p:5.6,c:64,f:22,sg:30,sl:'2 cookies',tags:['veg','gluten','dairy','egg','snack','sweet']},
  'brownie':{n:'Brownie',cats:['sn'],k:466,p:6,c:63,f:22,sg:56,sl:'1 brownie',tags:['veg','gluten','dairy','egg','snack','sweet']},
  'donut':{n:'Glazed Donut',cats:['sn','b'],k:452,p:5,c:51,f:25,sg:60,sl:'1 donut',tags:['veg','gluten','fast','snack','sweet']},
  'crackers':{n:'Crackers',cats:['sn'],k:490,p:8,c:62,f:22,sg:30,sl:'1 oz',tags:['veg','gluten','snack']},
  'rice-cakes':{n:'Rice Cakes',cats:['sn','b'],k:387,p:8,c:82,f:2.8,sg:9,sl:'1 cake',tags:['vegan','veg','gluten-free','snack']},
  'trail-mix':{n:'Trail Mix',cats:['sn'],k:462,p:14,c:45,f:29,sg:40,sl:'¼ cup',tags:['vegan','veg','nuts','snack']},
  'granola-bar':{n:'Granola Bar',cats:['sn'],k:471,p:8,c:64,f:20,sg:40,sl:'1 bar',tags:['veg','gluten','nuts','snack']},

  // ---- Composite / Restaurant ----
  'cheeseburger':{n:'Cheeseburger (fast food)',cats:['l','d'],k:286,p:15,c:26,f:14,sg:150,sl:'1 burger',tags:['veg','fast','rest']},
  'hamburger':{n:'Hamburger (fast food)',cats:['l','d'],k:254,p:14,c:25,f:12,sg:150,sl:'1 burger',tags:['veg','fast','rest']},
  'grilled-chick-sand':{n:'Grilled Chicken Sandwich',cats:['l','d'],k:215,p:16,c:24,f:7,sg:200,sl:'1 sandwich',tags:['veg','fast','rest','gluten']},
  'chicken-nuggets':{n:'Chicken Nuggets',cats:['l','d'],k:296,p:15,c:16,f:19,sg:100,sl:'6 pc',tags:['veg','fast']},
  'hot-dog':{n:'Hot Dog',cats:['l','d'],k:290,p:10.5,c:18,f:21,sg:98,sl:'1 hot dog',tags:['veg','pork','fast']},
  'pizza-cheese':{n:'Cheese Pizza',cats:['d','l'],k:266,p:11,c:33,f:10,sg:107,sl:'1 slice',tags:['veg','fast','rest','dairy','gluten']},
  'pizza-pepperoni':{n:'Pepperoni Pizza',cats:['d','l'],k:298,p:13,c:34,f:12,sg:107,sl:'1 slice',tags:['veg','fast','rest','dairy','gluten']},
  'burrito-bowl':{n:'Burrito Bowl (chicken)',cats:['l','d'],k:140,p:8.9,c:14,f:5.5,sg:495,sl:'1 bowl',tags:['veg','fast','rest','gluten-free']},
  'beef-taco':{n:'Beef Taco',cats:['l','d'],k:226,p:9,c:17,f:13,sg:100,sl:'1 taco',tags:['veg','fast']},
  'subway-turkey':{n:'Turkey Sub (6-inch)',cats:['l'],k:133,p:8.6,c:21,f:2.4,sg:210,sl:'6-inch sub',tags:['veg','fast','rest','gluten']},
  'club-sandwich':{n:'Club Sandwich',cats:['l'],k:240,p:12,c:26,f:10,sg:230,sl:'1 sandwich',tags:['veg','rest','gluten']},
  'caesar-salad-chick':{n:'Caesar Salad with Chicken',cats:['l','d'],k:130,p:9,c:6,f:8,sg:330,sl:'1 bowl',tags:['veg','rest','dairy','egg','keto']},
  'cobb-salad':{n:'Cobb Salad',cats:['l','d'],k:150,p:8,c:5,f:11,sg:330,sl:'1 bowl',tags:['veg','rest','keto']},
  'sushi-roll':{n:'Sushi Roll',cats:['l','d'],k:145,p:6,c:26,f:2,sg:170,sl:'8 pieces',tags:['veg','rest','fish','soy']},
  'pad-thai':{n:'Pad Thai',cats:['d','l'],k:180,p:8,c:24,f:6.5,sg:350,sl:'1 takeout box',tags:['veg','rest','nuts','fish','gluten']},
  'spag-bol':{n:'Spaghetti Bolognese',cats:['d'],k:130,p:6,c:14,f:5,sg:350,sl:'1 plate',tags:['veg','rest','gluten']},
  'lasagna':{n:'Lasagna',cats:['d'],k:132,p:8,c:12,f:6,sg:250,sl:'1 slice',tags:['veg','rest','gluten','dairy']},
  'chicken-alfredo':{n:'Chicken Alfredo',cats:['d'],k:190,p:9,c:14,f:11,sg:300,sl:'1 plate',tags:['veg','rest','gluten','dairy']},
  'beef-broccoli':{n:'Beef & Broccoli',cats:['d','l'],k:130,p:9,c:7,f:7,sg:300,sl:'1 takeout box',tags:['veg','rest','soy','keto']},
  'orange-chicken':{n:'Orange Chicken',cats:['d','l'],k:230,p:9,c:25,f:11,sg:300,sl:'1 takeout box',tags:['veg','fast','soy']},
  'fried-rice':{n:'Fried Rice',cats:['d','l'],k:163,p:5,c:20,f:6.7,sg:300,sl:'1 takeout box',tags:['veg','rest','soy']},
  'ramen-bowl':{n:'Ramen (restaurant bowl)',cats:['d','l'],k:90,p:4,c:10,f:3.5,sg:700,sl:'1 bowl',tags:['veg','rest','gluten','egg']},
  'pho':{n:'Pho (beef noodle soup)',cats:['d','l'],k:55,p:3,c:7,f:1.5,sg:800,sl:'1 large bowl',tags:['veg','rest','gluten']},
  'breakfast-burrito':{n:'Breakfast Burrito (drive-thru)',cats:['b'],k:200,p:9,c:20,f:9,sg:250,sl:'1 burrito',tags:['veg','fast','gluten','egg']},
  'egg-mcmuffin':{n:'Egg Muffin Sandwich (drive-thru)',cats:['b'],k:231,p:12.7,c:22.4,f:9.7,sg:134,sl:'1 sandwich',tags:['veg','fast','gluten','egg','dairy']},
  'marinara':{n:'Marinara Sauce',cats:['ing','d'],k:32,p:1,c:5,f:0.1,sg:150,sl:'⅔ cup',tags:['vegan','veg','ing']},
  'soy-sauce':{n:'Soy Sauce',cats:['ing'],k:53,p:8,c:5,f:0,sg:15,sl:'1 tbsp',tags:['vegan','veg','soy','ing']},
  'salsa':{n:'Salsa',cats:['ing','sn'],k:36,p:1.5,c:7,f:0.3,sg:60,sl:'¼ cup',tags:['vegan','veg','keto','ing']},
  'mustard':{n:'Mustard',cats:['ing'],k:66,p:4,c:6,f:3,sg:10,sl:'1 tbsp',tags:['vegan','veg','keto','ing']},
  'ketchup':{n:'Ketchup',cats:['ing'],k:101,p:1.2,c:25,f:0.1,sg:17,sl:'1 tbsp',tags:['vegan','veg','sweet','ing']},
  'bbq-sauce':{n:'BBQ Sauce',cats:['ing'],k:172,p:0.6,c:41,f:0.9,sg:30,sl:'2 tbsp',tags:['vegan','veg','sweet','ing']},

  // ---- Drinks ----
  'black-coffee':{n:'Black Coffee',cats:['drink','b'],k:2,p:0.3,c:0,f:0,sg:240,sl:'1 cup',tags:['vegan','veg','cafe','keto','gluten-free']},
  'latte':{n:'Latte (whole milk, grande)',cats:['drink','b','sn'],k:40,p:2.1,c:3.8,f:1.9,sg:355,sl:'grande (12–16 oz)',tags:['veg','dairy','cafe']},
  'orange-juice':{n:'Orange Juice',cats:['drink','b'],k:45,p:0.7,c:10.4,f:0.2,sg:240,sl:'1 cup',tags:['vegan','veg','gluten-free','sweet']},
  'soda':{n:'Regular Soda (cola)',cats:['drink'],k:41,p:0,c:10.6,f:0,sg:355,sl:'1 can (12 oz)',tags:['veg','sweet','fast']},
  'diet-soda':{n:'Diet Soda',cats:['drink'],k:1,p:0,c:0.1,f:0,sg:355,sl:'1 can',tags:['vegan','veg','sweet','fast']},
  'sports-drink':{n:'Sports Drink',cats:['drink'],k:25,p:0,c:6,f:0,sg:500,sl:'20 oz bottle',tags:['vegan','veg','sweet']},
  'iced-tea-sweet':{n:'Sweet Iced Tea',cats:['drink'],k:35,p:0,c:9,f:0,sg:240,sl:'1 cup',tags:['vegan','veg','sweet']},
  'smoothie-berry':{n:'Berry Smoothie (café)',cats:['drink','b','sn'],k:60,p:1.2,c:13,f:0.5,sg:350,sl:'16 oz',tags:['veg','rest']},
  'beer':{n:'Beer',cats:['drink'],k:43,p:0.5,c:3.6,f:0,sg:355,sl:'1 can (12 oz)',tags:['veg','alcohol','gluten']},
  'wine':{n:'Wine (red)',cats:['drink'],k:83,p:0.1,c:2.6,f:0,sg:150,sl:'5 oz glass',tags:['vegan','veg','alcohol']},
  'whiskey':{n:'Whiskey / Spirits',cats:['drink'],k:250,p:0,c:0,f:0,sg:44,sl:'1.5 oz shot',tags:['vegan','veg','alcohol']},
  'energy-drink':{n:'Energy Drink',cats:['drink'],k:45,p:0.2,c:11,f:0,sg:250,sl:'1 can',tags:['veg','sweet','cafe']},
  'protein-shake-rtd':{n:'Ready-to-Drink Protein Shake',cats:['drink','sn'],k:62,p:9,c:3,f:1.5,sg:325,sl:'1 bottle',tags:['veg','dairy','keto']}
};

/* ---------- EXERCISE LIBRARY ----------
   pat: squat hinge lunge hpush hpull vpush vpull biceps triceps calves core cardio mob
   eq: gym home bw (bodyweight)
   lv: 1 beginner · 2 intermediate · 3 advanced
*/
const EXERCISES = {
  // Squat pattern
  'back-squat':{n:'Barbell Back Squat',pat:'squat',eq:['gym'],lv:2,mg:'Legs',cues:['Bar on upper traps, feet shoulder-width','Brace core, sit back and down, knees track toes','Drive through mid-foot to stand'],subs:['goblet-squat','leg-press']},
  'goblet-squat':{n:'Goblet Squat',pat:'squat',eq:['gym','home'],lv:1,mg:'Legs',cues:['Hold a dumbbell/kettlebell at chest','Elbows inside knees at the bottom','Chest up, full-depth squat'],subs:['bw-squat','leg-press']},
  'bw-squat':{n:'Bodyweight Squat',pat:'squat',eq:['bw','home'],lv:1,mg:'Legs',cues:['Arms forward for balance','Sit between your heels, not onto toes'],subs:['goblet-squat']},
  'leg-press':{n:'Leg Press',pat:'squat',eq:['gym'],lv:1,mg:'Legs',cues:['Feet shoulder-width, mid-platform','Lower until knees ~90°, no lower-back rounding','Press without locking knees hard'],subs:['goblet-squat','back-squat']},
  // Hinge pattern
  'deadlift':{n:'Barbell Deadlift',pat:'hinge',eq:['gym'],lv:2,mg:'Posterior Chain',cues:['Bar over mid-foot, shins near bar','Flat back, push floor away, bar drags up legs','Lock out with glutes, not lower back'],subs:['rdl','glute-bridge']},
  'rdl':{n:'Romanian Deadlift (dumbbells)',pat:'hinge',eq:['gym','home'],lv:1,mg:'Hamstrings/Glutes',cues:['Soft knees, push hips back','Feel hamstring stretch, bar/bells close to legs','Stop when back starts to round'],subs:['glute-bridge','deadlift']},
  'hip-thrust':{n:'Barbell Hip Thrust',pat:'hinge',eq:['gym','home'],lv:2,mg:'Glutes',cues:['Upper back on bench, bar over hips','Ribs down, squeeze glutes to full lockout','2-second squeeze at top'],subs:['glute-bridge']},
  'glute-bridge':{n:'Glute Bridge',pat:'hinge',eq:['bw','home'],lv:1,mg:'Glutes',cues:['Feet flat, drive heels down','Full hip extension without arching back'],subs:['hip-thrust']},
  'leg-curl':{n:'Seated Leg Curl (machine)',pat:'hinge',eq:['gym'],lv:1,mg:'Hamstrings',cues:['Control both directions','Squeeze at full flexion'],subs:['rdl']},
  // Lunge pattern
  'lunge-walk':{n:'Walking Lunge',pat:'lunge',eq:['bw','home','gym'],lv:1,mg:'Legs/Glutes',cues:['Long stride, back knee toward floor','Torso tall, push through front heel'],subs:['reverse-lunge','step-up']},
  'reverse-lunge':{n:'Reverse Lunge (dumbbells)',pat:'lunge',eq:['home','gym'],lv:1,mg:'Legs/Glutes',cues:['Step back, drop straight down','Front shin vertical'],subs:['lunge-walk','step-up']},
  'bulgarian':{n:'Bulgarian Split Squat',pat:'lunge',eq:['gym','home'],lv:2,mg:'Legs/Glutes',cues:['Rear foot on bench','Front foot far enough for vertical shin','Slight forward lean targets glutes'],subs:['reverse-lunge','leg-press']},
  'step-up':{n:'Step-Up',pat:'lunge',eq:['bw','home','gym'],lv:1,mg:'Legs/Glutes',cues:['Knee-height box or bench','Drive through top leg, no push-off from bottom'],subs:['lunge-walk']},
  // Horizontal push
  'bench':{n:'Barbell Bench Press',pat:'hpush',eq:['gym'],lv:2,mg:'Chest',cues:['Shoulder blades pinned, slight arch','Bar to mid-chest, elbows ~45°','Press up and slightly back'],subs:['db-bench','machine-press']},
  'db-bench':{n:'Dumbbell Bench Press',pat:'hpush',eq:['gym','home'],lv:1,mg:'Chest',cues:['Bells at nipple line','Touch chest lightly, press to lockout'],subs:['machine-press','pushup']},
  'pushup':{n:'Push-Up',pat:'hpush',eq:['bw','home'],lv:1,mg:'Chest',cues:['Body straight, hands under shoulders','Elbows ~45°, chest to floor','Elevate hands to scale down'],subs:['machine-press','db-bench']},
  'incline-db':{n:'Incline Dumbbell Press',pat:'hpush',eq:['gym','home'],lv:2,mg:'Upper Chest',cues:['30–45° bench','Bells track a slight V'],subs:['db-bench','machine-press']},
  'machine-press':{n:'Machine Chest Press',pat:'hpush',eq:['gym'],lv:1,mg:'Chest',cues:['Seat so handles are at mid-chest','Controlled 2s down'],subs:['db-bench','pushup']},
  'dip':{n:'Bench Dip',pat:'hpush',eq:['bw','home','gym'],lv:2,mg:'Triceps/Chest',cues:['Hands on bench behind you','Elbows back, not flared wide'],subs:['diamond-pushup','pushup']},
  // Vertical push
  'ohp':{n:'Barbell Overhead Press',pat:'vpush',eq:['gym'],lv:2,mg:'Shoulders',cues:['Brace glutes/core, no lean back','Bar path close to face, lock out overhead'],subs:['db-ohp','lateral-raise']},
  'db-ohp':{n:'Seated Dumbbell Shoulder Press',pat:'vpush',eq:['gym','home'],lv:1,mg:'Shoulders',cues:['Back supported','Press bells together overhead'],subs:['ohp','lateral-raise']},
  'lateral-raise':{n:'Lateral Raise',pat:'vpush',eq:['gym','home'],lv:1,mg:'Shoulders',cues:['Lead with elbows, pinkies slightly up','Stop at shoulder height, no shrugging'],subs:['pike-pushup']},
  'pike-pushup':{n:'Pike Push-Up',pat:'vpush',eq:['bw','home'],lv:2,mg:'Shoulders',cues:['Hips high, head toward floor between hands'],subs:['db-ohp','lateral-raise']},
  // Horizontal pull
  'barbell-row':{n:'Barbell Row',pat:'hpull',eq:['gym'],lv:2,mg:'Back',cues:['Hinge ~45°, flat back','Pull bar to lower ribs, squeeze shoulder blades'],subs:['cable-row','db-row']},
  'db-row':{n:'One-Arm Dumbbell Row',pat:'hpull',eq:['gym','home'],lv:1,mg:'Back',cues:['Support on bench','Pull elbow to hip, no torso twist'],subs:['cable-row','band-row']},
  'cable-row':{n:'Seated Cable Row',pat:'hpull',eq:['gym'],lv:1,mg:'Back',cues:['Chest proud','Pull to belly, 1s squeeze'],subs:['db-row','band-row']},
  'inv-row':{n:'Inverted Row (bar/table)',pat:'hpull',eq:['bw','home','gym'],lv:1,mg:'Back',cues:['Body straight, rings or bar at waist','Chest to bar'],subs:['band-row','cable-row']},
  'band-row':{n:'Resistance-Band Row',pat:'hpull',eq:['home'],lv:1,mg:'Back',cues:['Anchor at chest height','Full squeeze, slow return'],subs:['inv-row','db-row']},
  'face-pull':{n:'Face Pull (band/cable)',pat:'hpull',eq:['gym','home'],lv:1,mg:'Rear Delts',cues:['Rope to forehead','External-rotate at the end — "double biceps" pose'],subs:['band-row']},
  // Vertical pull
  'pullup':{n:'Pull-Up',pat:'vpull',eq:['bw','gym'],lv:2,mg:'Back/Lats',cues:['Start from dead hang','Chest to bar, elbows to hips','Control the descent'],subs:['pullup-assist','pulldown']},
  'pullup-assist':{n:'Assisted Pull-Up (machine/band)',pat:'vpull',eq:['gym','home'],lv:1,mg:'Back/Lats',cues:['Assist only as much as needed','Full range, chest toward bar'],subs:['pulldown','pullup']},
  'pulldown':{n:'Lat Pulldown',pat:'vpull',eq:['gym'],lv:1,mg:'Back/Lats',cues:['Slight lean back (~15°)','Bar to collarbone, drive elbows down'],subs:['pullup-assist','pullup']},
  'chinup':{n:'Chin-Up (underhand)',pat:'vpull',eq:['bw','gym'],lv:2,mg:'Back/Biceps',cues:['Shoulder-width underhand grip','Pull until chin clears bar'],subs:['pullup','pulldown']},
  // Arms
  'db-curl':{n:'Dumbbell Biceps Curl',pat:'biceps',eq:['gym','home'],lv:1,mg:'Biceps',cues:['Elbows pinned to sides','No swinging; supinate as you curl'],subs:['hammer-curl']},
  'hammer-curl':{n:'Hammer Curl',pat:'biceps',eq:['gym','home'],lv:1,mg:'Biceps/Forearms',cues:['Neutral grip throughout'],subs:['db-curl']},
  'pushdown':{n:'Cable Triceps Pushdown',pat:'triceps',eq:['gym'],lv:1,mg:'Triceps',cues:['Elbows locked at sides','Full extension, control return'],subs:['oh-ext','diamond-pushup']},
  'oh-ext':{n:'Overhead Dumbbell Triceps Extension',pat:'triceps',eq:['gym','home'],lv:1,mg:'Triceps',cues:['Elbows point forward, not flared','Deep stretch behind head'],subs:['pushdown']},
  'diamond-pushup':{n:'Diamond Push-Up',pat:'triceps',eq:['bw','home'],lv:2,mg:'Triceps',cues:['Hands together forming a diamond','Elbows tight to ribs'],subs:['pushdown','pushup']},
  // Calves
  'calf-raise':{n:'Standing Calf Raise',pat:'calves',eq:['bw','home','gym'],lv:1,mg:'Calves',cues:['Full stretch at bottom, 1s pause at top'],subs:['se-calf']},
  'se-calf':{n:'Seated Calf Raise',pat:'calves',eq:['gym'],lv:1,mg:'Calves',cues:['Knees bent, drive through big toe'],subs:['calf-raise']},
  // Core
  'plank':{n:'Plank',pat:'core',eq:['bw','home','gym'],lv:1,mg:'Core',cues:['Ribs down, glutes tight','Push floor away, breathe'],subs:['dead-bug','bird-dog']},
  'side-plank':{n:'Side Plank',pat:'core',eq:['bw','home'],lv:1,mg:'Obliques',cues:['Stack hips, body in one line'],subs:['plank']},
  'dead-bug':{n:'Dead Bug',pat:'core',eq:['bw','home'],lv:1,mg:'Core',cues:['Low back pinned to floor','Slow opposite arm/leg reach'],subs:['bird-dog']},
  'bird-dog':{n:'Bird Dog',pat:'core',eq:['bw','home'],lv:1,mg:'Core',cues:['Long reach, no hip rotation'],subs:['dead-bug']},
  'knee-raise':{n:'Hanging/Chair Knee Raise',pat:'core',eq:['gym','home','bw'],lv:2,mg:'Core',cues:['Curl pelvis up toward ribs','No swinging'],subs:['crunch','dead-bug']},
  'crunch':{n:'Weighted Crunch / Cable Crunch',pat:'core',eq:['gym','home'],lv:1,mg:'Abs',cues:['Flex spine, hips stay still'],subs:['dead-bug']},
  'mt-climbers':{n:'Mountain Climbers',pat:'core',eq:['bw','home'],lv:1,mg:'Core/Cardio',cues:['Hips low, fast knees'],subs:['dead-bug','jacks']},
  'russian-twist':{n:'Russian Twist',pat:'core',eq:['home','bw'],lv:1,mg:'Obliques',cues:['Rotate shoulders, not just arms'],subs:['side-plank']},
  // Cardio
  'incline-walk':{n:'Treadmill Incline Walk',pat:'cardio',eq:['gym'],lv:1,mg:'Cardio',cues:['3.0–3.8 mph, 6–10% incline','Nose-breathing pace (can talk)'],subs:['outdoor-walk','bike']},
  'outdoor-walk':{n:'Brisk Outdoor Walk',pat:'cardio',eq:['bw','home'],lv:1,mg:'Cardio',cues:['Purposeful pace, ~100+ steps/min'],subs:['incline-walk','bike']},
  'jog':{n:'Easy Jog',pat:'cardio',eq:['bw'],lv:2,mg:'Cardio',cues:['Conversational pace','Land under hips, quick feet'],subs:['incline-walk','bike']},
  'bike':{n:'Stationary Bike',pat:'cardio',eq:['gym','home'],lv:1,mg:'Cardio',cues:['Easy spin, 70–85 rpm'],subs:['elliptical','incline-walk']},
  'row-erg':{n:'Rowing Machine',pat:'cardio',eq:['gym'],lv:2,mg:'Cardio',cues:['Legs → back → arms; reverse on return'],subs:['bike','elliptical']},
  'elliptical':{n:'Elliptical',pat:'cardio',eq:['gym'],lv:1,mg:'Cardio',cues:['Tall posture, full stride'],subs:['bike','incline-walk']},
  'stairs':{n:'Stair Climber',pat:'cardio',eq:['gym'],lv:2,mg:'Cardio',cues:['Light hand support, upright torso'],subs:['incline-walk','bike']},
  'jump-rope':{n:'Jump Rope',pat:'cardio',eq:['home'],lv:2,mg:'Cardio',cues:['Small hops, wrists spin rope'],subs:['jacks','bike']},
  'hiit-bike':{n:'HIIT Bike Sprints',pat:'cardio',eq:['gym','home'],lv:2,mg:'HIIT',cues:['30 s all-out / 90 s easy × 6–8','Full warm-up first'],subs:['hiit-run']},
  'hiit-run':{n:'HIIT Track/Treadmill Sprints',pat:'cardio',eq:['gym','bw'],lv:3,mg:'HIIT',cues:['30 s hard / 90 s walk × 6–8'],subs:['hiit-bike']},
  'jacks':{n:'Jumping Jacks',pat:'cardio',eq:['bw','home'],lv:1,mg:'Cardio',cues:['Soft knees, steady rhythm'],subs:['mt-climbers']},
  'burpees':{n:'Burpees',pat:'cardio',eq:['bw','home'],lv:2,mg:'Cardio',cues:['Chest to floor, jump tall','Step-back version to scale'],subs:['jacks','mt-climbers']},
  'high-knees':{n:'High Knees',pat:'cardio',eq:['bw','home'],lv:1,mg:'Cardio',cues:['Knees to hip height, quick cadence'],subs:['jacks','mt-climbers']},
  // Mobility / Cooldown
  'hip-flexor-stretch':{n:'Kneeling Hip-Flexor Stretch',pat:'mob',eq:['bw'],lv:1,mg:'Mobility',cues:['Tuck pelvis, 30 s per side']},
  'hamstring-stretch':{n:'Hamstring Stretch',pat:'mob',eq:['bw'],lv:1,mg:'Mobility',cues:['Hinge at hips, flat back, 30 s']},
  'chest-doorway':{n:'Doorway Chest Stretch',pat:'mob',eq:['bw'],lv:1,mg:'Mobility',cues:['Elbow at shoulder height, turn away, 30 s']},
  'cat-cow':{n:'Cat–Cow',pat:'mob',eq:['bw'],lv:1,mg:'Mobility',cues:['Slow segmental spine movement ×10']},
  'thoracic-rot':{n:'Thoracic Rotation (open book)',pat:'mob',eq:['bw'],lv:1,mg:'Mobility',cues:['Side-lying, rotate top arm open ×8/side']},
  'quad-stretch':{n:'Quad Stretch',pat:'mob',eq:['bw'],lv:1,mg:'Mobility',cues:['Neutral pelvis, 30 s per side']},
  'glute-stretch':{n:'Figure-4 Glute Stretch',pat:'mob',eq:['bw'],lv:1,mg:'Mobility',cues:['Ankle over knee, pull gently, 30 s/side']},
  'calf-stretch':{n:'Calf Stretch',pat:'mob',eq:['bw'],lv:1,mg:'Mobility',cues:['Back heel down, knee straight, 30 s/side']},
  'childs-pose':{n:'Child\'s Pose',pat:'mob',eq:['bw'],lv:1,mg:'Mobility',cues:['Breathe into lower back, 45 s']},
  'band-pullapart':{n:'Band Pull-Apart',pat:'mob',eq:['home','gym'],lv:1,mg:'Prehab',cues:['Straight arms, squeeze blades ×15']}
};

/* ---------- MEAL TEMPLATES ----------
   roles: pr (protein, scaled to protein target, cap grams)
          cb (carb, scaled to remaining kcal)  · milk (fixed 240 g, dairy-aware)
          ft (fat: fix grams fixed, otherwise scaled to remaining kcal)
          veg / fruit / extra (fixed grams via fix)
   alt: alternative food ids tried when the primary is filtered out
*/
const MEAL_TEMPLATES = [
  // ===== Breakfast =====
  {id:'b1',meal:'b',n:'Scrambled Eggs & Whole-Grain Toast',items:[
    {f:'eggs',role:'pr',cap:200},{f:'egg-whites',role:'pr',cap:300},
    {f:'ww-bread',role:'cb'},{f:'butter',role:'ft',fix:7,alt:['olive-oil']},
    {f:'blueberries',role:'fruit',fix:80}]},
  {id:'b2',meal:'b',n:'Protein Oatmeal Bowl',items:[
    {f:'oats',role:'cb',alt:['gf-oats']},{f:'whey',role:'pr',cap:35,alt:['plant-protein']},
    {f:'milk-2',role:'milk'},{f:'pb',role:'ft',fix:16},{f:'banana',role:'fruit',fix:80}]},
  {id:'b3',meal:'b',n:'Greek Yogurt Parfait',items:[
    {f:'greek-yog-0',role:'pr',cap:420},{f:'granola',role:'cb'},
    {f:'strawberries',role:'fruit',fix:100},{f:'honey',role:'ft',fix:10}]},
  {id:'b4',meal:'b',n:'Bagel & Eggs with Avocado',items:[
    {f:'bagel',role:'cb'},{f:'eggs',role:'pr',cap:150},{f:'egg-whites',role:'pr',cap:200},
    {f:'avocado',role:'ft',fix:40},{f:'apple',role:'fruit',fix:120}]},
  {id:'b5',meal:'b',n:'Protein Smoothie',items:[
    {f:'whey',role:'pr',cap:40,alt:['plant-protein']},{f:'milk-2',role:'milk'},
    {f:'banana',role:'fruit',fix:120},{f:'oats',role:'cb',fix:20,alt:['gf-oats']},{f:'pb',role:'ft',fix:12}]},
  {id:'b6',meal:'b',n:'Homemade Breakfast Burrito',items:[
    {f:'tortilla-8',role:'cb'},{f:'eggs',role:'pr',cap:150},{f:'egg-whites',role:'pr',cap:200},
    {f:'cheddar',role:'ft',fix:20},{f:'salsa',role:'extra',fix:40}]},
  {id:'b7',meal:'b',n:'Keto Omelette',tg:['keto'],items:[
    {f:'eggs',role:'pr',cap:250},{f:'cheddar',role:'ft',fix:25},
    {f:'spinach',role:'veg',fix:100},{f:'mushrooms',role:'veg',fix:70},
    {f:'avocado',role:'ft',fix:60},{f:'olive-oil',role:'ft',fix:8}]},
  {id:'b8',meal:'b',n:'Egg & Cheese Muffin Sandwich',items:[
    {f:'english-muffin',role:'cb'},{f:'eggs',role:'pr',cap:100},
    {f:'turkey-deli',role:'pr',cap:60},{f:'cheddar',role:'ft',fix:20}]},
  {id:'b9',meal:'b',n:'Tofu Scramble Toast',tg:['vegan'],items:[
    {f:'tofu',role:'pr',cap:300},{f:'ww-bread',role:'cb'},{f:'olive-oil',role:'ft',fix:8},
    {f:'spinach',role:'veg',fix:80},{f:'tomato',role:'veg',fix:60}]},
  {id:'b10',meal:'b',n:'Vegan Power Oats',tg:['vegan'],items:[
    {f:'oats',role:'cb',alt:['gf-oats']},{f:'plant-protein',role:'pr',cap:40},
    {f:'almond-milk',role:'milk'},{f:'pb',role:'ft',fix:16},{f:'banana',role:'fruit',fix:80}]},
  {id:'b11',meal:'b',n:'Tropical Yogurt & Fruit Bowl',items:[
    {f:'greek-yog-0',role:'pr',cap:450},{f:'strawberries',role:'fruit',fix:120},
    {f:'pineapple',role:'fruit',fix:100},{f:'almonds',role:'ft',fix:20},{f:'honey',role:'extra',fix:10}]},
  // ===== Lunch =====
  {id:'l1',meal:'l',n:'Grilled Chicken & Rice Bowl',items:[
    {f:'chicken-breast',role:'pr',cap:300},{f:'brown-rice',role:'cb'},
    {f:'broccoli',role:'veg',fix:150},{f:'olive-oil',role:'ft',fix:8}]},
  {id:'l2',meal:'l',n:'Chicken Caesar Salad',items:[
    {f:'chicken-breast',role:'pr',cap:220},{f:'salad-mix',role:'veg',fix:120},
    {f:'parmesan',role:'ft',fix:10},{f:'caesar-dressing',role:'ft',fix:25,alt:['ranch','olive-oil']}]},
  {id:'l3',meal:'l',n:'Turkey Wrap & Fruit',items:[
    {f:'tortilla-8',role:'cb',alt:['corn-tortilla']},{f:'turkey-deli',role:'pr',cap:180},
    {f:'cheddar',role:'ft',fix:15,alt:['avocado']},{f:'tomato',role:'veg',fix:60},
    {f:'mustard',role:'extra',fix:10},{f:'apple',role:'fruit',fix:120}]},
  {id:'l4',meal:'l',n:'Chipotle-Style Burrito Bowl',items:[
    {f:'chicken-breast',role:'pr',cap:200},{f:'brown-rice',role:'cb'},
    {f:'black-beans',role:'extra',fix:130},{f:'salsa',role:'extra',fix:50},
    {f:'cheddar',role:'ft',fix:15,alt:['avocado']},{f:'salad-mix',role:'veg',fix:50}]},
  {id:'l5',meal:'l',n:'Tuna Salad Wrap',items:[
    {f:'tortilla-8',role:'cb',alt:['corn-tortilla']},{f:'tuna-can',role:'pr',cap:180},
    {f:'greek-yog-0',role:'ft',fix:40},{f:'celery',role:'veg',fix:40},{f:'carrot',role:'veg',fix:50}]},
  {id:'l6',meal:'l',n:'Steak & Rice Bowl',items:[
    {f:'sirloin',role:'pr',cap:200},{f:'white-rice',role:'cb'},
    {f:'broccoli',role:'veg',fix:150},{f:'olive-oil',role:'ft',fix:8}]},
  {id:'l7',meal:'l',n:'Salmon & Quinoa Bowl',items:[
    {f:'salmon',role:'pr',cap:220},{f:'quinoa',role:'cb'},
    {f:'asparagus',role:'veg',fix:120},{f:'olive-oil',role:'ft',fix:8}]},
  {id:'l8',meal:'l',n:'Salmon Sushi Bowl',items:[
    {f:'white-rice',role:'cb'},{f:'salmon',role:'pr',cap:160},
    {f:'cucumber',role:'veg',fix:80},{f:'edamame',role:'veg',fix:60},
    {f:'avocado',role:'ft',fix:40},{f:'soy-sauce',role:'extra',fix:15}]},
  {id:'l9',meal:'l',n:'Vegan Buddha Bowl',tg:['vegan'],items:[
    {f:'tempeh',role:'pr',cap:200},{f:'quinoa',role:'cb'},{f:'chickpeas',role:'extra',fix:80},
    {f:'spinach',role:'veg',fix:80},{f:'hummus',role:'ft',fix:40}]},
  {id:'l10',meal:'l',n:'Lentil Soup & Toast',tg:['vegan'],items:[
    {f:'lentils',role:'pr',cap:320},{f:'ww-bread',role:'cb',fix:86},
    {f:'carrot',role:'veg',fix:60},{f:'celery',role:'veg',fix:40},{f:'olive-oil',role:'ft',fix:10}]},
  {id:'l11',meal:'l',n:'Keto Chicken Salad',tg:['keto'],items:[
    {f:'chicken-breast',role:'pr',cap:250},{f:'avocado',role:'ft',fix:80},
    {f:'olive-oil',role:'ft',fix:15},{f:'salad-mix',role:'veg',fix:150},{f:'cheddar',role:'ft',fix:15}]},
  {id:'l12',meal:'l',n:'Shrimp Rice Bowl',items:[
    {f:'shrimp',role:'pr',cap:260},{f:'white-rice',role:'cb'},
    {f:'green-beans',role:'veg',fix:100},{f:'olive-oil',role:'ft',fix:8},{f:'soy-sauce',role:'extra',fix:15}]},
  {id:'l13',meal:'l',n:'Bean & Cheese Quesadilla',tg:['veg'],items:[
    {f:'tortilla-8',role:'cb'},{f:'black-beans',role:'pr',cap:280},
    {f:'cheddar',role:'ft',fix:30},{f:'salsa',role:'extra',fix:50},{f:'salad-mix',role:'veg',fix:60}]},
  {id:'l14',meal:'l',n:'Egg Salad Sandwich & Fruit',tg:['veg'],items:[
    {f:'ww-bread',role:'cb'},{f:'eggs',role:'pr',cap:200},
    {f:'greek-yog-0',role:'ft',fix:40},{f:'salad-mix',role:'veg',fix:50},{f:'apple',role:'fruit',fix:120}]},
  // ===== Dinner =====
  {id:'d1',meal:'d',n:'Salmon, Sweet Potato & Asparagus',items:[
    {f:'salmon',role:'pr',cap:250},{f:'sweet-potato',role:'cb'},
    {f:'asparagus',role:'veg',fix:150},{f:'olive-oil',role:'ft',fix:8}]},
  {id:'d2',meal:'d',n:'Sirloin, Baked Potato & Salad',items:[
    {f:'sirloin',role:'pr',cap:220},{f:'potato',role:'cb'},
    {f:'salad-mix',role:'veg',fix:120},{f:'butter',role:'ft',fix:10,alt:['olive-oil']},{f:'olive-oil',role:'ft',fix:8}]},
  {id:'d3',meal:'d',n:'Chicken Stir-Fry',items:[
    {f:'chicken-breast',role:'pr',cap:250},{f:'white-rice',role:'cb'},
    {f:'bell-pepper',role:'veg',fix:100},{f:'broccoli',role:'veg',fix:100},
    {f:'soy-sauce',role:'extra',fix:15},{f:'olive-oil',role:'ft',fix:8}]},
  {id:'d4',meal:'d',n:'Spaghetti Bolognese',items:[
    {f:'pasta',role:'cb',alt:['rice-pasta']},{f:'ground-beef-90',role:'pr',cap:200},
    {f:'marinara',role:'extra',fix:150},{f:'parmesan',role:'ft',fix:10}]},
  {id:'d5',meal:'d',n:'Turkey Tacos',items:[
    {f:'tortilla-8',role:'cb',fix:98},{f:'turkey-ground',role:'pr',cap:200},
    {f:'cheddar',role:'ft',fix:20},{f:'salsa',role:'extra',fix:50},{f:'tomato',role:'veg',fix:60}]},
  {id:'d6',meal:'d',n:'Chicken Alfredo (Light)',items:[
    {f:'ww-pasta',role:'cb',alt:['rice-pasta']},{f:'chicken-breast',role:'pr',cap:200},
    {f:'milk-2',role:'extra',fix:120,alt:['oat-milk']},{f:'parmesan',role:'ft',fix:15},{f:'broccoli',role:'veg',fix:120}]},
  {id:'d7',meal:'d',n:'Burger Night',items:[
    {f:'ground-beef-90',role:'pr',cap:200},{f:'ww-bread',role:'cb',fix:86},
    {f:'fries',role:'cb',fix:150},{f:'cheddar',role:'ft',fix:15},{f:'salad-mix',role:'veg',fix:100}]},
  {id:'d8',meal:'d',n:'Pizza Night',items:[
    {f:'pizza-pepperoni',role:'cb',fix:320},{f:'chicken-breast',role:'pr',fix:100},
    {f:'salad-mix',role:'veg',fix:150}]},
  {id:'d9',meal:'d',n:'Shrimp Scampi Pasta',items:[
    {f:'shrimp',role:'pr',cap:260},{f:'pasta',role:'cb',alt:['rice-pasta']},
    {f:'olive-oil',role:'ft',fix:15},{f:'zucchini',role:'veg',fix:120}]},
  {id:'d10',meal:'d',n:'Pork Chop Dinner',items:[
    {f:'pork-chop',role:'pr',cap:200},{f:'potato',role:'cb'},
    {f:'green-beans',role:'veg',fix:120},{f:'butter',role:'ft',fix:10,alt:['olive-oil']}]},
  {id:'d11',meal:'d',n:'Vegan Tofu Stir-Fry',tg:['vegan'],items:[
    {f:'tofu',role:'pr',cap:320},{f:'brown-rice',role:'cb'},
    {f:'broccoli',role:'veg',fix:150},{f:'bell-pepper',role:'veg',fix:80},
    {f:'olive-oil',role:'ft',fix:10},{f:'soy-sauce',role:'extra',fix:15}]},
  {id:'d12',meal:'d',n:'Lentil & Veggie Curry Bowl',tg:['vegan'],items:[
    {f:'lentils',role:'pr',cap:320},{f:'brown-rice',role:'cb'},
    {f:'spinach',role:'veg',fix:100},{f:'tomato',role:'veg',fix:80},{f:'olive-oil',role:'ft',fix:10}]},
  {id:'d13',meal:'d',n:'Keto Steak Bowl',tg:['keto'],items:[
    {f:'sirloin',role:'pr',cap:220},{f:'cauliflower-rice',role:'cb'},
    {f:'avocado',role:'ft',fix:80},{f:'butter',role:'ft',fix:12,alt:['olive-oil']},{f:'spinach',role:'veg',fix:120}]},
  {id:'d14',meal:'d',n:'Pasta Primavera',tg:['veg'],items:[
    {f:'ww-pasta',role:'cb',alt:['rice-pasta']},{f:'olive-oil',role:'ft',fix:15},
    {f:'parmesan',role:'ft',fix:20},{f:'broccoli',role:'veg',fix:120},
    {f:'zucchini',role:'veg',fix:100},{f:'tomato',role:'veg',fix:80}]},
  // ===== Snacks =====
  {id:'s1',meal:'sn',n:'Greek Yogurt & Berries',items:[
    {f:'greek-yog-0',role:'pr',cap:350},{f:'blueberries',role:'fruit',fix:80}]},
  {id:'s2',meal:'sn',n:'Protein Shake',items:[
    {f:'whey',role:'pr',cap:40,alt:['plant-protein']},{f:'milk-2',role:'milk'}]},
  {id:'s3',meal:'sn',n:'Apple & Peanut Butter',items:[
    {f:'apple',role:'fruit',fix:150},{f:'pb',role:'ft'}]},
  {id:'s4',meal:'sn',n:'Almonds',tg:['keto'],items:[{f:'almonds',role:'ft'}]},
  {id:'s5',meal:'sn',n:'Cottage Cheese & Pineapple',items:[
    {f:'cottage-2',role:'pr',cap:260},{f:'pineapple',role:'fruit',fix:100}]},
  {id:'s6',meal:'sn',n:'Protein Bar',items:[{f:'protein-bar',role:'pr',cap:70}]},
  {id:'s7',meal:'sn',n:'Beef Jerky & Orange',items:[
    {f:'jerky',role:'pr',cap:60},{f:'orange',role:'fruit',fix:120}]},
  {id:'s8',meal:'sn',n:'Air-Popped Popcorn',items:[{f:'popcorn',role:'cb'}]},
  {id:'s9',meal:'sn',n:'Hummus & Veggies',items:[
    {f:'hummus',role:'ft'},{f:'carrot',role:'veg',fix:100},{f:'celery',role:'veg',fix:60}]},
  {id:'s10',meal:'sn',n:'Rice Cakes & Peanut Butter',items:[
    {f:'rice-cakes',role:'cb',fix:27},{f:'pb',role:'ft',fix:15}]},
  {id:'s11',meal:'sn',n:'Dark Chocolate & Almonds',tg:['keto'],items:[
    {f:'dark-choc',role:'cb',fix:30},{f:'almonds',role:'ft',fix:15}]},
  {id:'s12',meal:'sn',n:'String Cheese & Grapes',items:[
    {f:'string-cheese',role:'pr',fix:56},{f:'grapes',role:'fruit',fix:100}]},
  {id:'s13',meal:'sn',n:'Steamed Edamame',tg:['vegan'],items:[{f:'edamame',role:'pr'}]},
  {id:'s14',meal:'sn',n:'Plant Protein Shake',tg:['vegan'],items:[
    {f:'plant-protein',role:'pr',cap:40},{f:'almond-milk',role:'milk',alt:['oat-milk']}]}
];

/* ---------- EATING-OUT GUIDE (US chains, generic orders) ---------- */
const EATING_OUT = [
  {brand:'Chipotle',icon:'🌯',order:'Chicken or steak bowl · brown rice · fajitas · pinto beans · fresh salsa · skip sour cream, queso & tortilla',kcal:625,p:65,c:62,f:18,tip:'Double protein for +180 kcal / +30 g protein — great on training days.'},
  {brand:'Subway',icon:'🥖',order:'6" turkey breast (or Footlong Protein Bowl) · whole wheat · all the veggies · mustard or vinegar',kcal:300,p:20,c:44,f:5,tip:'Skip chips + soda: swap for apple slices and water. Saves ~350 kcal.'},
  {brand:'Starbucks',icon:'☕',order:'Egg white bites · turkey-bacon sandwich OR oatmeal · cold brew / Americano, no syrup',kcal:340,p:22,c:32,f:12,tip:'A grande latte adds ~190 kcal — order it "skinny" or with almond milk.'},
  {brand:"McDonald's",icon:'🍔',order:'Egg McMuffin + apple slices (breakfast) · McDouble + side salad, no fries (lunch)',kcal:430,p:26,c:38,f:18,tip:'Grilled > crispy every time. Water instead of soda saves ~140 kcal.'},
  {brand:'Wendy\'s',icon:'🍔',order:'Grilled chicken sandwich · apple pecan salad (half) with light dressing',kcal:430,p:34,c:38,f:15,tip:'Chili is a hidden gem: high protein, high fiber, ~250 kcal.'},
  {brand:'Panera',icon:'🥗',order:'Greek salad with chicken · half portion + apple · bowl of turkey sandwich',kcal:490,p:36,c:42,f:20,tip:'Dressing on the side — you\'ll use half as much.'},
  {brand:'Sweetgreen',icon:'🥙',order:'Harvest or Chicken Pesto Parm bowl · light dressing · add extra protein on training days',kcal:540,p:42,c:45,f:22,tip:'Salads can hide 400 kcal of dressing and toppings — ask for light.'},
  {brand:'Gas station / Road trip',icon:'⛽',order:'Beef jerky · protein bar · string cheese · banana · water',kcal:380,p:32,c:42,f:10,tip:'Plan the stop before you\'re starving — hunger picks the worst options.'}
];

/* ---------- PRICING (USD, US market) ---------- */
const PLANS = [
  {id:'free',name:'Free',pm:0,py:0,popular:false,
   inc:['Profile & goal setup','BMR / TDEE / macro targets','Workout plan preview (first 3 exercises per day)','Water tracker','Weekly weigh-in logging'],
   exc:['Full workout programs','Auto meal plans & swaps','Smart reminders','Progress history & adaptive AI','Grocery lists & eating-out guide','PDF export']},
  {id:'plus',name:'Plus',pm:9.99,py:79.99,popular:true,
   inc:['Everything in Free','Full workout programs (all splits, all exercises)','Auto meal plans, swaps & IF mode','Smart reminders (meals, water, workouts, weigh-ins)','Progress charts, history & adaptive AI adjustments','7-day grocery lists','Eating-out survival guide'],
   exc:['PDF plan export','Coach review & macro cycling']},
  {id:'elite',name:'Elite',pm:19.99,py:159.99,popular:false,
   inc:['Everything in Plus','PDF export of full program','Monthly coach review (async, 48 h)','Custom macro cycling (high/low days)','Family share (2 members)','Early access to new features'],
   exc:[]}
];

/* ---------- STANDARDS & SOURCES ---------- */
const STANDARDS = [
  {src:'WHO 2020 Guidelines',txt:'150–300 min moderate (or 75–150 min vigorous) aerobic activity weekly + muscle-strengthening on ≥2 days.'},
  {src:'ACSM',txt:'Progress loads 2–10% when you reach the top of the rep range; 5–10 min warm-up before lifting.'},
  {src:'ISSN Position Stand',txt:'1.4–2.2 g protein/kg/day supports muscle gain & retention; higher end during fat loss.'},
  {src:'Dietary Guidelines for Americans',txt:'Fiber 14 g per 1,000 kcal · added sugar <10% of calories · sodium <2,300 mg · saturated fat <10%.'},
  {src:'CDC',txt:'Safe, sustainable weight loss: 1–2 lb (0.45–0.9 kg) per week.'},
  {src:'NIH / NHLBI',txt:'A deficit of 500–1,000 kcal/day produces 1–2 lb weekly loss for most adults.'},
  {src:'AASM / NSF',txt:'Adults: 7–9 hours of sleep for recovery, appetite control and performance.'},
  {src:'U.S. Navy / Deurenberg (estimate)',txt:'Body-fat estimation when a measurement isn\'t available; refined by waist input.'}
];

/* Export to window scope for classic scripts */
window.FP_DATA = {FOODS, EXERCISES, MEAL_TEMPLATES, EATING_OUT, PLANS, STANDARDS};
