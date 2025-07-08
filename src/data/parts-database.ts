// Comprehensive parts database for intelligent auto-fill functionality
export interface PartTemplate {
  name: string
  keywords: string[]
  category: string
  compatibility: string[]
  commonBrands: string[]
  description?: string
}

export const PARTS_DATABASE: PartTemplate[] = [
  // Engine Parts
  {
    name: "Engine Oil Filter",
    keywords: ["oil filter", "engine filter", "oil", "filter"],
    category: "Engine",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Ford", "Chevrolet"],
    commonBrands: ["Bosch", "Mann", "Fram", "Wix", "K&N"],
    description: "High-quality oil filter for engine protection and optimal performance"
  },
  {
    name: "Air Filter",
    keywords: ["air filter", "air", "intake filter"],
    category: "Engine", 
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Kia", "Mazda"],
    commonBrands: ["K&N", "Fram", "Bosch", "Mann", "Wix"]
  },
  {
    name: "Spark Plugs",
    keywords: ["spark plug", "plugs", "ignition"],
    category: "Engine",
    compatibility: ["Toyota", "Honda", "Nissan", "Ford", "Chevrolet", "Hyundai"],
    commonBrands: ["NGK", "Denso", "Bosch", "Champion", "Autolite"]
  },
  {
    name: "Fuel Filter",
    keywords: ["fuel filter", "gas filter", "petrol filter"],
    category: "Fuel System",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Kia"],
    commonBrands: ["Bosch", "Mann", "Wix", "Fram"]
  },
  {
    name: "Engine Mount",
    keywords: ["engine mount", "motor mount", "mounting"],
    category: "Engine",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Mazda"],
    commonBrands: ["Febi", "Corteco", "Lemförder", "Meyle"]
  },

  // Brake Parts
  {
    name: "Brake Pads",
    keywords: ["brake pads", "brake pad", "pads", "brake"],
    category: "Brakes",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Kia", "Mercedes-Benz", "BMW"],
    commonBrands: ["Brembo", "Akebono", "Wagner", "Bosch", "ATE"],
    description: "Premium brake pads for reliable stopping power and safety"
  },
  {
    name: "Brake Discs",
    keywords: ["brake disc", "brake rotor", "disc", "rotor"],
    category: "Brakes",
    compatibility: ["Toyota", "Honda", "Nissan", "BMW", "Mercedes-Benz", "Audi"],
    commonBrands: ["Brembo", "ATE", "Zimmermann", "Bosch", "TRW"]
  },
  {
    name: "Brake Fluid",
    keywords: ["brake fluid", "hydraulic fluid", "dot"],
    category: "Brakes",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Kia", "Ford", "Chevrolet"],
    commonBrands: ["ATE", "Bosch", "Castrol", "Valvoline"]
  },
  {
    name: "Brake Caliper",
    keywords: ["brake caliper", "caliper", "brake cylinder"],
    category: "Brakes",
    compatibility: ["Toyota", "Honda", "Nissan", "BMW", "Mercedes-Benz"],
    commonBrands: ["Brembo", "ATE", "TRW", "Bosch"]
  },

  // Suspension Parts
  {
    name: "Shock Absorber",
    keywords: ["shock absorber", "shock", "damper", "strut"],
    category: "Suspension",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Ford", "Chevrolet"],
    commonBrands: ["Monroe", "Bilstein", "KYB", "Sachs", "Gabriel"]
  },
  {
    name: "Coil Spring",
    keywords: ["coil spring", "spring", "suspension spring"],
    category: "Suspension",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Kia"],
    commonBrands: ["Eibach", "H&R", "Monroe", "KYB"]
  },
  {
    name: "Control Arm",
    keywords: ["control arm", "wishbone", "suspension arm"],
    category: "Suspension",
    compatibility: ["Toyota", "Honda", "Nissan", "BMW", "Mercedes-Benz"],
    commonBrands: ["Lemförder", "Meyle", "TRW", "Moog"]
  },

  // Electrical Parts
  {
    name: "Car Battery",
    keywords: ["battery", "car battery", "12v battery"],
    category: "Electrical",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Kia", "Ford", "Chevrolet"],
    commonBrands: ["Bosch", "Varta", "Exide", "Optima", "Interstate"]
  },
  {
    name: "Alternator",
    keywords: ["alternator", "generator", "charging"],
    category: "Electrical",
    compatibility: ["Toyota", "Honda", "Nissan", "Ford", "Chevrolet"],
    commonBrands: ["Bosch", "Denso", "Valeo", "Hitachi"]
  },
  {
    name: "Starter Motor",
    keywords: ["starter", "starter motor", "starting motor"],
    category: "Electrical",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Ford"],
    commonBrands: ["Bosch", "Denso", "Valeo", "Hitachi"]
  },

  // Transmission Parts
  {
    name: "Transmission Oil",
    keywords: ["transmission oil", "gear oil", "atf", "transmission fluid"],
    category: "Transmission",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Ford", "Chevrolet"],
    commonBrands: ["Castrol", "Mobil", "Valvoline", "Shell"]
  },
  {
    name: "Clutch Kit",
    keywords: ["clutch", "clutch kit", "clutch plate", "clutch disc"],
    category: "Transmission",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Ford"],
    commonBrands: ["LuK", "Sachs", "Exedy", "Valeo"]
  },

  // Body Parts
  {
    name: "Headlight",
    keywords: ["headlight", "headlamp", "front light"],
    category: "Lighting",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Kia"],
    commonBrands: ["Osram", "Philips", "Bosch", "Hella"]
  },
  {
    name: "Tail Light",
    keywords: ["tail light", "rear light", "brake light"],
    category: "Lighting",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Kia"],
    commonBrands: ["Osram", "Philips", "Bosch", "Hella"]
  },
  {
    name: "Side Mirror",
    keywords: ["side mirror", "wing mirror", "door mirror"],
    category: "Body",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Kia"],
    commonBrands: ["OEM", "Aftermarket"]
  },

  // Cooling System
  {
    name: "Radiator",
    keywords: ["radiator", "cooling", "coolant radiator"],
    category: "Cooling",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Ford"],
    commonBrands: ["Denso", "Koyo", "Mishimoto", "CSF"]
  },
  {
    name: "Water Pump",
    keywords: ["water pump", "coolant pump", "cooling pump"],
    category: "Cooling",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Ford"],
    commonBrands: ["Gates", "Bosch", "Febi", "Hepu"]
  },
  {
    name: "Thermostat",
    keywords: ["thermostat", "cooling thermostat", "engine thermostat"],
    category: "Cooling",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Kia"],
    commonBrands: ["Gates", "Febi", "Wahler", "Calorstat"]
  },

  // Tires & Wheels
  {
    name: "Car Tire",
    keywords: ["tire", "tyre", "wheel tire", "car tire"],
    category: "Tires & Wheels",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Kia", "BMW", "Mercedes-Benz"],
    commonBrands: ["Michelin", "Bridgestone", "Continental", "Pirelli", "Goodyear"]
  },
  {
    name: "Wheel Rim",
    keywords: ["rim", "wheel", "alloy wheel", "steel wheel"],
    category: "Tires & Wheels",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "BMW"],
    commonBrands: ["OEM", "Aftermarket", "BBS", "Enkei"]
  },

  // Belts & Hoses
  {
    name: "Timing Belt",
    keywords: ["timing belt", "cam belt", "cambelt"],
    category: "Belts & Hoses",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Subaru"],
    commonBrands: ["Gates", "Contitech", "Dayco", "Bosch"]
  },
  {
    name: "Serpentine Belt",
    keywords: ["serpentine belt", "drive belt", "accessory belt"],
    category: "Belts & Hoses",
    compatibility: ["Toyota", "Honda", "Nissan", "Ford", "Chevrolet"],
    commonBrands: ["Gates", "Dayco", "Contitech", "Bosch"]
  },
  {
    name: "Radiator Hose",
    keywords: ["radiator hose", "coolant hose", "cooling hose"],
    category: "Belts & Hoses",
    compatibility: ["Toyota", "Honda", "Nissan", "Hyundai", "Ford"],
    commonBrands: ["Gates", "Dayco", "Contitech", "Febi"]
  }
]

// Helper functions for intelligent matching
export const findPartsByKeyword = (keyword: string): PartTemplate[] => {
  const searchTerm = keyword.toLowerCase().trim()
  return PARTS_DATABASE.filter(part => 
    part.keywords.some(k => k.includes(searchTerm)) ||
    part.name.toLowerCase().includes(searchTerm)
  )
}

export const getBestMatch = (partName: string): PartTemplate | null => {
  const searchTerm = partName.toLowerCase().trim()
  
  // Exact name match first
  let exactMatch = PARTS_DATABASE.find(part => 
    part.name.toLowerCase() === searchTerm
  )
  if (exactMatch) return exactMatch
  
  // Keyword match with scoring
  const matches = PARTS_DATABASE
    .map(part => {
      let score = 0
      
      // Check if part name contains search term
      if (part.name.toLowerCase().includes(searchTerm)) {
        score += 10
      }
      
      // Check keyword matches
      part.keywords.forEach(keyword => {
        if (keyword.includes(searchTerm)) {
          score += 5
        }
        if (searchTerm.includes(keyword)) {
          score += 3
        }
      })
      
      return { part, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
  
  return matches.length > 0 ? matches[0].part : null
}

export const getCategoryForPart = (partName: string): string => {
  const match = getBestMatch(partName)
  return match?.category || ''
}

export const getCompatibilityForPart = (partName: string): string[] => {
  const match = getBestMatch(partName)
  return match?.compatibility || []
}

export const getCommonBrandsForPart = (partName: string): string[] => {
  const match = getBestMatch(partName)
  return match?.commonBrands || []
}

export const getDescriptionForPart = (partName: string): string => {
  const match = getBestMatch(partName)
  return match?.description || ''
}