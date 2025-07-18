// Mechanic specialization constants for professional service matching

export const SERVICE_TYPES = [
  // Engine & Powertrain
  'Engine Repair',
  'Engine Overhaul',
  'Transmission Repair',
  'Clutch Replacement',
  'Fuel System',
  'Exhaust System',
  'Turbo/Supercharger',
  
  // Electrical & Electronics
  'Electrical System',
  'Battery & Charging',
  'Alternator & Starter',
  'Wiring & Fuses',
  'ECU Diagnostics',
  'Sensor Replacement',
  'Lighting System',
  
  // Braking & Suspension
  'Brake System',
  'Brake Pads/Discs',
  'Suspension Repair',
  'Shock Absorbers',
  'Steering System',
  'Wheel Alignment',
  'Tire Services',
  
  // Climate & Comfort
  'Air Conditioning',
  'Heating System',
  'Cooling System',
  'Radiator Repair',
  'Thermostat',
  'Cabin Filter',
  
  // Body & Exterior
  'Body Work',
  'Paint & Refinishing',
  'Collision Repair',
  'Windshield Repair',
  'Door & Window',
  'Rust Treatment',
  
  // Maintenance & Diagnostics
  'Oil Change',
  'Fluid Service',
  'Filter Replacement',
  'Diagnostic Testing',
  'Preventive Maintenance',
  'Pre-Purchase Inspection',
  'Annual Service',
  
  // Specialized Services
  'Hybrid/Electric Vehicles',
  'Diesel Engines',
  'Performance Tuning',
  'Classic Car Restoration',
  'Fleet Maintenance',
  'Emergency Roadside',
  'Motorcycle Repair'
] as const

export const VEHICLE_BRANDS = [
  // Japanese Brands
  'Toyota',
  'Honda',
  'Nissan',
  'Mazda',
  'Subaru',
  'Mitsubishi',
  'Suzuki',
  'Lexus',
  'Infiniti',
  'Acura',
  
  // German Brands
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Volkswagen',
  'Porsche',
  'Opel',
  'Smart',
  'Mini',
  
  // American Brands
  'Ford',
  'Chevrolet',
  'Dodge',
  'Chrysler',
  'Cadillac',
  'Buick',
  'GMC',
  'Jeep',
  'Lincoln',
  'Tesla',
  
  // Korean Brands
  'Hyundai',
  'Kia',
  'Genesis',
  'Daewoo',
  'SsangYong',
  
  // European Brands
  'Volvo',
  'Peugeot',
  'Renault',
  'Citroën',
  'Fiat',
  'Alfa Romeo',
  'Jaguar',
  'Land Rover',
  'Bentley',
  'Rolls-Royce',
  'Ferrari',
  'Lamborghini',
  'Maserati',
  'Aston Martin',
  'McLaren',
  
  // Chinese Brands
  'BYD',
  'Geely',
  'Chery',
  'Great Wall',
  'Haval',
  'MG',
  
  // Other Brands
  'Tata',
  'Mahindra',
  'Maruti Suzuki',
  'Skoda',
  'Seat',
  'Dacia',
  'Lada'
] as const

export const EXPERIENCE_LEVELS = [
  { value: 1, label: '1 Year' },
  { value: 2, label: '2 Years' },
  { value: 3, label: '3 Years' },
  { value: 4, label: '4 Years' },
  { value: 5, label: '5 Years' },
  { value: 7, label: '7 Years' },
  { value: 10, label: '10 Years' },
  { value: 15, label: '15 Years' },
  { value: 20, label: '20+ Years' }
] as const

export const CERTIFICATIONS = [
  'ASE Certification',
  'Automotive Service Excellence',
  'Manufacturer Certification',
  'Emissions Testing Certification',
  'Air Conditioning Certification',
  'Hybrid/Electric Vehicle Certification',
  'Diesel Engine Certification',
  'Transmission Specialist',
  'Brake Specialist',
  'Electrical Systems Specialist',
  'Engine Performance Specialist',
  'Suspension & Steering Specialist',
  'Paint & Refinishing Certification',
  'Collision Repair Certification',
  'Welding Certification',
  'Safety Inspection License',
  'Diagnostic Equipment Certification'
] as const

export type ServiceType = typeof SERVICE_TYPES[number]
export type VehicleBrand = typeof VEHICLE_BRANDS[number]
export type Certification = typeof CERTIFICATIONS[number]