# Troubleshooting Guide - Next.js 404 Errors

## Problem
The browser shows 404 errors for Next.js static files:
- `layout.css:1 Failed to load resource: the server responded with a status of 404 (Not Found)`
- `_next/static/chunks/app/layout.js:1 Failed to load resource: the server responded with a status of 404 (Not Found)`
- `_next/static/chunks/main-app.js Failed to load resource: the server responded with a status of 404 (Not Found)`

## Root Cause
The Next.js development server is not running properly, causing static files to be unavailable.

## Solution Steps

### 1. Clean Installation
```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 2. Clean Build Files
```bash
# Remove Next.js build cache
rm -rf .next
```

### 3. Start Development Server
```bash
# Method 1: Standard development server
npm run dev

# Method 2: Different port if 3000 is busy
npm run dev -- --port 3001

# Method 3: Force clean start
npm run dev -- --reset-cache
```

### 4. Alternative Solutions

#### Option A: Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

#### Option B: Check Dependencies
```bash
# Verify Node.js version (should be 18+)
node --version

# Verify npm version
npm --version

# Check for conflicting processes
lsof -i :3000
```

#### Option C: Environment Variables
```bash
# Create .env.local if missing
touch .env.local

# Add basic configuration
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" >> .env.local
```

### 5. Verify Server Status
Once the server starts, you should see:
```
▲ Next.js 14.2.30
- Local:        http://localhost:3000
- Environments: .env

✓ Ready in 2.3s
```

### 6. Access Application
Open your browser to:
- http://localhost:3000 (default)
- http://localhost:3001 (if using alternate port)

## Common Issues and Fixes

### Issue 1: Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or use different port
npm run dev -- --port 3001
```

### Issue 2: Permission Errors
```bash
# Fix permissions on WSL/Linux
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### Issue 3: Cache Issues
```bash
# Clear all caches
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Issue 4: TypeScript Errors
```bash
# Check for TypeScript errors
npm run type-check

# Fix critical errors before starting server
```

## Development Server Commands

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript errors

### Server Options
```bash
# Different port
npm run dev -- --port 3001

# Enable turbo mode (faster builds)
npm run dev -- --turbo

# Reset cache
npm run dev -- --reset-cache

# Show more verbose output
npm run dev -- --verbose
```

## Mechanic Profile Features Status

✅ **Successfully Implemented:**
- Professional mechanic specializations (40+ service types)
- Vehicle brand expertise (50+ brands)
- Experience level selection
- Professional certifications
- Emergency services availability
- Intelligent request matching
- Enhanced profile UI for mechanics
- Service type selection for car owners

📂 **Files Modified:**
- `src/app/profile/page.tsx` - Enhanced mechanic profile
- `src/app/dashboard/car-owner/requests/page.tsx` - Service type selection
- `src/constants/mechanic.ts` - Professional constants
- `src/types/index.ts` - Fixed type definitions

## Next Steps

1. **Start the development server** using one of the methods above
2. **Test the mechanic profile features** by:
   - Creating a mechanic account
   - Filling in specializations
   - Testing the request matching
3. **Verify the car owner experience** by:
   - Creating service requests
   - Selecting service types
   - Checking if mechanics are properly matched

## Support

If issues persist:
1. Check Node.js version (requires 18+)
2. Verify all dependencies are installed
3. Ensure no firewall blocking ports
4. Try running on a different port
5. Check system resources (memory, disk space)

The mechanic specialization features are fully implemented and ready for testing once the development server is running properly.