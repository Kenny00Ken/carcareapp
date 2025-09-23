# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AutoCare Connect** is a comprehensive full-stack web application that connects Car Owners, Mechanics, and Dealers in a single ecosystem for automotive diagnostics, part listings, repairs, and maintenance insights.

## Tech Stack

- **Frontend**: React 18+ with TypeScript, Next.js 14, Tailwind CSS, Ant Design, Recharts
- **Backend**: Firebase Authentication, Firebase Data Connect with PostgreSQL, Firebase Storage
- **Real-time**: Firebase real-time subscriptions for live updates
- **Deployment**: Vercel

## Development Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

Always run `npm run lint` and `npm run type-check` before committing to avoid deployment issues.

## Architecture & Core Concepts

### User Roles & Authentication
- **CarOwner**: Manages vehicles, creates repair requests, views diagnoses
- **Mechanic**: Claims requests, creates diagnoses, orders parts
- **Dealer**: Manages parts inventory, processes parts transactions

Authentication uses Firebase Phone OTP + Google OAuth with role-based access control.

### Database Schema (PostgreSQL via Firebase Data Connect)
Key entities:
- `users` - User profiles with role-based access
- `cars` - Vehicle information owned by car owners
- `requests` - Service requests with status tracking
- `diagnoses` - Detailed mechanic diagnoses with parts recommendations
- `parts` - Dealer parts catalog with inventory management
- `transactions` - Parts purchase transactions between mechanics and dealers
- `activities` - Complete audit trail for all system actions
- `notifications` - Real-time notifications for all users

### Core Services Architecture

**DatabaseService** (`src/services/database.ts`):
- Central data access layer with full CRUD operations
- Real-time subscriptions for live updates
- Comprehensive activity logging for audit trails
- Advanced search and filtering capabilities

**LocationService** (`src/services/location.ts`):
- Enhanced location management with GPS and manual entry
- Address validation and geocoding
- Service area calculations for mechanic matching

**ChatService** (`src/services/chat.ts`):
- Real-time messaging between users
- Unread message tracking
- Message persistence and history

### Key Features

**Real-time System**:
- Live updates for requests, transactions, and notifications
- WebSocket-based subscriptions using Firebase
- No polling - all updates are push-based

**Traceability & Audit**:
- Every action logged with user, timestamp, and metadata
- Complete request lifecycle tracking
- Activity timelines for all entities

**Role-Based Dashboards**:
- `/dashboard/car-owner` - Vehicle and request management
- `/dashboard/mechanic` - Service queue, diagnosis tools, parts catalog
- `/dashboard/dealer` - Inventory management, transaction processing

## Important Conventions

### Currency
- All currencies must be in **GHS** (Ghana Cedis)
- Use proper currency formatting throughout the application

### Code Style
- TypeScript for all new files
- Functional React components with hooks
- Ant Design components for consistency
- Proper error handling and loading states
- Follow existing patterns in similar components

### File Organization
```
src/
├── app/                    # Next.js app directory (pages)
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── chat/             # Chat system components
│   ├── common/           # Shared components
│   ├── ui/               # UI components and animations
│   └── layout/           # Layout components
├── contexts/             # React contexts (Auth, Theme, Notifications, Settings)
├── services/             # Service layer (database, firebase, location, etc.)
├── types/                # TypeScript definitions
├── hooks/                # Custom React hooks
├── utils/                # Utility functions
└── data/                 # Static data and constants
```

### Environment Setup
Required environment variables in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_SERVICE_ACCOUNT_KEY=...
POSTGRESQL_INSTANCE_URL=...
```

## Common Development Patterns

### Database Operations
Always use the `DatabaseService` for data operations:
```typescript
// Get data with real-time updates
const { data, loading, error } = DatabaseService.useSubscription(query);

// Create with automatic logging
await DatabaseService.createRequest(requestData);

// Update with activity tracking
await DatabaseService.updateRequestStatus(id, status, userId);
```

### Authentication & Role Checking
```typescript
// Use AuthContext for user state
const { user, userRole, loading } = useAuth();

// Role-based access control
if (userRole !== 'Mechanic') return <Unauthorized />;
```

### Real-time Features
Most data uses real-time subscriptions. Prefer `useSubscription` hooks over one-time fetches for live data.

### Error Handling
- Use try-catch blocks for async operations
- Display user-friendly error messages using Ant Design notifications
- Log errors for debugging while protecting sensitive information

## Testing
- No specific test framework currently configured
- Manual testing recommended for UI components
- Test real-time features across multiple browser tabs

## Deployment
- Automatic deployment via Vercel on push to main branch
- Environment variables configured in Vercel dashboard
- Firebase project connected for backend services

## Performance Considerations
- Real-time subscriptions are optimized with automatic cleanup
- Image uploads use Firebase Storage with compression
- Database queries include proper indexing
- Loading states implemented throughout the application