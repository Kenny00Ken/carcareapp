/**
 * Comprehensive Car Makes and Models Database
 * This file contains a structured list of popular car manufacturers and their models
 * Focused on vehicles commonly found in Ghana and West Africa
 */

export interface CarModel {
  id: string
  name: string
  years: number[]
  category: 'sedan' | 'suv' | 'hatchback' | 'pickup' | 'wagon' | 'coupe' | 'convertible' | 'van' | 'crossover'
}

export interface CarMake {
  id: string
  name: string
  country: string
  logo?: string
  models: CarModel[]
}

export const CAR_MAKES_MODELS: CarMake[] = [
  {
    id: 'toyota',
    name: 'Toyota',
    country: 'Japan',
    models: [
      {
        id: 'camry',
        name: 'Camry',
        years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: 'corolla',
        name: 'Corolla',
        years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: 'prius',
        name: 'Prius',
        years: [2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'hatchback'
      },
      {
        id: 'rav4',
        name: 'RAV4',
        years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'highlander',
        name: 'Highlander',
        years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'sienna',
        name: 'Sienna',
        years: [2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'van'
      },
      {
        id: 'tacoma',
        name: 'Tacoma',
        years: [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'pickup'
      },
      {
        id: 'yaris',
        name: 'Yaris',
        years: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'hatchback'
      }
    ]
  },
  {
    id: 'honda',
    name: 'Honda',
    country: 'Japan',
    models: [
      {
        id: 'accord',
        name: 'Accord',
        years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: 'civic',
        name: 'Civic',
        years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: 'cr-v',
        name: 'CR-V',
        years: [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'pilot',
        name: 'Pilot',
        years: [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'odyssey',
        name: 'Odyssey',
        years: [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'van'
      },
      {
        id: 'fit',
        name: 'Fit',
        years: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
        category: 'hatchback'
      }
    ]
  },
  {
    id: 'nissan',
    name: 'Nissan',
    country: 'Japan',
    models: [
      {
        id: 'altima',
        name: 'Altima',
        years: [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: 'sentra',
        name: 'Sentra',
        years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: 'murano',
        name: 'Murano',
        years: [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'pathfinder',
        name: 'Pathfinder',
        years: [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'rogue',
        name: 'Rogue',
        years: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'crossover'
      },
      {
        id: 'frontier',
        name: 'Frontier',
        years: [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'pickup'
      }
    ]
  },
  {
    id: 'hyundai',
    name: 'Hyundai',
    country: 'South Korea',
    models: [
      {
        id: 'elantra',
        name: 'Elantra',
        years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: 'sonata',
        name: 'Sonata',
        years: [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: 'tucson',
        name: 'Tucson',
        years: [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'santa-fe',
        name: 'Santa Fe',
        years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'accent',
        name: 'Accent',
        years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'hatchback'
      }
    ]
  },
  {
    id: 'kia',
    name: 'Kia',
    country: 'South Korea',
    models: [
      {
        id: 'optima',
        name: 'Optima',
        years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
        category: 'sedan'
      },
      {
        id: 'rio',
        name: 'Rio',
        years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'hatchback'
      },
      {
        id: 'sorento',
        name: 'Sorento',
        years: [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'sportage',
        name: 'Sportage',
        years: [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'forte',
        name: 'Forte',
        years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      }
    ]
  },
  {
    id: 'ford',
    name: 'Ford',
    country: 'USA',
    models: [
      {
        id: 'focus',
        name: 'Focus',
        years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
        category: 'hatchback'
      },
      {
        id: 'fusion',
        name: 'Fusion',
        years: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
        category: 'sedan'
      },
      {
        id: 'escape',
        name: 'Escape',
        years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'crossover'
      },
      {
        id: 'explorer',
        name: 'Explorer',
        years: [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'f-150',
        name: 'F-150',
        years: [2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'pickup'
      }
    ]
  },
  {
    id: 'chevrolet',
    name: 'Chevrolet',
    country: 'USA',
    models: [
      {
        id: 'malibu',
        name: 'Malibu',
        years: [2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
        category: 'sedan'
      },
      {
        id: 'cruze',
        name: 'Cruze',
        years: [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
        category: 'sedan'
      },
      {
        id: 'equinox',
        name: 'Equinox',
        years: [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'traverse',
        name: 'Traverse',
        years: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'silverado',
        name: 'Silverado',
        years: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'pickup'
      }
    ]
  },
  {
    id: 'mercedes-benz',
    name: 'Mercedes-Benz',
    country: 'Germany',
    models: [
      {
        id: 'c-class',
        name: 'C-Class',
        years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: 'e-class',
        name: 'E-Class',
        years: [2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: 'gle',
        name: 'GLE',
        years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'glc',
        name: 'GLC',
        years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      }
    ]
  },
  {
    id: 'bmw',
    name: 'BMW',
    country: 'Germany',
    models: [
      {
        id: '3-series',
        name: '3 Series',
        years: [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: '5-series',
        name: '5 Series',
        years: [2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: 'x3',
        name: 'X3',
        years: [2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'x5',
        name: 'X5',
        years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      }
    ]
  },
  {
    id: 'audi',
    name: 'Audi',
    country: 'Germany',
    models: [
      {
        id: 'a4',
        name: 'A4',
        years: [2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: 'a6',
        name: 'A6',
        years: [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: 'q5',
        name: 'Q5',
        years: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      },
      {
        id: 'q7',
        name: 'Q7',
        years: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      }
    ]
  },
  {
    id: 'volkswagen',
    name: 'Volkswagen',
    country: 'Germany',
    models: [
      {
        id: 'jetta',
        name: 'Jetta',
        years: [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'sedan'
      },
      {
        id: 'passat',
        name: 'Passat',
        years: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019],
        category: 'sedan'
      },
      {
        id: 'golf',
        name: 'Golf',
        years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'hatchback'
      },
      {
        id: 'tiguan',
        name: 'Tiguan',
        years: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
        category: 'suv'
      }
    ]
  }
]

// Utility functions for working with car data
export const getCarMakes = (): CarMake[] => {
  return CAR_MAKES_MODELS.sort((a, b) => a.name.localeCompare(b.name))
}

export const getCarMakeById = (makeId: string): CarMake | undefined => {
  return CAR_MAKES_MODELS.find(make => make.id === makeId)
}

export const getModelsByMake = (makeId: string): CarModel[] => {
  const make = getCarMakeById(makeId)
  return make ? make.models.sort((a, b) => a.name.localeCompare(b.name)) : []
}

export const getModelById = (makeId: string, modelId: string): CarModel | undefined => {
  const make = getCarMakeById(makeId)
  return make ? make.models.find(model => model.id === modelId) : undefined
}

export const getAvailableYears = (makeId: string, modelId: string): number[] => {
  const model = getModelById(makeId, modelId)
  return model ? model.years.sort((a, b) => b - a) : [] // Sort descending (newest first)
}

export const searchCarMakes = (query: string): CarMake[] => {
  const lowercaseQuery = query.toLowerCase()
  return CAR_MAKES_MODELS.filter(make => 
    make.name.toLowerCase().includes(lowercaseQuery)
  ).sort((a, b) => a.name.localeCompare(b.name))
}

export const searchModels = (makeId: string, query: string): CarModel[] => {
  const models = getModelsByMake(makeId)
  const lowercaseQuery = query.toLowerCase()
  return models.filter(model => 
    model.name.toLowerCase().includes(lowercaseQuery)
  )
}

export const getCarCategoryLabel = (category: CarModel['category']): string => {
  const labels = {
    sedan: 'Sedan',
    suv: 'SUV',
    hatchback: 'Hatchback',
    pickup: 'Pickup Truck',
    wagon: 'Station Wagon',
    coupe: 'Coupe',
    convertible: 'Convertible',
    van: 'Van/Minivan',
    crossover: 'Crossover'
  }
  return labels[category] || category
}

// Get current year for year selection
export const getCurrentYear = (): number => {
  return new Date().getFullYear()
}

// Get year range for dropdowns (e.g., last 25 years)
export const getYearRange = (yearsBack: number = 25): number[] => {
  const currentYear = getCurrentYear()
  const years: number[] = []
  for (let i = 0; i <= yearsBack; i++) {
    years.push(currentYear - i)
  }
  return years
}