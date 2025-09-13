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

### 🩸 **Advanced Blood Request Management**
- **Emergency Blood Requests**: Instant blood requests with nearby blood bank notifications
- **Request Tracking**: Real-time status tracking for all blood requests
- **Smart Matching**: Automatic blood type compatibility checking with blood compatibility matrix
- **Status Updates**: Comprehensive request lifecycle management (Pending → Accepted → Fulfilled)
- **Hospital Request System**: Specialized hospital-to-blood bank request management
- **Bulk Request Processing**: Handle multiple blood requests efficiently

### 👤 **Multi-Role Authentication**
- **JWT-based Authentication**: Secure session management with NextAuth.js
- **Role-based Access Control**: Distinct interfaces for Donors, Hospitals, and Blood Banks
- **Protected Routes**: Secure access to role-specific functionalities with RoleGuard components
- **Session Persistence**: Automatic session management and refresh
- **Multi-step Registration**: Comprehensive registration flow with role-specific profile completion

### 📊 **Comprehensive Inventory Management**
- **Dual Inventory Systems**: Separate inventory management for Blood Banks and Hospitals
- **Real-time Blood Inventory**: Live tracking of blood units by type with expiry monitoring
- **Hospital Inventory Management**: Independent hospital blood stock control with batch tracking
- **Automated Logging**: Comprehensive inventory change tracking with audit trails
- **Stock Level Indicators**: Visual indicators for stock status (Good/Low Stock/Critical)
- **Expiry Management**: Advanced expiration tracking with automated alerts

### 🚨 **Enhanced Emergency System**
- **Emergency Requests**: Priority handling for urgent blood needs with emergency call interface
- **Proximity Search**: Location-based blood bank recommendations
- **Instant Notifications**: Real-time alerts to relevant blood banks
- **Guest Access**: Emergency requests without mandatory registration
- **Emergency Contact Management**: Direct communication channels for urgent situations

### 🩸 **Donation Drive Management**
- **Drive Creation**: Blood banks can create and manage donation drives
- **Registration System**: Donors can register for specific drives
- **Drive Analytics**: Comprehensive statistics and reporting for donation drives
- **Automated Notifications**: Drive reminders and updates to registered donors
- **Multi-location Support**: Manage drives across different locations

### 🔗 **Donor-Blood Bank Connection System**
- **Direct Donor Requests**: Blood banks can request specific donors for rare blood types
- **Donor Contact System**: Secure communication between blood banks and donors
- **Critical Settings**: Donors can set availability for emergency situations
- **Response Management**: Streamlined donor response tracking and management
- **Smart Matching**: AI-powered donor-request matching based on location and blood type

### 🤖 **AI-Powered Chatbot**
- **Groq AI Integration**: Intelligent assistance for blood-related queries
- **Contextual Help**: Role-specific guidance and information
- **24/7 Availability**: Round-the-clock support for users
- **Enhanced Chat Interface**: Improved chat UI with message processing and history

### 📱 **Real-time Notifications**
- **Toast Notifications**: Instant feedback for user actions with contextual messaging
- **Emergency Alerts**: Priority notifications for urgent requests with emergency notification hooks
- **Status Updates**: Automatic notifications for request status changes
- **Inventory Alerts**: Low stock and expiry warnings for both blood banks and hospitals
- **Cross-platform Sync**: Consistent notifications across devices

### 🎨 **Enhanced User Interface**
- **Responsive Design**: Mobile-first design with seamless desktop experience
- **Dark/Light Theme**: System-aware theme switching with CSS variables
- **Interactive Landing Page**: Multi-section home page with feature highlights and statistics
- **Role-based Dashboards**: Customized dashboards with relevant statistics and quick actions
- **Modern UI Components**: Clean, accessible interface with Lucide React icons and advanced form components

---

## 🏗️ Architecture

BloodBond follows a modern **JAMstack architecture** with enhanced modularity:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer      │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js API)  │◄──►│   (MongoDB)     │
│                 │    │                  │    │                 │
│ • React 18      │    │ • RESTful APIs   │    │ • Blood Banks   │
│ • TailwindCSS   │    │ • Authentication │    │ • Blood Requests│
│ • Lucide Icons  │    │ • Role Guards    │    │ • Donations     │
│ • Context APIs  │    │ • Data Validation│    │ • Inventory     │
│ • Custom Hooks  │    │ • AI Integration │    │ • Drive Management│
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
- **Form Management**: Advanced form components with validation

### **Backend**
- **Runtime**: Node.js 20+
- **Framework**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with JWT strategy
- **Data Processing**: Advanced message processing and blood compatibility checking

### **AI & External Services**
- **AI Chatbot**: Groq API for intelligent assistance with enhanced knowledge base
- **Authentication**: NextAuth.js providers with multi-role support
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
│   ├── 📄 chatbot.css               # Specialized chatbot styling
│   ├── 📄 dark-theme.css            # Dark theme specific styles
│   ├── 📁 api/                      # Backend API routes
│   │   ├── 📁 auth/                 # Enhanced authentication with session management
│   │   ├── 📁 requests/             # Blood request management with tracking
│   │   ├── 📁 inventory/            # Blood bank inventory APIs with logging
│   │   ├── 📁 hospital-inventory/   # Hospital inventory management APIs
│   │   ├── 📁 hospital-requests/    # Hospital-specific request handling
│   │   ├── 📁 emergency/            # Emergency request handling
│   │   ├── 📁 chatbot/              # AI chatbot integration
│   │   ├── 📁 bloodbank/            # Blood bank specific operations
│   │   ├── 📁 donors/               # Donor management and statistics
│   │   ├── 📁 donations/            # Donation tracking and management
│   │   ├── 📁 donation-drives/      # Drive creation and management
│   │   ├── 📁 donor-contact-request/# Donor-blood bank communication
│   │   └── 📁 bloodbank-donor-requests/ # Blood bank to donor requests
│   ├── 📁 dashboard/                # Role-based dashboards with enhanced analytics
│   │   ├── 📁 donor/                # Donor-specific dashboard
│   │   ├── 📁 hospital/             # Hospital dashboard with inventory overview
│   │   └── 📁 bloodbank/            # Blood bank dashboard with drive management
│   ├── 📁 hospital-inventory/       # Hospital inventory management interface
│   ├── 📁 emergency/                # Emergency request interface
│   ├── 📁 emergency-call/           # Emergency call interface
│   ├── 📁 track-request/            # Universal request tracking system
│   ├── 📁 donor-requests/           # Donor request management
│   ├── 📁 hospital-requests/        # Hospital request interface
│   ├── 📁 hospital-request-acceptance/ # Hospital request acceptance
│   ├── 📁 register/                 # Multi-role registration system
│   └── 📁 login/                    # Authentication pages
├── 📁 components/                   # Reusable UI components
│   ├── 📄 navbar.jsx                # Enhanced navigation with role-based menus
│   ├── 📄 Login.jsx                 # Authentication form
│   ├── 📄 Chatbot.jsx               # AI chatbot interface
│   ├── 📄 ChatInput.jsx             # Enhanced chat input component
│   ├── 📄 ChatMessage.jsx           # Message display component
│   ├── 📄 RoleGuard.jsx             # Role-based access control
│   ├── 📄 RoleSelection.jsx         # Registration role selection
│   ├── 📄 ProtectedRoute.jsx        # Route protection wrapper
│   ├── 📄 SessionProvider.jsx       # Authentication wrapper
│   ├── 📄 footer.jsx                # Site footer
│   └── 📁 forms/                    # Specialized form components
├── 📁 context/                      # React Context providers
│   ├── 📄 ToastContext.jsx          # Enhanced notification system
│   └── 📄 ThemeContext.jsx          # Advanced dark/light theme management
├── 📁 hooks/                        # Custom React hooks
│   ├── 📄 useUserRole.js            # Enhanced role management hook
│   ├── 📄 useEmergencyNotifications.js # Emergency alerts system
│   ├── 📄 useEmergencyRequestCheck.js # Emergency request validation
│   └── 📄 useRequestStatus.js       # Advanced request tracking
├── 📁 lib/                          # Utility libraries
│   ├── 📄 roleAuth.js               # Role-based authorization
│   ├── 📄 groqClient.js             # AI chatbot client
│   ├── 📄 knowledgeBase.js          # Enhanced chatbot knowledge base
│   ├── 📄 messageProcessor.js       # Message processing utilities
│   └── 📄 bloodCompatibility.js     # Blood type compatibility matrix
├── 📁 model/                        # MongoDB schemas
│   ├── 📄 user.js                   # Enhanced user model with roles
│   ├── 📄 BloodRequest.js           # Blood request schema with status tracking
│   ├── 📄 BloodBank.js              # Blood bank information
│   ├── 📄 BloodInventory.js         # Blood bank inventory management
│   ├── 📄 HospitalInventory.js      # Hospital inventory schema with batch tracking
│   ├── 📄 HospitalInventoryLog.js   # Hospital inventory audit trail
│   ├── 📄 HospitalProfile.js        # Hospital profile management
│   ├── 📄 HospitalRequest.js        # Hospital-specific requests
│   ├── 📄 InventoryLog.js           # Blood bank inventory change logs
│   ├── 📄 Donation.js               # Donation records
│   ├── 📄 DonationDrive.js          # Donation drive management
│   ├── 📄 DriveRegistration.js      # Drive registration tracking
│   ├── 📄 Doner.js                  # Donor profile and statistics
│   └── 📄 DonorContactRequest.js    # Donor-blood bank communication
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

### **Enhanced NextAuth.js Integration**
```javascript
// Advanced authentication configuration
providers: [
  CredentialsProvider({
    async authorize(credentials) {
      // Custom authentication logic with role validation
      // Multi-step registration support
      // Enhanced session management
      // JWT token generation and validation
    }
  })
]
```

### **Session Management**
- **JWT Strategy**: Stateless authentication with secure tokens
- **Role Persistence**: User roles stored in JWT payload with session refresh
- **Auto Refresh**: Automatic session renewal with auth refresh endpoints
- **Secure Storage**: HTTP-only cookies for token storage
- **Session Update**: Dynamic session updates for profile changes

### **Protected Routes**
```javascript
// Enhanced route protection with role-based access
export async function middleware(request) {
  // Check authentication status
  // Validate user roles with granular permissions
  // Redirect unauthorized access
  // Handle emergency access exceptions
}
```

---

## 👥 User Roles & Permissions

### **🩸 Donor**
- **Enhanced Profile Management**: Comprehensive donor profile with medical history
- **Request Tracking**: Monitor blood request status with real-time updates
- **Donation History**: Track past donations with detailed statistics
- **Emergency Requests**: Submit urgent blood needs with priority handling
- **Drive Participation**: Register for and participate in donation drives
- **Critical Settings**: Configure availability for emergency blood needs
- **Contact Responses**: Respond to blood bank contact requests

### **🏥 Hospital**
- **Patient Management**: Handle patient blood requirements with comprehensive tracking
- **Hospital Inventory Management**: Independent blood stock management with batch tracking
- **Inventory Dashboard**: Real-time inventory overview with blood type breakdown
- **Stock Level Management**: Minimum stock level configuration with automated alerts
- **Expiry Tracking**: Blood unit expiration monitoring with 30-day warnings
- **Inventory Logs**: Complete audit trail of inventory changes and transactions
- **Hospital Requests**: Submit and manage hospital-to-blood bank requests
- **Request Acceptance**: Process incoming blood requests with status management
- **Emergency Access**: Priority blood request handling with instant notifications

### **🏛️ Blood Bank**
- **Advanced Inventory Management**: Complete blood stock control with analytics
- **Request Processing**: Accept/reject blood requests with automated notifications
- **Donor Coordination**: Manage donor appointments and communication
- **Emergency Notifications**: Receive urgent request alerts with proximity-based matching
- **Donation Drive Management**: Create, manage, and track donation drives
- **Donor Contact System**: Direct communication with registered donors
- **Analytics Dashboard**: Comprehensive statistics and reporting tools
- **Multi-location Management**: Handle operations across different locations

---

## 📊 Core Modules

### **1. Enhanced Blood Request Management** (`/app/api/requests/`)
```javascript
// Advanced functionality
- Create new blood requests with automatic blood bank matching
- Track request status with real-time updates (pending/accepted/rejected/fulfilled)
- Update request information with audit trails
- Emergency request processing with priority handling
- Automated blood bank notifications with proximity search
- Hospital-specific request management
- Bulk request processing capabilities
```

### **2. Comprehensive Inventory Management** (`/app/api/inventory/` & `/app/api/hospital-inventory/`)
```javascript
// Blood Bank Inventory Operations
- Real-time blood unit tracking with advanced analytics
- Blood type categorization with compatibility matrix
- Expiry date management with automated alerts
- Low stock alerts with configurable thresholds
- Comprehensive inventory transaction logging
- Multi-location inventory support

// Hospital Inventory Operations
- Independent hospital blood stock management
- Batch number tracking with expiration monitoring
- Minimum and maximum stock level configuration
- Complete audit trail with detailed change logs
- Stock level indicators with visual dashboards
- Automated reorder suggestions
```

### **3. Donation Drive System** (`/app/api/donation-drives/`)
```javascript
// Drive management features
- Create and schedule donation drives
- Registration system for donor participation
- Drive analytics and reporting
- Automated notifications and reminders
- Multi-location drive support
- Performance tracking and statistics
```

### **4. Donor-Blood Bank Communication** (`/app/api/donor-contact-request/`)
```javascript
// Enhanced communication system
- Direct donor contact requests from blood banks
- Secure messaging between parties
- Response tracking and management
- Critical donor availability settings
- Emergency contact protocols
- Communication history and audit trails
```

### **5. Advanced Emergency System** (`/app/emergency/`)
```javascript
// Comprehensive emergency features
- Guest access with minimal registration
- Location-based blood bank search with distance calculation
- Priority request processing with immediate notifications
- Emergency contact management with direct communication
- Real-time status tracking with updates
- Emergency call interface for urgent situations
```

---

## 🤖 AI Chatbot Integration

### **Enhanced Groq AI Implementation**
```javascript
// Advanced chatbot capabilities
- Blood-related query assistance with context awareness
- Role-specific guidance and personalized responses
- Emergency procedure information with step-by-step guidance
- Donation process guidance with detailed instructions
- Real-time conversation handling with message processing
- Enhanced knowledge base with blood compatibility information
```

**Enhanced Knowledge Base Topics:**
- Blood donation eligibility with detailed criteria
- Blood types and compatibility with visual matrix
- Emergency procedures with immediate actions
- Donation process steps with preparation guidelines
- Health and safety guidelines with best practices
- Drive participation and scheduling assistance

### **Features:**
- **Contextual Responses**: Role-aware assistance with personalized guidance
- **Multi-turn Conversations**: Advanced conversation context management
- **Emergency Guidance**: Immediate help for urgent situations with action items
- **Educational Content**: Comprehensive blood donation awareness and education

---

## 📱 Enhanced API Documentation

### **Authentication Endpoints**
```
POST /api/auth/signin           # User login with role validation
POST /api/auth/signout          # User logout with session cleanup
GET  /api/auth/session          # Current session with role information
POST /api/auth/refresh          # Session refresh and renewal
POST /api/users/register        # Multi-step user registration
POST /api/users/complete-registration # Profile completion after role selection
```

### **Blood Request Endpoints**
```
GET    /api/requests            # List requests with advanced filtering
POST   /api/requests            # Create request with automatic matching
PUT    /api/requests/:id        # Update request status with notifications
DELETE /api/requests/:id        # Cancel request with status tracking
GET    /api/requests/track      # Universal request tracking system
```

### **Hospital Request System**
```
GET    /api/hospital-requests   # Hospital-specific request management
POST   /api/hospital-requests   # Create hospital requests
PUT    /api/hospital-requests/:id # Update hospital request status
GET    /api/hospital-requests/respond # Hospital request response system
```

### **Donation Drive Endpoints**
```
GET    /api/donation-drives     # List available drives with filtering
POST   /api/donation-drives/create # Create new donation drive
POST   /api/donation-drives/register # Register for drive participation
GET    /api/donation-drives/my-drives # User's registered drives
```

### **Donor Communication Endpoints**
```
POST   /api/donor-contact-request # Create donor contact request
GET    /api/donor-contact-request # List contact requests
POST   /api/donor-contact-request/respond # Respond to contact requests
```

### **Enhanced Inventory Endpoints**
```
GET    /api/inventory           # Blood bank inventory with analytics
POST   /api/inventory           # Update inventory with logging
GET    /api/inventory/logs      # Detailed inventory change history
GET    /api/hospital-inventory  # Hospital inventory with breakdown
POST   /api/hospital-inventory  # Add/update hospital inventory
GET    /api/hospital-inventory/logs # Hospital inventory audit logs
```

---

## 🎨 Enhanced UI Components

### **Core Components**

#### **Enhanced Navigation** (`/components/navbar.jsx`)
- **Role-based Menus**: Dynamically generated navigation based on user roles
- **Multi-level Navigation**: Hierarchical menu structure for complex workflows
- **Authentication State**: Advanced login/logout with session management
- **Responsive Design**: Mobile-optimized with collapsible sections
- **Theme Integration**: Seamless dark/light mode transitions

#### **Advanced Authentication** (`/components/Login.jsx` & `/components/RoleSelection.jsx`)
- **Multi-step Registration**: Guided registration with role-specific forms
- **Enhanced Validation**: Client and server-side validation with real-time feedback
- **Role Selection**: Interactive role selection with detailed descriptions
- **Error Handling**: User-friendly error messages with actionable guidance
- **Responsive Forms**: Mobile-optimized with accessible form controls

#### **Enhanced Chatbot Interface** (`/components/Chatbot.jsx`)
- **Advanced Chat UI**: Modern chat interface with message threading
- **Message Processing**: Enhanced message handling with context awareness
- **Chat History**: Persistent conversation history with search functionality
- **Typing Indicators**: Real-time typing status and response indicators
- **File Attachments**: Support for sharing relevant documents and images

### **Specialized Components**

#### **Role Guard System** (`/components/RoleGuard.jsx` & `/components/ProtectedRoute.jsx`)
```javascript
// Advanced access control
- Granular permission checking
- Role-based component rendering
- Automatic redirection for unauthorized access
- Emergency access exceptions
- Session validation with real-time updates
```

#### **Enhanced Form Components** (`/components/forms/`)
```javascript
// Specialized form handling
- Blood type selection with compatibility info
- Date/time pickers for scheduling
- Location selection with maps integration
- File upload with validation
- Multi-step form wizards
```

---

## 🔧 Enhanced Utilities & Hooks

### **Advanced Custom Hooks**

#### **Emergency Management** (`/hooks/useEmergencyNotifications.js` & `/hooks/useEmergencyRequestCheck.js`)
```javascript
// Comprehensive emergency handling
const { notifications, emergencyCheck, handleEmergency } = useEmergencyNotifications();
// Real-time emergency request validation
// Automated alert distribution
// Priority-based notification routing
// Emergency contact management
```

#### **Enhanced Role Management** (`/hooks/useUserRole.js`)
```javascript
// Advanced role-based functionality
const { userRole, permissions, checkAccess, hasPermission } = useUserRole();
// Granular permission checking
// Dynamic role updates
// Session-aware role management
// Multi-level authorization
```

#### **Request Status Management** (`/hooks/useRequestStatus.js`)
```javascript
// Comprehensive request tracking
const { requests, updateStatus, trackProgress, getHistory } = useRequestStatus();
// Real-time status synchronization
// Request lifecycle management
// Automated status notifications
// Historical tracking and analytics
```

### **Enhanced Utility Libraries**

#### **Blood Compatibility System** (`/lib/bloodCompatibility.js`)
```javascript
// Advanced compatibility checking
- Complete blood type compatibility matrix
- Donor-recipient matching algorithms
- Emergency compatibility protocols
- Rare blood type handling
```

#### **Message Processing** (`/lib/messageProcessor.js`)
```javascript
// Enhanced chatbot integration
- Context-aware message processing
- Multi-turn conversation handling
- Intent recognition and response routing
- Personalized response generation
```

---

## 🚀 Deployment

### **Vercel Deployment** (Recommended)
1. **Connect Repository**
   ```bash
   # Push to GitHub with latest changes
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
   - Configure build settings for optimal performance
   - Deploy automatically on push with preview deployments

---

## 🤝 Contributing

### **Enhanced Development Guidelines**
1. **Code Standards**: Follow ESLint configuration with Prettier formatting
2. **Component Architecture**: Modular components with custom hooks
3. **API Design**: RESTful endpoints with comprehensive error handling
4. **Database Design**: Optimized schemas with proper indexing
5. **Authentication**: Multi-layered security with role-based access
6. **Testing**: Unit and integration tests for critical components
7. **Documentation**: Comprehensive inline documentation
8. **Performance**: Optimized queries and component rendering

---

<div align="center">

**Built with ❤️ for saving lives through technology**

**BloodBond** - *Connecting blood donors, hospitals, and blood banks for a healthier tomorrow*

### 🆕 **Latest Updates (Version 2.0)**

- ✅ **Donation Drive Management**: Complete drive creation and participation system
- ✅ **Advanced Donor-Blood Bank Communication**: Direct contact and request system
- ✅ **Enhanced Emergency System**: Improved emergency call interface and handling
- ✅ **Hospital Request Management**: Specialized hospital-to-blood bank request system
- ✅ **Blood Compatibility Matrix**: Advanced blood type compatibility checking
- ✅ **Enhanced Chatbot**: Improved AI assistance with message processing
- ✅ **Role Guard System**: Comprehensive role-based access control
- ✅ **Multi-step Registration**: Enhanced user onboarding experience
- ✅ **Advanced Analytics**: Comprehensive statistics and reporting
- ✅ **Enhanced UI/UX**: Improved interface with better navigation and theming

[![GitHub stars](https://img.shields.io/github/stars/DevSsChar/BloodBond?style=social)](https://github.com/DevSsChar/BloodBond)
[![GitHub forks](https://img.shields.io/github/forks/DevSsChar/BloodBond?style=social)](https://github.com/DevSsChar/BloodBond/fork)

</div>
