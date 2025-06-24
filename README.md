# Car Care Connect

A comprehensive full-stack web application that connects Car Owners, Mechanics, and Dealers in a single ecosystem for automotive diagnostics, part listings, repairs, and maintenance insights.

## 🚀 Features

### For Car Owners
- **Vehicle Management**: Add and manage multiple vehicles
- **Repair Requests**: Submit detailed repair requests with photos
- **Real-time Tracking**: Track repair status and receive notifications
- **Cost Analytics**: View maintenance history and spending analytics
- **Mechanic Reviews**: Rate mechanics and view service history

### For Mechanics
- **Service Queue**: Browse and claim available repair requests
- **Diagnosis Management**: Create detailed diagnoses with parts recommendations
- **Parts Integration**: Browse and order parts directly from dealers
- **Performance Tracking**: Monitor ratings, completion rates, and earnings
- **Real-time Updates**: Receive instant notifications for new requests

### For Dealers
- **Inventory Management**: Manage parts catalog with stock tracking
- **Transaction Processing**: Approve/reject mechanic purchase requests
- **Sales Analytics**: View detailed sales reports and trends
- **Low Stock Alerts**: Automatic notifications for inventory management
- **Direct Integration**: Connect directly with mechanics for parts sales

## 🛠️ Tech Stack

### Frontend
- **React 18+** with TypeScript
- **Next.js 14** for full-stack capabilities
- **Tailwind CSS** for styling
- **Ant Design** for UI components
- **Recharts** for data visualization

### Backend & Database
- **Firebase Authentication** (Phone OTP + Google OAuth)
- **Firebase Data Connect** with PostgreSQL
- **Firebase Storage** for image uploads
- **Real-time subscriptions** for live updates

### DevOps
- **Vercel** for deployment
- **GitHub Actions** for CI/CD
- **TypeScript** for type safety

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Firebase project with the following services enabled:
  - Authentication
  - Firestore Database
  - Storage
  - Data Connect (PostgreSQL)
- Git for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd car-care-connect
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAc4NLbLEz5-PmNygKSJh5oZ31x0otP5LY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mechanicsweb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mechanicsweb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mechanicsweb.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=827236770261
NEXT_PUBLIC_FIREBASE_APP_ID=1:827236770261:web:1e5e3fd414cfba28289d5c
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-VB39YE9W4H

# Server-side Firebase configuration
FIREBASE_SERVICE_ACCOUNT_KEY=<your-service-account-key>

# PostgreSQL instance URL for Data Connect
POSTGRESQL_INSTANCE_URL=<your-postgresql-url>
```

### 4. Firebase Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Enable Authentication, Firestore, Storage, and Data Connect

2. **Configure Authentication**:
   - Enable Phone Number authentication
   - Enable Google authentication
   - Add your domain to authorized domains

3. **Setup Database Schema**:
   - Use the provided schema in `src/database/schema.sql`
   - Run the schema in your PostgreSQL instance connected to Firebase Data Connect

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
car-care-connect/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Role-based dashboards
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── auth/              # Authentication components
│   │   └── layout/            # Layout components
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.tsx    # Authentication state
│   │   ├── ThemeContext.tsx   # Theme management
│   │   └── NotificationContext.tsx
│   ├── services/              # Service layer
│   │   ├── firebase.ts        # Firebase configuration
│   │   └── database.ts        # Database operations
│   ├── types/                 # TypeScript type definitions
│   └── database/              # Database schema
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🏗️ Database Schema

The application uses PostgreSQL through Firebase Data Connect with the following main entities:

- **Users**: Store user profiles with role-based access
- **Cars**: Vehicle information owned by car owners
- **Requests**: Service requests from car owners
- **Diagnoses**: Detailed diagnoses created by mechanics
- **Parts**: Spare parts catalog managed by dealers
- **Transactions**: Parts purchase transactions
- **Notifications**: Real-time notifications for all users

See `src/database/schema.sql` for the complete schema definition.

## 🔐 Authentication & Authorization

### Authentication Methods
- **Phone Number (OTP)**: Primary authentication method
- **Google OAuth**: Alternative authentication option

### Role-Based Access Control (RBAC)
- **CarOwner**: Can manage cars, create requests, view diagnoses
- **Mechanic**: Can claim requests, create diagnoses, browse parts
- **Dealer**: Can manage parts inventory, process transactions

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark/Light Mode**: Global theme toggle with system preference detection
- **Real-time Notifications**: In-app notifications using Ant Design
- **Progressive Loading**: Optimized loading states and error handling
- **Accessibility**: WCAG-compliant components and keyboard navigation

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Code Style Guidelines

- Use TypeScript for all new files
- Follow React functional component patterns
- Use Ant Design components consistently
- Implement proper error handling
- Write meaningful commit messages

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm run start
```

## 📊 Performance & Monitoring

- **Core Web Vitals**: Optimized for excellent performance scores
- **Error Monitoring**: Implement Sentry for production error tracking
- **Analytics**: Firebase Analytics for user behavior insights
- **Real-time Updates**: Efficient WebSocket connections for live data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@carcareconnect.com or join our Slack channel.

## 🗺️ Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced analytics dashboard
- [ ] Integration with automotive APIs
- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Payment processing integration
- [ ] Appointment scheduling system
- [ ] Video call integration for remote diagnosis

---

**Built with ❤️ for the automotive community** 