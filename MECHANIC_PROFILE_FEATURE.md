# Mechanic Profile Specialization Feature

## Overview
Professional mechanic specialization system that allows mechanics to set their expertise areas and enables intelligent matching with car owner requests.

## Features Implemented

### 1. Mechanic Profile Specializations
- **Service Types**: 40+ professional service categories including:
  - Engine & Powertrain (Engine Repair, Transmission, Clutch, etc.)
  - Electrical & Electronics (ECU Diagnostics, Wiring, Sensors, etc.)  
  - Braking & Suspension (Brake Systems, Suspension, Steering, etc.)
  - Climate & Comfort (A/C, Heating, Cooling System, etc.)
  - Body & Exterior (Paint, Collision Repair, etc.)
  - Maintenance & Diagnostics (Oil Change, Diagnostics, etc.)
  - Specialized Services (Hybrid/Electric, Diesel, Performance, etc.)

- **Vehicle Brands**: 50+ vehicle brands including:
  - Japanese (Toyota, Honda, Nissan, Mazda, Subaru, etc.)
  - German (BMW, Mercedes-Benz, Audi, Volkswagen, etc.)
  - American (Ford, Chevrolet, Tesla, etc.)
  - Korean (Hyundai, Kia, Genesis, etc.)
  - European (Volvo, Peugeot, Renault, etc.)
  - Chinese & Other brands

- **Experience Levels**: 1-20+ years of professional experience
- **Certifications**: Professional certifications (ASE, Manufacturer, etc.)
- **Emergency Services**: Availability for urgent/emergency repairs

### 2. Enhanced Profile Interface
- **Mechanic-specific Form Sections**: Only visible to mechanics
- **Service Type Multi-Select**: Search and filter through 40+ service types
- **Vehicle Brand Multi-Select**: Select specialized brands with search
- **Experience Level Selector**: Dropdown for years of experience
- **Emergency Services Toggle**: Switch for emergency availability
- **Certification Multi-Select**: Professional certifications
- **Real-time Validation**: Ensures required fields are filled

### 3. Intelligent Request Matching
- **Specialization Scoring**: Mechanics scored based on service type match
- **Vehicle Brand Matching**: Bonus points for matching vehicle brands
- **Experience Weight**: More experienced mechanics get higher scores
- **Emergency Service Priority**: Emergency-capable mechanics prioritized for urgent requests
- **Proximity + Specialization**: Balanced scoring system (30% proximity, 20% specialization, 25% availability, 15% rating, 10% price)

### 4. Car Owner Request Enhancement
- **Service Type Selection**: Car owners can select specific service types
- **Better Matching**: Requests matched to mechanics with relevant expertise
- **Improved Success Rate**: Higher likelihood of finding qualified mechanics

## Technical Implementation

### Files Modified/Created

1. **`/src/constants/mechanic.ts`** - NEW
   - Service type constants (40+ categories)
   - Vehicle brand constants (50+ brands)
   - Experience level options
   - Professional certifications
   - TypeScript type definitions

2. **`/src/app/profile/page.tsx`** - ENHANCED
   - Added mechanic-specific form sections
   - Service type multi-select with search
   - Vehicle brand multi-select with search
   - Experience level selector
   - Emergency services toggle
   - Certification multi-select
   - Form validation for required fields
   - Enhanced UI with proper icons and tooltips

3. **`/src/app/dashboard/car-owner/requests/page.tsx`** - ENHANCED
   - Added service type selection for requests
   - Better matching parameters passed to mechanic service
   - Improved request creation flow

4. **`/src/types/index.ts`** - UPDATED
   - Fixed `any` type in `location_data.address_components`
   - Proper type definitions for mechanic specializations

5. **`/src/services/mechanicMatching.ts`** - REVIEWED
   - Already implemented specialization scoring
   - Vehicle brand matching logic
   - Service type matching algorithm
   - Emergency service prioritization

## Professional Matching Algorithm

### Scoring Factors
1. **Proximity Score (30%)**: Distance-based scoring
2. **Availability Score (25%)**: Real-time availability check
3. **Specialization Score (20%)**: Service type + vehicle brand match
4. **Rating Score (15%)**: Historical customer ratings
5. **Price Score (10%)**: Competitive pricing within range
6. **Emergency Bonus (10%)**: Additional points for emergency services

### Specialization Matching Logic
- **Service Type Match**: 70% weight - exact and partial matches
- **Vehicle Brand Match**: 30% weight - exact brand match or "other" category
- **Experience Bonus**: Higher experience gets small bonus
- **Certification Bonus**: Professional certifications add credibility

## Usage Instructions

### For Mechanics
1. Navigate to Profile page
2. Fill in professional specializations section (only visible to mechanics)
3. Select service types you specialize in (required)
4. Select vehicle brands you work with (required)
5. Choose experience level
6. Toggle emergency services availability
7. Add professional certifications (optional)
8. Save profile

### For Car Owners
1. Create a service request
2. Select specific service types (optional but recommended)
3. System automatically matches your vehicle brand
4. Get connected to mechanics with relevant expertise

## Database Schema

### User Profile Enhancement
```typescript
interface User {
  // ... existing fields
  mechanic_specializations?: {
    service_types: string[]        // Required for mechanics
    vehicle_brands: string[]       // Required for mechanics  
    experience_years?: number      // 1-20+ years
    certifications?: string[]      // Professional certs
    emergency_services?: boolean   // Emergency availability
  }
}
```

### Request Enhancement
```typescript
interface Request {
  // ... existing fields
  service_types?: string[]  // Selected service types
  vehicle_brand?: string    // Automatically from car data
}
```

## Benefits

1. **Better Match Quality**: Mechanics get requests matching their expertise
2. **Improved Service Quality**: Car owners get specialists for their specific needs
3. **Professional Credibility**: Mechanics can showcase their specializations
4. **Emergency Service Matching**: Priority matching for urgent requests
5. **Competitive Advantage**: Specialized mechanics stand out in the marketplace
6. **Data-Driven Matching**: Algorithm considers multiple factors for optimal matches

## Future Enhancements

1. **Mechanic Badges**: Visual badges for specializations on profile
2. **Service History Tracking**: Track specialization performance over time
3. **Dynamic Pricing**: Adjust pricing based on specialization demand
4. **Certification Verification**: Integrate with certification authorities
5. **Advanced Filtering**: Allow car owners to filter by specialization
6. **Performance Analytics**: Track matching success rates by specialization

## Testing

The implementation includes:
- ✅ TypeScript type safety
- ✅ Form validation
- ✅ Professional service categories
- ✅ Vehicle brand coverage
- ✅ Matching algorithm integration
- ✅ Emergency service prioritization
- ✅ Real-world service scenarios

## Deployment Notes

1. Ensure all mechanics update their profiles with specializations
2. Train customer service on new specialization features
3. Monitor matching success rates and adjust algorithm if needed
4. Consider gradual rollout to test performance impact
5. Update mobile app to include specialization features

This feature transforms the platform from a generic mechanic matching service to a professional, specialized automotive service marketplace.