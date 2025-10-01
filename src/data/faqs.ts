export interface FAQ {
  id: string
  category: 'general' | 'car-owner' | 'mechanic' | 'dealer' | 'payments' | 'technical'
  question: string
  answer: string
  keywords: string[]
}

export const faqs: FAQ[] = [
  // General FAQs
  {
    id: 'what-is-autocare',
    category: 'general',
    question: 'What is AutoCare?',
    answer: 'AutoCare is Ghana\'s premier automotive platform that connects car owners with trusted mechanics and reliable parts dealers. We provide a seamless ecosystem for vehicle diagnostics, repairs, parts sourcing, and maintenance tracking.',
    keywords: ['about', 'what', 'platform', 'service', 'autocare']
  },
  {
    id: 'how-does-it-work',
    category: 'general',
    question: 'How does AutoCare work?',
    answer: 'AutoCare works in three simple steps: 1) Car owners create repair requests with vehicle details and issues. 2) Verified mechanics review requests and provide diagnoses with repair estimates. 3) Mechanics can order required parts from certified dealers through our platform. Everything is tracked and managed in one place.',
    keywords: ['how', 'work', 'process', 'steps', 'use']
  },
  {
    id: 'who-can-use',
    category: 'general',
    question: 'Who can use AutoCare?',
    answer: 'AutoCare is designed for three user types: Car Owners seeking reliable automotive services, Mechanics providing professional repair services, and Parts Dealers supplying genuine automotive parts. Each user type has a dedicated dashboard with role-specific features.',
    keywords: ['who', 'users', 'roles', 'types', 'access']
  },
  {
    id: 'is-it-free',
    category: 'general',
    question: 'Is AutoCare free to use?',
    answer: 'Creating an account and browsing services is completely free for car owners. Mechanics and dealers may have service fees for transactions processed through the platform. All fees are transparent and displayed before confirming any transaction.',
    keywords: ['free', 'cost', 'price', 'fees', 'charges']
  },
  {
    id: 'service-areas',
    category: 'general',
    question: 'What areas does AutoCare cover?',
    answer: 'AutoCare currently serves customers across Ghana, with mechanics and dealers in major cities including Accra, Kumasi, Takoradi, and Tamale. We are continuously expanding our network to cover more areas.',
    keywords: ['location', 'area', 'coverage', 'ghana', 'cities']
  },

  // Car Owner FAQs
  {
    id: 'create-request',
    category: 'car-owner',
    question: 'How do I create a repair request?',
    answer: 'To create a repair request: 1) Log in to your car owner dashboard. 2) Click "Create Request" and select your vehicle. 3) Describe the issue, add photos if helpful, and specify urgency. 4) Submit the request and wait for mechanics to respond with diagnoses and estimates.',
    keywords: ['request', 'repair', 'create', 'submit', 'service']
  },
  {
    id: 'choose-mechanic',
    category: 'car-owner',
    question: 'How do I choose a mechanic?',
    answer: 'When mechanics respond to your request, you can review their profiles, ratings, certifications, estimated costs, and timeline. Compare multiple mechanics and select the one that best fits your needs and budget. All mechanics on AutoCare are verified professionals.',
    keywords: ['choose', 'select', 'mechanic', 'pick', 'find']
  },
  {
    id: 'track-repair',
    category: 'car-owner',
    question: 'Can I track my repair progress?',
    answer: 'Yes! AutoCare provides real-time tracking of your repair request. You\'ll receive notifications when mechanics respond, when work begins, when parts are ordered, and when the repair is completed. You can also chat directly with your mechanic for updates.',
    keywords: ['track', 'status', 'progress', 'updates', 'notifications']
  },
  {
    id: 'add-vehicle',
    category: 'car-owner',
    question: 'How do I add my vehicle information?',
    answer: 'Go to your dashboard and click "Add Vehicle". Enter your vehicle\'s make, model, year, VIN (optional), and current mileage. You can add photos and notes about your vehicle. This information helps mechanics provide accurate diagnoses.',
    keywords: ['vehicle', 'car', 'add', 'register', 'information']
  },
  {
    id: 'payment-methods',
    category: 'car-owner',
    question: 'What payment methods are accepted?',
    answer: 'AutoCare accepts Mobile Money (MTN, Vodafone, AirtelTigo), credit/debit cards (Visa, Mastercard), and bank transfers. All payments are processed securely through our verified payment partners.',
    keywords: ['payment', 'pay', 'money', 'methods', 'mobile']
  },

  // Mechanic FAQs
  {
    id: 'become-mechanic',
    category: 'mechanic',
    question: 'How do I become a mechanic on AutoCare?',
    answer: 'To join as a mechanic: 1) Sign up and select "Mechanic" as your role. 2) Complete your profile with business information. 3) Upload required certifications and licenses. 4) Our team will verify your credentials (usually within 24-48 hours). 5) Once approved, you can start accepting repair requests.',
    keywords: ['register', 'join', 'mechanic', 'signup', 'verify']
  },
  {
    id: 'claim-request',
    category: 'mechanic',
    question: 'How do I claim repair requests?',
    answer: 'Browse available requests in your dashboard, filtered by location and vehicle type. Click on a request to view details. If you can handle the repair, click "Claim Request" and provide your diagnosis, estimated cost, and timeline. Car owners will review and can select your offer.',
    keywords: ['claim', 'accept', 'request', 'take', 'job']
  },
  {
    id: 'order-parts',
    category: 'mechanic',
    question: 'How do I order parts through AutoCare?',
    answer: 'When creating a diagnosis, you can search our parts marketplace and add required parts to your estimate. Once the car owner approves, you can place orders directly with dealers. Track part availability, pricing, and delivery status all in one place.',
    keywords: ['parts', 'order', 'buy', 'purchase', 'marketplace']
  },
  {
    id: 'mechanic-fees',
    category: 'mechanic',
    question: 'What fees do mechanics pay?',
    answer: 'AutoCare charges a small service fee on completed transactions to maintain the platform. The fee structure is transparent and shown in your dashboard. There are no upfront costs or monthly subscriptions - you only pay when you successfully complete a job.',
    keywords: ['fees', 'cost', 'charges', 'commission', 'payment']
  },
  {
    id: 'mechanic-ratings',
    category: 'mechanic',
    question: 'How do ratings and reviews work?',
    answer: 'After completing a repair, car owners can rate your service and leave reviews. Your overall rating is displayed on your profile and helps build trust with potential customers. Maintaining high ratings improves your visibility on the platform.',
    keywords: ['rating', 'reviews', 'feedback', 'reputation', 'stars']
  },

  // Dealer FAQs
  {
    id: 'become-dealer',
    category: 'dealer',
    question: 'How do I become a parts dealer on AutoCare?',
    answer: 'To join as a dealer: 1) Sign up and select "Dealer" as your role. 2) Provide business registration and tax documents. 3) Upload product catalogs and inventory. 4) Complete verification (24-48 hours). 5) Start receiving orders from mechanics across Ghana.',
    keywords: ['dealer', 'register', 'join', 'parts', 'supplier']
  },
  {
    id: 'list-parts',
    category: 'dealer',
    question: 'How do I list parts on AutoCare?',
    answer: 'Access your dealer dashboard and go to "Inventory Management". Add parts with detailed information: part name, manufacturer, part number, compatibility, pricing, stock quantity, and photos. Ensure all information is accurate to help mechanics find the right parts quickly.',
    keywords: ['list', 'add', 'parts', 'inventory', 'products']
  },
  {
    id: 'manage-inventory',
    category: 'dealer',
    question: 'How do I manage my inventory?',
    answer: 'Your dashboard provides real-time inventory management. Update stock levels, pricing, and availability instantly. Set low-stock alerts to avoid stockouts. View analytics on popular parts and sales trends to optimize your inventory.',
    keywords: ['inventory', 'stock', 'manage', 'update', 'quantity']
  },
  {
    id: 'dealer-payments',
    category: 'dealer',
    question: 'How and when do I receive payments?',
    answer: 'Payments are transferred to your registered bank account or Mobile Money wallet after order completion and confirmation. Standard processing time is 1-3 business days. You can track all transactions and payment history in your dashboard.',
    keywords: ['payment', 'payout', 'money', 'receive', 'transfer']
  },

  // Payment FAQs
  {
    id: 'payment-security',
    category: 'payments',
    question: 'Is my payment information secure?',
    answer: 'Absolutely. AutoCare uses industry-standard 256-bit SSL encryption and PCI DSS compliant payment processors. We never store complete payment card information on our servers. All transactions are protected by multiple layers of security.',
    keywords: ['security', 'safe', 'secure', 'payment', 'protection']
  },
  {
    id: 'refund-policy',
    category: 'payments',
    question: 'What is the refund policy?',
    answer: 'Refunds are handled on a case-by-case basis. If a service is not completed as agreed or parts are defective, you can request a refund through our dispute resolution system. We review all requests fairly and aim to resolve disputes within 5-7 business days.',
    keywords: ['refund', 'money back', 'dispute', 'cancel', 'return']
  },
  {
    id: 'payment-failed',
    category: 'payments',
    question: 'What if my payment fails?',
    answer: 'If a payment fails, check your account balance and payment details. Ensure your card or Mobile Money account is active. Try again or use an alternative payment method. If issues persist, contact our support team for assistance.',
    keywords: ['failed', 'error', 'payment', 'problem', 'issue']
  },

  // Technical FAQs
  {
    id: 'account-security',
    category: 'technical',
    question: 'How do I secure my account?',
    answer: 'Use a strong, unique password and enable two-factor authentication in your account settings. Never share your login credentials. Log out after each session on shared devices. Report any suspicious activity to our support team immediately.',
    keywords: ['security', 'password', 'account', 'safe', 'protect']
  },
  {
    id: 'forgot-password',
    category: 'technical',
    question: 'I forgot my password. What should I do?',
    answer: 'Click "Forgot Password" on the login page, enter your registered phone number or email, and follow the instructions to reset your password. You\'ll receive a verification code to create a new password.',
    keywords: ['password', 'forgot', 'reset', 'recover', 'login']
  },
  {
    id: 'update-profile',
    category: 'technical',
    question: 'How do I update my profile information?',
    answer: 'Go to Settings > Profile in your dashboard. You can update your name, contact information, address, business details, and profile photo. Changes are saved automatically. Some changes may require re-verification.',
    keywords: ['update', 'profile', 'edit', 'change', 'settings']
  },
  {
    id: 'notifications',
    category: 'technical',
    question: 'How do I manage notifications?',
    answer: 'Go to Settings > Notifications to customize your notification preferences. Choose which events trigger notifications (new requests, messages, payments) and how you receive them (push, email, SMS). You can also set quiet hours.',
    keywords: ['notifications', 'alerts', 'settings', 'manage', 'preferences']
  },
  {
    id: 'mobile-app',
    category: 'technical',
    question: 'Is there a mobile app?',
    answer: 'AutoCare is fully optimized for mobile browsers, providing a seamless experience on smartphones and tablets. A dedicated mobile app is currently in development and will be available soon on both iOS and Android.',
    keywords: ['mobile', 'app', 'android', 'ios', 'phone']
  },
  {
    id: 'contact-support',
    category: 'technical',
    question: 'How do I contact customer support?',
    answer: 'You can reach our support team via: Email (support@autocare.com), Phone (+233 555-0123), or the in-app chat assistant. Our team is available Monday-Friday, 8:00 AM - 6:00 PM GMT. We aim to respond within 24 hours.',
    keywords: ['support', 'contact', 'help', 'assistance', 'customer service']
  },
  {
    id: 'report-issue',
    category: 'technical',
    question: 'How do I report a problem or bug?',
    answer: 'If you encounter a technical issue, please report it through Settings > Help & Support > Report Issue. Include a detailed description, screenshots if possible, and steps to reproduce the problem. Our technical team will investigate promptly.',
    keywords: ['bug', 'issue', 'problem', 'report', 'error']
  },
  {
    id: 'data-privacy',
    category: 'technical',
    question: 'How is my data protected?',
    answer: 'We take data privacy seriously. All personal information is encrypted and stored securely. We comply with Ghana\'s Data Protection Act and international best practices. Review our Privacy Policy for complete details on data collection, usage, and protection.',
    keywords: ['privacy', 'data', 'protection', 'gdpr', 'security']
  }
]

export const faqCategories = [
  { value: 'general', label: 'General', icon: '💬' },
  { value: 'car-owner', label: 'Car Owners', icon: '🚗' },
  { value: 'mechanic', label: 'Mechanics', icon: '🔧' },
  { value: 'dealer', label: 'Parts Dealers', icon: '📦' },
  { value: 'payments', label: 'Payments', icon: '💳' },
  { value: 'technical', label: 'Technical', icon: '⚙️' }
]
