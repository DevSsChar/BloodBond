// BloodBond Knowledge Base - Enhanced for Interactive Conversations
export const bloodBondKnowledge = {
  website: {
    name: "BloodBond",
    description: "A comprehensive blood donation management system connecting donors, blood banks, and hospitals",
    tagline: "Connecting Lives in Critical Moments",
    features: [
      "Smart blood donor matching",
      "Real-time emergency blood requests",
      "Comprehensive blood inventory tracking",
      "Donation drive organization and scheduling",
      "Multi-role user system (Donors, Blood Banks, Hospitals)",
      "Location-based blood bank finder",
      "Donation history and analytics"
    ]
  },

  userRoles: {
    donor: {
      description: "Life-saving heroes who donate blood to help others",
      benefits: [
        "Save up to 3 lives with each donation",
        "Free health checkup with every donation",
        "Priority access during personal emergencies",
        "Donation certificates and recognition",
        "Track your impact and lives saved"
      ],
      features: [
        "Quick and easy registration process",
        "Find nearby donation drives and centers",
        "Schedule appointments at your convenience",
        "Track your complete donation history",
        "Receive emergency blood request notifications",
        "Update availability status anytime",
        "Get reminders for next eligible donation"
      ],
      registrationPath: "/register/donor",
      dashboardPath: "/dashboard/donor"
    },
    bloodbank: {
      description: "Medical institutions that collect, test, and store blood safely",
      features: [
        "Comprehensive blood inventory management",
        "Real-time blood collection tracking",
        "Automated expiry date monitoring",
        "Emergency request handling system",
        "Donation drive organization tools",
        "Donor database management",
        "Quality control and testing records"
      ],
      registrationPath: "/register/bloodbank",
      dashboardPath: "/dashboard/bloodbank"
    },
    hospital: {
      description: "Healthcare facilities that request blood for patient care",
      features: [
        "Emergency blood request system",
        "Multi-blood type request handling",
        "Real-time request status tracking",
        "Patient requirement management",
        "Access to nearby blood bank network",
        "Priority emergency protocols",
        "Request history and analytics"
      ],
      registrationPath: "/register/hospital",
      dashboardPath: "/dashboard/hospital"
    }
  },

  processes: {
    bloodDonation: {
      title: "Complete Blood Donation Process",
      timeRequired: "45-60 minutes total",
      steps: [
        {
          step: 1,
          title: "Registration & Health History",
          duration: "10-15 minutes",
          description: "Complete your donor profile with basic health information"
        },
        {
          step: 2,
          title: "Health Screening",
          duration: "15-20 minutes", 
          description: "Mini physical exam including vitals, hemoglobin test, and health questionnaire"
        },
        {
          step: 3,
          title: "Blood Donation",
          duration: "8-12 minutes",
          description: "Actual blood collection (350-450ml) in a sterile, safe environment"
        },
        {
          step: 4,
          title: "Recovery & Refreshments",
          duration: "10-15 minutes",
          description: "Rest period with snacks and fluids to ensure you feel well"
        },
        {
          step: 5,
          title: "Certificate & Next Steps",
          duration: "5 minutes",
          description: "Receive donation certificate and schedule next donation"
        }
      ],
      requirements: {
        age: "18-65 years",
        weight: "Minimum 50kg (110 lbs)",
        hemoglobin: "Minimum 12.5g/dl for men, 12.0g/dl for women",
        health: "Good general health, no cold/flu symptoms",
        interval: "Minimum 3 months between whole blood donations",
        lifestyle: "No recent tattoos/piercings (3 months), no recent travel to certain areas"
      },
      beforeDonation: [
        "Get plenty of sleep (7-8 hours)",
        "Eat a healthy meal 2-3 hours before",
        "Drink extra fluids (water is best)",
        "Avoid alcohol 24 hours before",
        "Bring valid photo ID",
        "Wear comfortable clothing with loose sleeves"
      ],
      afterDonation: [
        "Rest for 10-15 minutes before leaving",
        "Drink extra fluids for the next 24 hours",
        "Avoid heavy lifting for 24 hours",
        "Eat iron-rich foods",
        "Contact us if you feel unwell",
        "Feel proud - you've saved lives!"
      ]
    },
    emergencyRequest: {
      title: "Emergency Blood Request Process",
      urgencyLevels: {
        critical: "Life-threatening - Response needed within 1 hour",
        urgent: "Serious condition - Response needed within 4 hours", 
        routine: "Planned surgery - Response needed within 24 hours"
      },
      steps: [
        {
          step: 1,
          title: "Access Emergency Portal",
          description: "Go to /emergency page or click Emergency button"
        },
        {
          step: 2,
          title: "Fill Emergency Form",
          description: "Patient details, blood type, quantity, urgency level, hospital info"
        },
        {
          step: 3,
          title: "System Notification",
          description: "Automatic alerts sent to matching donors and nearby blood banks"
        },
        {
          step: 4,
          title: "Real-time Responses",
          description: "Monitor incoming responses and coordinate collection"
        },
        {
          step: 5,
          title: "Coordination & Fulfillment",
          description: "Direct communication with responding donors/blood banks"
        }
      ]
    }
  },

  bloodTypes: {
    compatibility: {
      "O-": {
        name: "Universal Donor",
        canGiveTo: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
        canReceiveFrom: ["O-"],
        percentage: "6.6% of population",
        emergency: "Most needed for emergencies"
      },
      "O+": {
        name: "Most Common",
        canGiveTo: ["O+", "A+", "B+", "AB+"],
        canReceiveFrom: ["O+", "O-"],
        percentage: "37.4% of population",
        note: "High demand due to commonality"
      },
      "AB+": {
        name: "Universal Receiver",
        canGiveTo: ["AB+"],
        canReceiveFrom: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
        percentage: "3.4% of population",
        plasma: "Universal plasma donor"
      }
    }
  },

  interactiveResponses: {
    greetings: [
      "Hello! I'm your BloodBond assistant 🩸 Ready to help save lives together?",
      "Welcome to BloodBond! 👋 How can I assist you in your life-saving journey today?",
      "Hi there! I'm here to help with all things blood donation. What brings you here today?"
    ],
    
    encouragement: [
      "Every drop counts! Your donation can save up to 3 lives 💪",
      "You're a hero in the making! Let's get you set up to save lives 🦸‍♂️",
      "Amazing! The world needs more people like you who care about others ❤️"
    ],

    conversationStarters: {
      newUser: "I see you're new to BloodBond! Are you interested in donating blood, or do you represent a medical facility?",
      returningDonor: "Welcome back! How has your donation journey been going?",
      emergency: "I understand this is urgent. Let me help you get the blood you need as quickly as possible.",
      general: "What would you like to know about blood donation or our platform?"
    }
  },

  commonQuestions: {
    "how to donate blood": {
      answer: "Great question! Here's how easy it is:\n\n1️⃣ Register as a donor on BloodBond\n2️⃣ Complete your health profile\n3️⃣ Find a nearby donation center or drive\n4️⃣ Schedule your appointment\n5️⃣ Show up and save lives!\n\nThe whole process takes about an hour, but the actual donation is just 8-12 minutes. Would you like help with registration?",
      followUp: "Would you like me to guide you through the registration process?"
    },
    
    "who can donate blood": {
      answer: "Most healthy adults can donate! Here are the basic requirements:\n\n✅ Age: 18-65 years\n✅ Weight: At least 50kg (110 lbs)\n✅ Health: No cold, flu, or infections\n✅ Hemoglobin: Good iron levels\n✅ Lifestyle: No recent tattoos or high-risk activities\n\nDon't worry - we'll check everything during your health screening. The most important thing is your willingness to help!",
      followUp: "Do you meet these basic requirements? I can help you get started!"
    },

    "does donating blood hurt": {
      answer: "I understand the concern! Here's the honest truth:\n\n💉 **Initial needle insertion**: Quick pinch for 2-3 seconds\n😌 **During donation**: Most people feel nothing or slight pressure\n⏱️ **Duration**: Only 8-12 minutes of actual donation\n🍪 **After**: Snacks and relaxation time!\n\nMany donors say it's much easier than they expected. Plus, the feeling of saving lives makes any minor discomfort totally worth it!",
      followUp: "Would you like tips to make your first donation even more comfortable?"
    }
  },

  contextualHelp: {
    donation: {
      keywords: ["donate", "donation", "give blood", "donor"],
      response: "I can help you become a blood donor! Whether you're curious about the process, want to find donation centers, or need to schedule an appointment, I'm here to guide you every step of the way."
    },
    
    emergency: {
      keywords: ["emergency", "urgent", "need blood", "critical", "hospital"],
      response: "This sounds urgent! I'll help you submit an emergency blood request immediately. Our system will notify all matching donors and blood banks in your area right away."
    },
    
    medical: {
      keywords: ["blood type", "compatibility", "medical", "health"],
      response: "I can explain blood types, compatibility, and medical requirements. What specific medical information do you need to know?"
    }
  }
};

// Enhanced response templates with personality
export const responseTemplates = {
  greeting: [
    "👋 Hello! I'm your BloodBond assistant, and I'm excited to help you save lives! Whether you want to donate blood, need emergency assistance, or just want to learn more about our life-saving community, I'm here for you. What's on your mind today?",
    
    "Welcome to BloodBond! 🩸 I'm here to make blood donation simple, safe, and rewarding. From finding donation centers to understanding blood compatibility, I've got you covered. How can I help you make a difference today?",
    
    "Hi there! 👨‍⚕️ As your BloodBond assistant, I'm passionate about connecting generous donors with those in need. Whether this is your first time or you're a seasoned donor, let's make your experience amazing. What would you like to know?"
  ],

  roleSelection: "I'd love to help you get started! BloodBond serves three amazing groups:\n\n🩸 **Blood Donors** - Heroes who give the gift of life\n🏥 **Blood Banks** - Professional centers that collect and store blood safely\n🏨 **Hospitals** - Medical facilities caring for patients in need\n\nWhich describes you best? I'll personalize everything for your specific needs!",

  emergencyHelp: "🚨 **Emergency Blood Request - Let's Act Fast!**\n\nI understand every second counts. Here's what we'll do:\n\n1️⃣ **Go to /emergency** immediately\n2️⃣ **Fill the emergency form** with patient details\n3️⃣ **Specify blood type and quantity** needed\n4️⃣ **Our system instantly alerts** matching donors and blood banks\n5️⃣ **Real-time coordination** with responders\n\n⚡ Response time: Usually within 15-30 minutes\n\nDo you need me to walk you through this step-by-step right now?",

  donationInfo: "🌟 **Ready to become a life-saving hero?** Here's why donating with BloodBond is amazing:\n\n✨ **Save 3 lives** with just one donation\n🏥 **Free health checkup** every time you donate\n📱 **Easy scheduling** that fits your life\n🎯 **Track your impact** and see lives you've helped\n🏆 **Join our donor community** of everyday heroes\n\n💪 The process is simple, safe, and incredibly rewarding!\n\nWant me to help you take the first step toward saving lives?",

  needMoreInfo: "I'm here to help with whatever you need! 😊 To give you the most helpful information, could you tell me more about:\n\n🩸 **Blood donation** - Process, requirements, scheduling\n🚨 **Emergency requests** - Urgent blood needs\n📝 **Registration** - Getting started as donor/facility\n🏥 **Blood banks** - Finding locations and services\n🧬 **Blood types** - Compatibility and science\n🗺️ **Navigation** - Using our platform\n\nWhat specific area interests you most? I love talking about all of these! 🤗"
};

export default bloodBondKnowledge;
