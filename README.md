# 🩸 BloodBond - Blood Bank Management System

<div align="center">

![BloodBond Logo](https://img.shields.io/badge/BloodBond-Blood%20Management%20System-red?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo=)

**A comprehensive blood bank management system connecting donors, hospitals, and blood banks**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24+-purple?style=for-the-badge&logo=auth0&logoColor=white)](https://next-auth.js.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Lucide React](https://img.shields.io/badge/Lucide_React-Icons-F56565?style=for-the-badge&logo=lucide&logoColor=white)](https://lucide.dev/)
[![Groq AI](https://img.shields.io/badge/Groq-AI_Chatbot-FF6B6B?style=for-the-badge&logo=ai&logoColor=white)](https://groq.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🔧 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔑 Authentication System](#-authentication-system)
- [👥 User Roles & Permissions](#-user-roles--permissions)
- [📊 Core Modules](#-core-modules)
- [🤖 AI Chatbot Integration](#-ai-chatbot-integration)
- [📱 API Documentation](#-api-documentation)
- [🎨 UI Components](#-ui-components)
- [🔧 Utilities & Hooks](#-utilities--hooks)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)

---

## 🌟 Overview

**BloodBond** is a modern, full-stack blood bank management system designed to streamline blood donation and distribution processes. The platform connects three main stakeholders: **Donors**, **Hospitals**, and **Blood Banks** through an intuitive web interface with real-time notifications, inventory management, and AI-powered assistance.

### 🎯 Mission
To create a seamless, efficient, and life-saving blood management ecosystem that reduces the gap between blood availability and medical needs.

---

## ✨ Key Features

### 🩸 **Blood Request Management**
- **Emergency Blood Requests**: Instant blood requests with nearby blood bank notifications
- **Request Tracking**: Real-time status tracking for all blood requests
- **Smart Matching**: Automatic blood type compatibility checking
- **Status Updates**: Comprehensive request lifecycle management (Pending → Accepted → Fulfilled)

### 👤 **Multi-Role Authentication**
- **JWT-based Authentication**: Secure session management with NextAuth.js
- **Role-based Access Control**: Distinct interfaces for Donors, Hospitals, and Blood Banks
- **Protected Routes**: Secure access to role-specific functionalities
- **Session Persistence**: Automatic session management and refresh

### 📊 **Inventory Management**
- **Dual Inventory Systems**: Separate inventory management for Blood Banks and Hospitals
- **Real-time Blood Inventory**: Live tracking of blood units by type with expiry monitoring
- **Hospital Inventory Management**: Independent hospital blood stock control with batch tracking
- **Automated Logging**: Comprehensive inventory change tracking with audit trails
- **Stock Level Indicators**: Visual indicators for stock status (Good/Low Stock/Critical)

### 🚨 **Emergency System**
- **Emergency Requests**: Priority handling for urgent blood needs
- **Proximity Search**: Location-based blood bank recommendations
- **Instant Notifications**: Real-time alerts to relevant blood banks
- **Guest Access**: Emergency requests without mandatory registration

### 🤖 **AI-Powered Chatbot**
- **Groq AI Integration**: Intelligent assistance for blood-related queries
- **Contextual Help**: Role-specific guidance and information
- **24/7 Availability**: Round-the-clock support for users
- **Multi-language Support**: Accessible assistance for diverse users

### 📱 **Real-time Notifications**
- **Toast Notifications**: Instant feedback for user actions with contextual messaging
- **Emergency Alerts**: Priority notifications for urgent requests
- **Status Updates**: Automatic notifications for request status changes
- **Inventory Alerts**: Low stock and expiry warnings for both blood banks and hospitals
- **Cross-platform Sync**: Consistent notifications across devices

### 🎨 **Enhanced User Interface**
- **Responsive Design**: Mobile-first design with seamless desktop experience
- **Dark/Light Theme**: System-aware theme switching with CSS variables
- **Interactive Landing Page**: Multi-section home page with feature highlights and statistics
- **Role-based Dashboards**: Customized dashboards with relevant statistics and quick actions
- **Modern UI Components**: Clean, accessible interface with Lucide React icons

---

## 🏗️ Architecture

BloodBond follows a modern **JAMstack architecture** with:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer      │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js API)  │◄──►│   (MongoDB)     │
│                 │    │                  │    │                 │
│ • React 18      │    │ • RESTful APIs   │    │ • Blood Banks   │
│ • TailwindCSS   │    │ • Authentication │    │ • Blood Requests│
│ • Lucide Icons  │    │ • Role Guards    │    │ • Donations     │
│ • Context APIs  │    │ • Data Validation│    │ • Inventory     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## 🔧 Tech Stack

### **Frontend**
- **Framework**: Next.js 15.5.2 (App Router)
- **UI Library**: React 18
- **Styling**: TailwindCSS with custom CSS variables for theming
- **Icons**: Lucide React (1,000+ SVG icons)
- **State Management**: React Context API + Custom Hooks

### **Backend**
- **Runtime**: Node.js 20+
- **Framework**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with JWT strategy

### **AI & External Services**
- **AI Chatbot**: Groq API for intelligent assistance
- **Authentication**: NextAuth.js providers
- **Deployment**: Vercel platform

### **Development Tools**
- **Package Manager**: npm
- **Linting**: ESLint with Next.js configuration
- **Build Tool**: Next.js with Turbopack (dev mode)
- **Environment**: .env.local for configuration

---

## 📁 Project Structure

```
bloodbond/
├── 📁 app/                          # Next.js App Router directory
│   ├── 📄 layout.js                 # Root layout with providers
│   ├── 📄 page.js                   # Enhanced landing page with feature sections
│   ├── 📄 globals.css               # Global styles & CSS variables for theming
│   ├── 📁 api/                      # Backend API routes
│   │   ├── 📁 auth/                 # Authentication endpoints
│   │   ├── 📁 requests/             # Blood request management
│   │   ├── 📁 inventory/            # Blood bank inventory APIs
│   │   ├── 📁 hospital-inventory/   # Hospital inventory management APIs
│   │   ├── 📁 emergency/            # Emergency request handling
│   │   └── 📁 chatbot/              # AI chatbot integration
│   ├── 📁 dashboard/                # Role-based dashboards with inventory stats
│   ├── 📁 hospital-inventory/       # Hospital inventory management interface
│   ├── 📁 emergency/                # Emergency request interface
│   ├── 📁 track-request/            # Universal request tracking system
│   └── 📁 login/                    # Authentication pages
├── 📁 components/                   # Reusable UI components
│   ├── 📄 navbar.jsx                # Navigation with role-based menus
│   ├── 📄 Login.jsx                 # Authentication form
│   ├── 📄 Chatbot.jsx               # AI chatbot interface
│   └── 📄 SessionProvider.jsx       # Authentication wrapper
├── 📁 context/                      # React Context providers
│   ├── 📄 ToastContext.jsx          # Notification system
│   └── 📄 ThemeContext.jsx          # Dark/light theme management
├── 📁 hooks/                        # Custom React hooks
│   ├── 📄 useUserRole.js            # Role management hook
│   ├── 📄 useEmergencyNotifications.js # Emergency alerts
│   └── 📄 useRequestStatus.js       # Request tracking
├── 📁 lib/                          # Utility libraries
│   ├── 📄 roleAuth.js               # Role-based authorization
│   ├── 📄 groqClient.js             # AI chatbot client
│   └── 📄 knowledgeBase.js          # Chatbot knowledge base
├── 📁 model/                        # MongoDB schemas
│   ├── 📄 user.js                   # User model with roles
│   ├── 📄 BloodRequest.js           # Blood request schema with status tracking
│   ├── 📄 BloodBank.js              # Blood bank information
│   ├── 📄 BloodInventory.js         # Blood bank inventory management
│   ├── 📄 HospitalInventory.js      # Hospital inventory schema with batch tracking
│   ├── 📄 HospitalInventoryLog.js   # Hospital inventory audit trail
│   ├── 📄 InventoryLog.js           # Blood bank inventory change logs
│   ├── 📄 Donation.js               # Donation records
│   └── 📄 DonationDrive.js          # Donation drive management
├── 📁 db/                           # Database configuration
│   └── 📄 connectDB.mjs             # MongoDB connection
└── 📄 next.config.mjs               # Next.js configuration
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 20+ installed
- MongoDB database (local or cloud)
- Groq API key for chatbot functionality

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/DevSsChar/BloodBond.git
   cd BloodBond
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/bloodbond
   
   # Authentication
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   
   # AI Chatbot
   GROQ_API_KEY=your-groq-api-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

---

## 🔑 Authentication System

### **NextAuth.js Integration**
```javascript
// Authentication configuration
providers: [
  CredentialsProvider({
    async authorize(credentials) {
      // Custom authentication logic
      // Supports email/password authentication
      // JWT token generation and validation
    }
  })
]
```

### **Session Management**
- **JWT Strategy**: Stateless authentication with secure tokens
- **Role Persistence**: User roles stored in JWT payload
- **Auto Refresh**: Automatic session renewal
- **Secure Storage**: HTTP-only cookies for token storage

### **Protected Routes**
```javascript
// Route protection with role-based access
export async function middleware(request) {
  // Check authentication status
  // Validate user roles
  // Redirect unauthorized access
}
```

---

## 👥 User Roles & Permissions

### **🩸 Donor**
- **Profile Management**: Personal information and blood type
- **Request Tracking**: Monitor blood request status
- **Donation History**: Track past donations
- **Emergency Requests**: Submit urgent blood needs

### **🏥 Hospital**
- **Patient Management**: Handle patient blood requirements with comprehensive tracking
- **Hospital Inventory Management**: Independent blood stock management with batch tracking
- **Inventory Dashboard**: Real-time inventory overview with blood type breakdown
- **Stock Level Management**: Minimum stock level configuration with automated alerts
- **Expiry Tracking**: Blood unit expiration monitoring with 30-day warnings
- **Inventory Logs**: Complete audit trail of inventory changes and transactions
- **Bulk Requests**: Submit multiple blood requests efficiently
- **Emergency Access**: Priority blood request handling with instant notifications

### **🏛️ Blood Bank**
- **Inventory Management**: Complete blood stock control
- **Request Processing**: Accept/reject blood requests
- **Donor Coordination**: Manage donor appointments
- **Emergency Notifications**: Receive urgent request alerts

---

## 📊 Core Modules

### **1. Blood Request Management** (`/app/api/requests/`)
```javascript
// Core functionality
- Create new blood requests
- Track request status (pending/accepted/rejected)
- Update request information
- Emergency request processing
- Automated blood bank notifications
```

**Key Features:**
- Real-time status updates
- Blood type compatibility checking
- Emergency priority handling
- Automated notifications to blood banks
- Comprehensive request tracking

### **2. Inventory Management** (`/app/api/inventory/` & `/app/api/hospital-inventory/`)
```javascript
// Blood Bank Inventory Operations
- Real-time blood unit tracking for blood banks
- Blood type categorization (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Expiry date management with 30-day warnings
- Low stock alerts and automated notifications
- Comprehensive inventory transaction logging

// Hospital Inventory Operations
- Independent hospital blood stock management
- Batch number tracking for blood units
- Minimum and maximum stock level configuration
- Complete audit trail with inventory change logs
- Stock level indicators (Good/Low/Critical)
```

**Components:**
- **BloodInventory.js**: Blood bank inventory model
- **HospitalInventory.js**: Hospital-specific inventory model
- **HospitalInventoryLog.js**: Hospital inventory audit trail
- **InventoryLog.js**: Blood bank transaction history
- **Dashboard Integration**: Real-time inventory statistics
- **Automated Alerts**: Low stock and expiry notifications

### **3. Emergency System** (`/app/emergency/`)
```javascript
// Emergency request features
- Guest access (no registration required)
- Location-based blood bank search
- Priority request processing
- Instant notifications to nearby blood banks
- Emergency contact management
```

**Workflow:**
1. Emergency request submission
2. Location detection/input
3. Nearby blood bank identification
4. Priority notification dispatch
5. Real-time status tracking

### **4. Authentication & Authorization** (`/app/api/auth/`)
```javascript
// Security features
- JWT-based authentication
- Role-based access control
- Session management
- Password security
- Multi-role support
```

**Security Measures:**
- Password hashing with bcrypt
- JWT token validation
- Role-based route protection
- Session timeout handling
- CSRF protection

---

## 🤖 AI Chatbot Integration

### **Groq AI Implementation**
```javascript
// Chatbot capabilities
- Blood-related query assistance
- Role-specific guidance
- Emergency procedure information
- Donation process guidance
- Real-time conversation handling
```

**Knowledge Base Topics:**
- Blood donation eligibility
- Blood types and compatibility
- Emergency procedures
- Donation process steps
- Health and safety guidelines

### **Features:**
- **Contextual Responses**: Role-aware assistance
- **Multi-turn Conversations**: Maintains conversation context
- **Emergency Guidance**: Immediate help for urgent situations
- **Educational Content**: Blood donation awareness

---

## 📱 API Documentation

### **Authentication Endpoints**
```
POST /api/auth/signin           # User login
POST /api/auth/signout          # User logout
GET  /api/auth/session          # Current session
POST /api/users/register        # New user registration
```

### **Blood Request Endpoints**
```
GET    /api/requests            # List blood requests with status filtering
POST   /api/requests            # Create new request with automatic notifications
PUT    /api/requests/:id        # Update request status (accept/reject/fulfill)
DELETE /api/requests/:id        # Cancel request with status update
GET    /api/requests/track      # Universal request tracking system
```

### **Blood Bank Inventory Endpoints**
```
GET    /api/inventory           # View blood bank inventory with statistics
POST   /api/inventory           # Update blood bank inventory
GET    /api/inventory/logs      # Blood bank inventory change logs
POST   /api/inventory/alert     # Low stock alerts for blood banks
```

### **Hospital Inventory Endpoints**
```
GET    /api/hospital-inventory  # View hospital inventory with breakdown
POST   /api/hospital-inventory  # Add/update hospital inventory
PUT    /api/hospital-inventory/:id # Update existing inventory item
DELETE /api/hospital-inventory/:id # Remove inventory item
GET    /api/hospital-inventory/logs # Hospital inventory audit logs
```

### **Emergency Endpoints**
```
POST   /api/emergency/request   # Emergency blood request
GET    /api/emergency/nearby-bloodbanks # Find nearby blood banks
POST   /api/emergency/notify    # Send emergency notifications
```

---

## 🎨 UI Components

### **Core Components**

#### **Navigation** (`/components/navbar.jsx`)
- **Role-based Menus**: Customized navigation for Donors, Hospitals, and Blood Banks
- **Hospital Inventory Access**: Direct navigation to hospital inventory management
- **Universal Track Status**: Access to request tracking for all user types
- **Authentication State**: Login/logout functionality with session management
- **Responsive Design**: Mobile-friendly collapsible navigation
- **Theme Toggle**: Dark/light mode switching with system preference detection

#### **Authentication** (`/components/Login.jsx`)
- **Multi-step Registration**: Role selection and profile completion
- **Form Validation**: Client-side and server-side validation
- **Error Handling**: User-friendly error messages
- **Responsive Forms**: Mobile-optimized input fields

#### **Chatbot Interface** (`/components/Chatbot.jsx`)
- **Floating Widget**: Non-intrusive chat interface
- **Real-time Messaging**: Instant AI responses
- **Message History**: Conversation persistence
- **Typing Indicators**: Enhanced user experience

### **Context Providers**

#### **Toast Notifications** (`/context/ToastContext.jsx`)
```javascript
// Notification types
- Success notifications (green)
- Error alerts (red)
- Warning messages (yellow)
- Info notifications (blue)
- Auto-dismiss functionality
```

#### **Theme Management** (`/context/ThemeContext.jsx`)
```javascript
// Advanced theming system
- Dark/light mode toggle with smooth transitions
- System preference detection and auto-switching
- Persistent theme storage with localStorage
- CSS variable management for consistent theming
- Component-level theme awareness
- Enhanced UI consistency across all pages
```

### **Landing Page Enhancements**

#### **Interactive Home Page** (`/app/page.js`)
- **Hero Section**: Compelling call-to-action with live statistics
- **How BloodBond Works**: 6-card feature showcase with icons and descriptions
- **Process Workflow**: 4-step donation process visualization with numbered steps
- **Impact Statistics**: Real-time metrics display with progress indicators
- **Dual Call-to-Action**: Emergency request and donor registration sections
- **Responsive Design**: Mobile-optimized with consistent dark/light theme support

---

## 🔧 Utilities & Hooks

### **Custom Hooks**

#### **Role Management** (`/hooks/useUserRole.js`)
```javascript
// Enhanced role-based functionality
const { userRole, isAuthorized, checkPermission } = useUserRole();
// Handles role checking, authorization, and navigation permissions
// Supports Donor, Hospital, and Blood Bank roles with granular permissions
```

#### **Emergency Notifications** (`/hooks/useEmergencyNotifications.js`)
```javascript
// Comprehensive emergency alert system
const { notifications, markAsRead, clearAll } = useEmergencyNotifications();
// Manages emergency request notifications with priority handling
// Supports real-time updates and cross-role notifications
```

#### **Request Status** (`/hooks/useRequestStatus.js`)
```javascript
// Advanced request tracking functionality
const { requests, updateStatus, trackRequest } = useRequestStatus();
// Handles blood request lifecycle management
// Universal tracking system for all user roles
// Real-time status updates with notification integration
```

#### **Inventory Management** (`/hooks/useInventory.js`)
```javascript
// Dual inventory system management
const { inventory, updateStock, checkLowStock, getExpiryWarnings } = useInventory();
// Handles both blood bank and hospital inventory operations
// Automated alerts for low stock and expiring units
// Real-time inventory synchronization
```

### **Utility Libraries**

#### **Role Authorization** (`/lib/roleAuth.js`)
```javascript
// Permission checking utilities
- hasPermission(user, action)
- checkRole(requiredRole, userRole)
- authorizeAction(user, resource)
```

#### **Groq Client** (`/lib/groqClient.js`)
```javascript
// AI chatbot integration
- Message processing
- Context management
- Response formatting
- Error handling
```

---

## 🚀 Deployment

### **Vercel Deployment** (Recommended)
1. **Connect Repository**
   ```bash
   # Push to GitHub
   git push origin main
   ```

2. **Configure Environment Variables**
   ```env
   MONGODB_URI=your-production-mongodb-uri
   NEXTAUTH_SECRET=your-production-secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   GROQ_API_KEY=your-groq-api-key
   ```

3. **Deploy**
   - Connect GitHub repository to Vercel
   - Add environment variables
   - Deploy automatically on push

### **Manual Deployment**
```bash
# Build for production
npm run build

# Start production server
npm start
```

### **Database Setup**
- **MongoDB Atlas**: Cloud database (recommended)
- **Local MongoDB**: For development
- **Connection String**: Update MONGODB_URI in environment

---

## 🤝 Contributing

### **Development Guidelines**
1. **Code Standards**: Follow ESLint configuration with consistent formatting
2. **Component Structure**: Use functional components with custom hooks
3. **Styling**: TailwindCSS with CSS variables for comprehensive theming support
4. **API Design**: RESTful endpoints with proper error handling and validation
5. **Database Design**: Mongoose schemas with proper relationships and indexing
6. **Authentication**: JWT-based security with role-based access control
7. **Responsive Design**: Mobile-first approach with seamless desktop experience
8. **Theme Consistency**: Dark/light mode support across all components

### **Contribution Steps**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Reporting Issues**
- Use GitHub Issues for bug reports
- Include steps to reproduce
- Provide environment details
- Add screenshots if applicable

---

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs and request features](https://github.com/DevSsChar/BloodBond/issues)
- **Documentation**: Check this README for detailed information
- **AI Assistant**: Use the in-app chatbot for immediate help

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for saving lives through technology**

**BloodBond** - *Connecting blood donors, hospitals, and blood banks for a healthier tomorrow*

### 🆕 **Latest Updates**

- ✅ **Hospital Inventory Management**: Complete independent inventory system for hospitals
- ✅ **Enhanced Landing Page**: Multi-section home page with interactive features and statistics
- ✅ **Universal Request Tracking**: Improved tracking system accessible to all user roles  
- ✅ **Dual Inventory Systems**: Separate inventory management for blood banks and hospitals
- ✅ **Advanced Dashboard Analytics**: Real-time inventory statistics and blood type breakdowns
- ✅ **Improved Theme System**: Comprehensive dark/light mode with CSS variables
- ✅ **Enhanced Navigation**: Role-based navigation with improved user experience
- ✅ **Audit Trail System**: Complete inventory change logging with detailed history

[![GitHub stars](https://img.shields.io/github/stars/DevSsChar/BloodBond?style=social)](https://github.com/DevSsChar/BloodBond)
[![GitHub forks](https://img.shields.io/github/forks/DevSsChar/BloodBond?style=social)](https://github.com/DevSsChar/BloodBond/fork)

</div>
