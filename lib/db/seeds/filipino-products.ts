// Common Filipino sari-sari store products for catalog seeding
// Data sourced from common Philippine retail barcodes

import type { ProductCatalog } from '../schema'

export const FILIPINO_PRODUCTS: Omit<ProductCatalog, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Instant Noodles
  { barcode: '4800016644290', name: 'Lucky Me Pancit Canton Original', categoryName: 'Noodles' },
  { barcode: '4800016644306', name: 'Lucky Me Pancit Canton Chilimansi', categoryName: 'Noodles' },
  { barcode: '4800016644313', name: 'Lucky Me Pancit Canton Kalamansi', categoryName: 'Noodles' },
  { barcode: '4800016644320', name: 'Lucky Me Pancit Canton Sweet & Spicy', categoryName: 'Noodles' },
  { barcode: '4800016011566', name: 'Lucky Me Instant Mami Chicken', categoryName: 'Noodles' },
  { barcode: '4800016011573', name: 'Lucky Me Instant Mami Beef', categoryName: 'Noodles' },
  { barcode: '4800016537745', name: 'Nissin Cup Noodles Seafood', categoryName: 'Noodles' },
  { barcode: '4800016537752', name: 'Nissin Cup Noodles Beef', categoryName: 'Noodles' },
  { barcode: '8850100125002', name: 'Mama Instant Noodles Shrimp', categoryName: 'Noodles' },
  { barcode: '8850987110016', name: 'Payless Instant Pancit Canton', categoryName: 'Noodles' },

  // Beverages
  { barcode: '4800024960015', name: 'Cobra Energy Drink Original', categoryName: 'Beverages' },
  { barcode: '4800024960022', name: 'Cobra Energy Drink Smart', categoryName: 'Beverages' },
  { barcode: '4806509610013', name: 'Sting Energy Drink', categoryName: 'Beverages' },
  { barcode: '4800888116390', name: 'C2 Green Tea Apple', categoryName: 'Beverages' },
  { barcode: '4800888116406', name: 'C2 Green Tea Lemon', categoryName: 'Beverages' },
  { barcode: '4800888108135', name: 'Lipovitan Energy Drink', categoryName: 'Beverages' },
  { barcode: '4800024950016', name: 'Fit n Right Apple', categoryName: 'Beverages' },
  { barcode: '4800024950023', name: 'Fit n Right Pineapple', categoryName: 'Beverages' },
  { barcode: '4800024620044', name: 'Zest-O Orange', categoryName: 'Beverages' },
  { barcode: '4800024620051', name: 'Zest-O Dalandan', categoryName: 'Beverages' },

  // Coffee & Chocolate Drinks
  { barcode: '4800361341110', name: 'Nescafe 3-in-1 Original', categoryName: 'Coffee' },
  { barcode: '4800361341127', name: 'Nescafe 3-in-1 Creamy White', categoryName: 'Coffee' },
  { barcode: '4800361341134', name: 'Nescafe 3-in-1 Brown n Creamy', categoryName: 'Coffee' },
  { barcode: '4800361431527', name: 'Nescafe Classic', categoryName: 'Coffee' },
  { barcode: '4800024623090', name: 'Great Taste White Coffee', categoryName: 'Coffee' },
  { barcode: '4800024623106', name: 'Great Taste Choco', categoryName: 'Coffee' },
  { barcode: '4800024956018', name: 'Kopiko Brown Coffee', categoryName: 'Coffee' },
  { barcode: '4800024956025', name: 'Kopiko Black Coffee', categoryName: 'Coffee' },
  { barcode: '4800024707015', name: 'Milo Chocolate Drink Powder 33g', categoryName: 'Beverages' },

  // Condiments & Sauces
  { barcode: '4800194114912', name: 'Mang Tomas Lechon Sauce', categoryName: 'Condiments' },
  { barcode: '4800194112758', name: 'UFC Banana Ketchup 320g', categoryName: 'Condiments' },
  { barcode: '4800194103756', name: 'UFC Tomato Ketchup', categoryName: 'Condiments' },
  { barcode: '4800016105142', name: 'Datu Puti Soy Sauce 385ml', categoryName: 'Condiments' },
  { barcode: '4800016105159', name: 'Datu Puti Vinegar 385ml', categoryName: 'Condiments' },
  { barcode: '4800016653568', name: 'Silver Swan Soy Sauce', categoryName: 'Condiments' },
  { barcode: '4800016653575', name: 'Silver Swan Vinegar', categoryName: 'Condiments' },
  { barcode: '4800194156356', name: 'Papa Banana Ketchup', categoryName: 'Condiments' },
  { barcode: '8850100124999', name: 'Mama Sita Oyster Sauce', categoryName: 'Condiments' },
  { barcode: '4800016105128', name: 'Datu Puti Patis', categoryName: 'Condiments' },

  // Canned Goods
  { barcode: '4800024608094', name: 'Argentina Corned Beef', categoryName: 'Canned Goods' },
  { barcode: '4800194107709', name: 'Purefoods Corned Beef', categoryName: 'Canned Goods' },
  { barcode: '4800194107716', name: 'CDO Corned Beef', categoryName: 'Canned Goods' },
  { barcode: '8801073110137', name: 'Ligo Sardines in Tomato Sauce', categoryName: 'Canned Goods' },
  { barcode: '4800024619062', name: 'Mega Sardines in Tomato Sauce', categoryName: 'Canned Goods' },
  { barcode: '4800194107723', name: 'Century Tuna Flakes in Oil', categoryName: 'Canned Goods' },
  { barcode: '4800194107730', name: 'Century Tuna Chunks in Oil', categoryName: 'Canned Goods' },
  { barcode: '4800194107747', name: 'Sunkist Tuna', categoryName: 'Canned Goods' },
  { barcode: '4800024621096', name: '555 Sardines', categoryName: 'Canned Goods' },
  { barcode: '4800194105309', name: 'CDO Meatloaf', categoryName: 'Canned Goods' },

  // Snacks - Chips
  { barcode: '4800024950047', name: 'Piattos Cheese', categoryName: 'Snacks' },
  { barcode: '4800024950054', name: 'Piattos Sour Cream', categoryName: 'Snacks' },
  { barcode: '4800024950061', name: 'Piattos Roadhouse BBQ', categoryName: 'Snacks' },
  { barcode: '4800016500015', name: 'Nova Multigrain Snack', categoryName: 'Snacks' },
  { barcode: '4800016500022', name: 'Nova BBQ', categoryName: 'Snacks' },
  { barcode: '4800016001031', name: 'Chippy BBQ Flavor', categoryName: 'Snacks' },
  { barcode: '4800016001048', name: 'Chippy Chili & Cheese', categoryName: 'Snacks' },
  { barcode: '4800024951020', name: 'Roller Coaster Potato Crunch', categoryName: 'Snacks' },
  { barcode: '4800024623144', name: 'Oishi Prawn Crackers', categoryName: 'Snacks' },
  { barcode: '4800024623151', name: 'Oishi Potato Fries', categoryName: 'Snacks' },

  // Snacks - Biscuits
  { barcode: '4800024608100', name: 'Skyflakes Crackers', categoryName: 'Snacks' },
  { barcode: '4800024608117', name: 'Fita Crackers', categoryName: 'Snacks' },
  { barcode: '750515017429', name: 'Fita Crackers', categoryName: 'Snacks' },
  { barcode: '4800024608124', name: 'Rebisco Crackers', categoryName: 'Snacks' },
  { barcode: '4800024623168', name: 'Cream-O Chocolate', categoryName: 'Snacks' },
  { barcode: '4800024623175', name: 'Cream-O Vanilla', categoryName: 'Snacks' },
  { barcode: '4800016105104', name: 'Hansel Chocolate', categoryName: 'Snacks' },
  { barcode: '4800016105111', name: 'Hansel Mocha', categoryName: 'Snacks' },
  { barcode: '4800024951037', name: 'Presto Creams', categoryName: 'Snacks' },
  { barcode: '4800024608131', name: 'Monde Mamon', categoryName: 'Snacks' },
  { barcode: '4800024608148', name: 'Stick-O', categoryName: 'Snacks' },

  // Candies
  { barcode: '4800024956032', name: 'Kopiko Coffee Candy', categoryName: 'Candies' },
  { barcode: '4800024956049', name: 'Kopiko Cappuccino Candy', categoryName: 'Candies' },
  { barcode: '4800361341141', name: 'White Rabbit Candy', categoryName: 'Candies' },
  { barcode: '4800024623182', name: 'Haw Flakes', categoryName: 'Candies' },
  { barcode: '4800024950078', name: 'Mentos Mint', categoryName: 'Candies' },
  { barcode: '4800024950085', name: 'Mentos Fruit', categoryName: 'Candies' },
  { barcode: '4800024623199', name: 'Storck Candy', categoryName: 'Candies' },
  { barcode: '4800016105135', name: 'Dynamite Candy', categoryName: 'Candies' },

  // Personal Care
  { barcode: '4800888110015', name: 'Safeguard Soap White', categoryName: 'Personal Care' },
  { barcode: '4800888110022', name: 'Safeguard Soap Floral Pink', categoryName: 'Personal Care' },
  { barcode: '4800888136015', name: 'Palmolive Naturals Soap', categoryName: 'Personal Care' },
  { barcode: '4902430582896', name: 'Pantene Shampoo Sachet', categoryName: 'Personal Care' },
  { barcode: '4902430582902', name: 'Head & Shoulders Sachet', categoryName: 'Personal Care' },
  { barcode: '8850006329016', name: 'Rejoice Shampoo Sachet', categoryName: 'Personal Care' },
  { barcode: '8999999035556', name: 'Downy Fabcon Sachet', categoryName: 'Personal Care' },
  { barcode: '4902430743815', name: 'Tide Detergent Powder Sachet', categoryName: 'Personal Care' },
  { barcode: '8999999501785', name: 'Surf Detergent Sachet', categoryName: 'Personal Care' },
  { barcode: '4800888110039', name: 'Colgate Toothpaste', categoryName: 'Personal Care' },

  // Household
  { barcode: '4800888110046', name: 'Joy Dishwashing Liquid', categoryName: 'Household' },
  { barcode: '8999999501792', name: 'Zonrox Bleach', categoryName: 'Household' },
  { barcode: '4800888110053', name: 'Mr. Clean Multi-Purpose Cleaner', categoryName: 'Household' },
  { barcode: '4800888110060', name: 'Domex Toilet Cleaner', categoryName: 'Household' },

  // Rice (common brands - barcodes may vary by packaging)
  { barcode: '4800194100014', name: 'Sinandomeng Rice 1kg', categoryName: 'Rice' },
  { barcode: '4800194100021', name: 'Jasmine Rice 1kg', categoryName: 'Rice' },
  { barcode: '4800194100038', name: 'Dinorado Rice 1kg', categoryName: 'Rice' },

  // Cooking Oil
  { barcode: '4800024623205', name: 'Minola Cooking Oil 1L', categoryName: 'Cooking Oil' },
  { barcode: '4800194105316', name: 'Marca Pina Cooking Oil 1L', categoryName: 'Cooking Oil' },
  { barcode: '4800024623212', name: 'Baguio Cooking Oil 1L', categoryName: 'Cooking Oil' },

  // Sugar & Seasonings
  { barcode: '4800016105166', name: 'Datu Puti Toyo Seasoning', categoryName: 'Seasonings' },
  { barcode: '4800361341158', name: 'Maggi Magic Sarap', categoryName: 'Seasonings' },
  { barcode: '4800361341165', name: 'Knorr Chicken Cubes', categoryName: 'Seasonings' },
  { barcode: '4800194100045', name: 'Brown Sugar 1kg', categoryName: 'Sugar' },
  { barcode: '4800194100052', name: 'White Sugar 1kg', categoryName: 'Sugar' },

  // Eggs & Basics
  { barcode: '4800024960039', name: 'Fresh Eggs Medium', categoryName: 'Eggs' },
  { barcode: '4800024960046', name: 'Fresh Eggs Large', categoryName: 'Eggs' },

  // Ice Cream & Frozen
  { barcode: '4800016541018', name: 'Selecta Cornetto Classic', categoryName: 'Ice Cream' },
  { barcode: '4800016541025', name: 'Selecta Cornetto Cookies & Cream', categoryName: 'Ice Cream' },
  { barcode: '4800016541032', name: 'Magnolia Ice Cream Bar', categoryName: 'Ice Cream' },

  // Bread
  { barcode: '4800024608155', name: 'Gardenia Classic White Bread', categoryName: 'Bread' },
  { barcode: '4800024608162', name: 'Gardenia Wheat Bread', categoryName: 'Bread' },
  { barcode: '4800024608179', name: 'Gardenia Pandesal', categoryName: 'Bread' },

  // Milk
  { barcode: '4800361341172', name: 'Bear Brand Powdered Milk', categoryName: 'Milk' },
  { barcode: '4800361341189', name: 'Nido Fortified Milk', categoryName: 'Milk' },
  { barcode: '4800361341196', name: 'Alaska Evaporated Milk', categoryName: 'Milk' },
  { barcode: '4800361341202', name: 'Alaska Condensed Milk', categoryName: 'Milk' },

  // Cigarettes (age-restricted items)
  { barcode: '4800194108010', name: 'Marlboro Red', categoryName: 'Cigarettes' },
  { barcode: '4800194108027', name: 'Fortune Menthol', categoryName: 'Cigarettes' },
  { barcode: '4800194108034', name: 'Hope Cigarettes', categoryName: 'Cigarettes' },
  { barcode: '4800194108041', name: 'Champion Blue', categoryName: 'Cigarettes' },

  // Mobile Load Cards (common denominations)
  { barcode: '9000000000015', name: 'Globe Load P15', categoryName: 'Load Cards' },
  { barcode: '9000000000030', name: 'Globe Load P30', categoryName: 'Load Cards' },
  { barcode: '9000000000050', name: 'Globe Load P50', categoryName: 'Load Cards' },
  { barcode: '9000000000100', name: 'Globe Load P100', categoryName: 'Load Cards' },
  { barcode: '9100000000015', name: 'Smart Load P15', categoryName: 'Load Cards' },
  { barcode: '9100000000030', name: 'Smart Load P30', categoryName: 'Load Cards' },
  { barcode: '9100000000050', name: 'Smart Load P50', categoryName: 'Load Cards' },
  { barcode: '9100000000100', name: 'Smart Load P100', categoryName: 'Load Cards' },
]
