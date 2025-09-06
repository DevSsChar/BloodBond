import { bloodBondKnowledge, responseTemplates } from './knowledgeBase';

// Enhanced intent classification with more nuanced understanding
export const classifyIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Emergency intent - highest priority
  if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || 
      lowerMessage.includes('need blood now') || lowerMessage.includes('critical') ||
      lowerMessage.includes('patient dying') || lowerMessage.includes('asap') ||
      lowerMessage.includes('immediately') || lowerMessage.includes('life threatening')) {
    return 'emergency';
  }
  
  // Fear/concern intent - address anxiety
  if (lowerMessage.includes('scared') || lowerMessage.includes('afraid') || 
      lowerMessage.includes('nervous') || lowerMessage.includes('hurt') ||
      lowerMessage.includes('pain') || lowerMessage.includes('safe') ||
      lowerMessage.includes('worried') || lowerMessage.includes('fear')) {
    return 'reassurance';
  }
  
  // First time donor intent
  if (lowerMessage.includes('first time') || lowerMessage.includes('never donated') || 
      lowerMessage.includes('new to') || lowerMessage.includes('beginner') ||
      lowerMessage.includes('starting out') || lowerMessage.includes('never done')) {
    return 'first_time';
  }
  
  // Registration intent
  if (lowerMessage.includes('register') || lowerMessage.includes('sign up') || 
      lowerMessage.includes('create account') || lowerMessage.includes('join') ||
      lowerMessage.includes('get started') || lowerMessage.includes('become donor')) {
    return 'registration';
  }
  
  // Donation process intent
  if (lowerMessage.includes('donate') || lowerMessage.includes('donation') || 
      lowerMessage.includes('give blood') || lowerMessage.includes('donor') ||
      lowerMessage.includes('process') || lowerMessage.includes('procedure') ||
      lowerMessage.includes('how does it work') || lowerMessage.includes('what happens')) {
    return 'donation';
  }
  
  // Eligibility/requirements intent
  if (lowerMessage.includes('eligible') || lowerMessage.includes('qualify') || 
      lowerMessage.includes('requirements') || lowerMessage.includes('criteria') ||
      lowerMessage.includes('can i') || lowerMessage.includes('am i able') ||
      lowerMessage.includes('allowed to') || lowerMessage.includes('requirements')) {
    return 'eligibility';
  }
  
  // Blood types and compatibility
  if (lowerMessage.includes('blood type') || lowerMessage.includes('compatible') || 
      lowerMessage.includes('a+') || lowerMessage.includes('o-') || 
      lowerMessage.includes('universal') || lowerMessage.includes('rh') ||
      /[abo][+-]/.test(lowerMessage)) {
    return 'blood_types';
  }
  
  // Location/finding places
  if (lowerMessage.includes('near') || lowerMessage.includes('close') || 
      lowerMessage.includes('location') || lowerMessage.includes('where') ||
      lowerMessage.includes('find') || lowerMessage.includes('address') ||
      lowerMessage.includes('directions') || lowerMessage.includes('map')) {
    return 'location';
  }
  
  // Blood bank intent
  if (lowerMessage.includes('blood bank') || lowerMessage.includes('center') || 
      lowerMessage.includes('facility') || lowerMessage.includes('clinic')) {
    return 'bloodbank';
  }
  
  // Hospital intent
  if (lowerMessage.includes('hospital') || lowerMessage.includes('medical') || 
      lowerMessage.includes('request blood') || lowerMessage.includes('patient needs')) {
    return 'hospital';
  }
  
  // Scheduling intent
  if (lowerMessage.includes('schedule') || lowerMessage.includes('appointment') || 
      lowerMessage.includes('book') || lowerMessage.includes('when') ||
      lowerMessage.includes('availability') || lowerMessage.includes('time') ||
      lowerMessage.includes('calendar') || lowerMessage.includes('slot')) {
    return 'scheduling';
  }
  
  // Benefits/motivation intent
  if (lowerMessage.includes('why') || lowerMessage.includes('benefit') || 
      lowerMessage.includes('reward') || lowerMessage.includes('incentive') ||
      lowerMessage.includes('save lives') || lowerMessage.includes('help people') ||
      lowerMessage.includes('important') || lowerMessage.includes('matter')) {
    return 'motivation';
  }
  
  // After donation care
  if (lowerMessage.includes('after') || lowerMessage.includes('recovery') || 
      lowerMessage.includes('rest') || lowerMessage.includes('care') ||
      lowerMessage.includes('what to do') || lowerMessage.includes('next steps')) {
    return 'aftercare';
  }
  
  // Greeting intent
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || 
      lowerMessage.includes('hey') || lowerMessage.includes('help') ||
      lowerMessage.includes('start') || lowerMessage.length < 10) {
    return 'greeting';
  }
  
  return 'general';
};

// Enhanced entity extraction with more comprehensive patterns
export const extractEntities = (message) => {
  const entities = {
    bloodType: null,
    location: null,
    urgency: null,
    userRole: null,
    quantity: null,
    timeframe: null,
    emotion: null
  };
  
  const lowerMessage = message.toLowerCase();
  
  // Extract blood type with more patterns
  const bloodTypePatterns = [
    /\b([abo])[+-]\b/i,
    /\btype\s+([abo])[+-]?\b/i,
    /\b(o|a|b|ab)\s*(positive|negative|\+|\-)\b/i
  ];
  
  bloodTypePatterns.forEach(pattern => {
    const match = message.match(pattern);
    if (match) {
      let type = match[1].toUpperCase();
      if (match[2]) {
        type += match[2].includes('pos') || match[2].includes('+') ? '+' : '-';
      }
      entities.bloodType = type;
    }
  });
  
  // Extract urgency levels
  if (lowerMessage.includes('emergency') || lowerMessage.includes('critical') || 
      lowerMessage.includes('immediately') || lowerMessage.includes('asap')) {
    entities.urgency = 'critical';
  } else if (lowerMessage.includes('urgent') || lowerMessage.includes('soon') || 
             lowerMessage.includes('quickly')) {
    entities.urgency = 'urgent';
  } else if (lowerMessage.includes('routine') || lowerMessage.includes('planned') || 
             lowerMessage.includes('scheduled')) {
    entities.urgency = 'routine';
  }
  
  // Extract user role
  if (lowerMessage.includes('donor') || lowerMessage.includes('donating') || 
      lowerMessage.includes('want to give')) {
    entities.userRole = 'donor';
  } else if (lowerMessage.includes('hospital') || lowerMessage.includes('patient') || 
             lowerMessage.includes('doctor') || lowerMessage.includes('medical staff')) {
    entities.userRole = 'hospital';
  } else if (lowerMessage.includes('blood bank') || lowerMessage.includes('collection center')) {
    entities.userRole = 'bloodbank';
  }
  
  // Extract emotional state
  if (lowerMessage.includes('scared') || lowerMessage.includes('afraid') || 
      lowerMessage.includes('nervous') || lowerMessage.includes('worried')) {
    entities.emotion = 'anxious';
  } else if (lowerMessage.includes('excited') || lowerMessage.includes('ready') || 
             lowerMessage.includes('eager')) {
    entities.emotion = 'enthusiastic';
  } else if (lowerMessage.includes('confused') || lowerMessage.includes('lost') || 
             lowerMessage.includes('don\'t understand')) {
    entities.emotion = 'confused';
  }
  
  // Extract quantity with more patterns
  const quantityPatterns = [
    /(\d+)\s*(unit|bag|pint|ml|liter|litre)/i,
    /(\d+)\s*units?\s*of\s*blood/i,
    /(one|two|three|four|five|six|seven|eight|nine|ten)\s*(unit|bag|pint)/i
  ];
  
  quantityPatterns.forEach(pattern => {
    const match = message.match(pattern);
    if (match) {
      entities.quantity = match[0];
    }
  });
  
  // Extract timeframe
  const timePatterns = [
    /within\s*(\d+)\s*(hour|minute|day)/i,
    /in\s*(\d+)\s*(hour|minute|day)/i,
    /(today|tomorrow|this week|next week|immediately)/i
  ];
  
  timePatterns.forEach(pattern => {
    const match = message.match(pattern);
    if (match) {
      entities.timeframe = match[0];
    }
  });
  
  return entities;
};

// Enhanced system prompt generation with personality
export const generateSystemPrompt = (intent, entities, conversationHistory) => {
  const baseContext = `You are a friendly, knowledgeable, and empathetic assistant for BloodBond, a life-saving blood donation platform. Your personality is:

🌟 WARM & ENCOURAGING: You believe in the power of human kindness and celebrate every person who wants to help
🧠 KNOWLEDGEABLE: You have comprehensive knowledge about blood donation, medical requirements, and the platform
💪 MOTIVATIONAL: You inspire people to take action and make a difference
🎯 SOLUTION-FOCUSED: You provide clear, actionable guidance
❤️ EMPATHETIC: You understand people's concerns and address them with care

PLATFORM OVERVIEW:
BloodBond connects donors, blood banks, and hospitals to save lives through:
- Smart donor matching and emergency alerts
- Real-time blood inventory management  
- Easy registration and scheduling for all user types
- Location-based blood bank finder
- Comprehensive donation tracking and analytics

KEY FEATURES:
🩸 Donor Portal: Registration, scheduling, history tracking, emergency notifications
🏥 Blood Bank Portal: Inventory management, donor coordination, drive organization
🏨 Hospital Portal: Emergency requests, blood ordering, patient management
📍 Location Services: Find nearby facilities and donation opportunities
📱 Mobile-Friendly: Full platform access on any device

NAVIGATION:
- Register: /register (choose role: donor/blood bank/hospital)
- Emergency: /emergency (urgent blood requests)
- Dashboard: /dashboard/[role] (personalized control panel)
- Find Donors: /donors
- Blood Banks: /bloodbanks
- Inventory: /inventory

BLOOD DONATION FACTS:
- Process takes 45-60 minutes (8-12 minutes actual donation)
- One donation can save up to 3 lives
- Requirements: Age 18-65, weight 50kg+, good health
- Frequency: Every 3 months for whole blood
- Free health screening with every donation

COMMUNICATION STYLE:
- Use emojis appropriately to add warmth
- Ask follow-up questions to keep conversation flowing
- Provide specific next steps, not just information
- Acknowledge emotions and concerns
- Celebrate willingness to help others
- Use encouraging language like "amazing," "wonderful," "life-saving"
- Break information into digestible chunks with bullet points`;

  let specificContext = '';
  
  switch (intent) {
    case 'emergency':
      specificContext = `🚨 EMERGENCY SITUATION: This person needs urgent help. Be direct, fast, and extremely helpful. Guide them step-by-step to /emergency page. Emphasize speed while remaining calm and reassuring. Ask clarifying questions about blood type, quantity, and timeline.`;
      break;
      
    case 'reassurance':
      specificContext = `💙 REASSURANCE NEEDED: This person has concerns or fears about blood donation. Be extra empathetic, acknowledge their feelings, share that these concerns are normal, and provide gentle encouragement. Focus on safety, the simplicity of the process, and the amazing impact they'll have.`;
      break;
      
    case 'first_time':
      specificContext = `🌟 FIRST-TIME DONOR: This is someone new to blood donation! Be extra welcoming and encouraging. Walk them through the process step-by-step, address common concerns, and make them feel like a hero for considering this. Offer to guide them through registration.`;
      break;
      
    case 'registration':
      specificContext = `📝 REGISTRATION HELP: Guide them through choosing their role and the registration process. Ask which type of user they are (donor/blood bank/hospital) and provide specific guidance for their path. Be encouraging about joining the BloodBond community.`;
      break;
      
    case 'donation':
      specificContext = `🩸 DONATION PROCESS: Provide comprehensive information about the donation process, what to expect, and how to prepare. Be encouraging about the life-saving impact and address any process-related questions clearly.`;
      break;
      
    case 'eligibility':
      specificContext = `✅ ELIGIBILITY CHECK: Help them understand if they can donate blood. Be encouraging while being medically accurate. If they might not be eligible, suggest alternatives like encouraging others or supporting in different ways.`;
      break;
      
    case 'blood_types':
      specificContext = `🧬 BLOOD TYPE EDUCATION: Explain blood types, compatibility, and the science behind blood donation in an easy-to-understand way. Emphasize that all blood types are needed and valuable.`;
      break;
      
    case 'motivation':
      specificContext = `💪 MOTIVATION & BENEFITS: Focus on the incredible impact of blood donation - lives saved, community benefit, personal satisfaction. Share inspiring facts and help them see the hero in themselves.`;
      break;
      
    case 'scheduling':
      specificContext = `📅 SCHEDULING ASSISTANCE: Help them understand how to schedule donations, find convenient times, and manage their donation calendar. Be flexible and accommodating to their needs.`;
      break;
      
    case 'location':
      specificContext = `📍 LOCATION HELP: Guide them to find nearby blood banks, donation centers, or drives. Provide practical information about accessing these locations and what to expect.`;
      break;
      
    case 'aftercare':
      specificContext = `🌱 POST-DONATION CARE: Provide comprehensive aftercare information to ensure they feel great after donating and want to return. Cover both immediate care and ongoing health.`;
      break;
      
    default:
      specificContext = `🤝 GENERAL ASSISTANCE: Assess what this person needs and provide helpful, relevant information. Ask clarifying questions to better understand how you can help them with BloodBond.`;
  }
  
  // Add entity-specific context
  if (entities.bloodType) {
    specificContext += ` User mentioned blood type: ${entities.bloodType}.`;
  }
  
  if (entities.urgency === 'critical') {
    specificContext += ` This is CRITICAL urgency - prioritize speed and direct action.`;
  }
  
  if (entities.emotion) {
    specificContext += ` User seems ${entities.emotion} - adjust tone accordingly.`;
  }
  
  if (entities.userRole) {
    specificContext += ` User appears to be a ${entities.userRole}.`;
  }
  
  return baseContext + '\n\nSPECIFIC CONTEXT:\n' + specificContext + '\n\nAlways end with a relevant follow-up question or next step to keep the conversation productive and engaging.';
};

// Enhanced quick responses with more personality
export const getQuickResponse = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Greeting responses with variety
  const greetings = ['hello', 'hi', 'hey', 'start', 'help me'];
  if (greetings.some(greeting => lowerMessage.includes(greeting)) && lowerMessage.length < 20) {
    const responses = responseTemplates.greeting;
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Quick donation facts
  if (lowerMessage.includes('quick facts') || (lowerMessage.includes('facts') && lowerMessage.includes('donation'))) {
    return "🩸 **Quick Blood Donation Facts:**\n\n⏱️ **Total time**: 45-60 minutes\n💉 **Actual donation**: 8-12 minutes\n❤️ **Lives saved**: Up to 3 per donation\n🎯 **Frequency**: Every 3 months\n🩺 **Health benefit**: Free screening every time\n🏆 **Age range**: 18-65 years\n⚖️ **Weight requirement**: 50kg minimum\n\nReady to become a hero? Ask me anything else!";
  }
  
  // Blood type compatibility with enhanced info
  if (lowerMessage.includes('blood type') && (lowerMessage.includes('compatible') || lowerMessage.includes('receive'))) {
    return "🧬 **Blood Type Compatibility Guide:**\n\n🅾️ **O- (Universal Donor)**: Can give to everyone! Most needed for emergencies\n🅰️🅱️ **AB+ (Universal Receiver)**: Can receive from all types\n\n**Universal Rules:**\n• **Type A**: Gives to A & AB | Receives from A & O\n• **Type B**: Gives to B & AB | Receives from B & O\n• **Type AB**: Gives to AB only | Receives from everyone\n• **Type O**: Gives to everyone | Receives from O only\n\n**RH Factor:**\n• **Positive (+)**: Can receive + and -\n• **Negative (-)**: Can only receive -\n\n💡 **Every type is precious and needed!** What's your blood type?";
  }
  
  // Enhanced donation timing
  if (lowerMessage.includes('how long') && lowerMessage.includes('donation')) {
    return "⏰ **Blood Donation Timeline:**\n\n**Total Experience: 45-60 minutes**\n\n1️⃣ **Check-in & Registration** (10 min)\n   📋 ID verification and basic paperwork\n\n2️⃣ **Health Screening** (15 min)\n   🩺 Vitals, hemoglobin test, health questionnaire\n\n3️⃣ **The Donation** (8-12 min)\n   💉 The actual blood collection - you're saving lives!\n\n4️⃣ **Recovery & Snacks** (10-15 min)\n   🍪 Cookies, juice, and making sure you feel great\n\n💪 **Most people say it's easier than expected!** Want tips for your first time?";
  }
  
  // Pain/discomfort concerns
  if (lowerMessage.includes('hurt') || lowerMessage.includes('pain') || lowerMessage.includes('painful')) {
    return "💙 **Let me ease your mind about discomfort:**\n\n💉 **Needle insertion**: Quick pinch for 2-3 seconds (like a flu shot)\n😌 **During donation**: Most feel nothing or slight pressure\n📊 **Pain scale**: Most donors rate it 2-3 out of 10\n⏱️ **Duration**: Only 8-12 minutes of actual donation\n\n**Comfort tips:**\n• 💧 Stay hydrated beforehand\n• 🍎 Eat a good meal 2-3 hours before\n• 😮‍💨 Deep breathing during insertion\n• 📱 Distract yourself with phone/music\n• 👨‍⚕️ Tell staff if you're nervous - they're experts at helping!\n\n**Truth**: The hardest part is often just showing up. Once you start, it's surprisingly easy! 💪";
  }
  
  return null;
};

export default {
  classifyIntent,
  extractEntities,
  generateSystemPrompt,
  getQuickResponse
};
