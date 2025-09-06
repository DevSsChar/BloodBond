import { NextResponse } from 'next/server';
import groq from '../../../lib/groqClient';
import { 
  classifyIntent, 
  extractEntities, 
  generateSystemPrompt, 
  getQuickResponse 
} from '../../../lib/messageProcessor';

export async function POST(request) {
  try {
    console.log('=== Chatbot API called ===');
    
    const { message, conversationHistory = [] } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('Processing message:', message);
    console.log('Message length:', message.length);

    // Check for quick responses first
    const quickResponse = getQuickResponse(message);
    console.log('Quick response result:', quickResponse ? 'Found' : 'None');
    
    if (quickResponse) {
      console.log('Returning quick response');
      return NextResponse.json({
        response: quickResponse,
        intent: 'quick_response',
        timestamp: new Date().toISOString()
      });
    }

    console.log('=== Proceeding to Groq API ===');
    
    // Classify intent and extract entities
    const intent = classifyIntent(message);
    const entities = extractEntities(message);
    
    console.log('Intent:', intent, 'Entities:', entities);
    
    // Generate system prompt based on context
    const systemPrompt = generateSystemPrompt(intent, entities, conversationHistory);
    console.log('System prompt generated, length:', systemPrompt.length);
    
    // Prepare conversation for Groq
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      // Add conversation history
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      // Add current user message
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Prepared messages for Groq, count:', messages.length);
    console.log('Calling Groq API...');
    
    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant', // Updated to current supported model
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 0.9,
    });

    console.log('Groq API call completed');
    
    const response = completion.choices[0]?.message?.content;
    
    console.log('Response from Groq:', response ? 'Received' : 'Empty');
    
    if (!response) {
      throw new Error('No response from Groq API');
    }

    console.log('=== Groq API successful ===');

    return NextResponse.json({
      response: response.trim(),
      intent: intent,
      entities: entities,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot API Error:', error);
    console.error('Error details:', error.message);
    
    // Provide fallback response
    const fallbackResponse = "I'm having trouble connecting right now. Here are some quick links that might help:\n\n" +
      "🩸 **Donate Blood**: Visit /register/donor\n" +
      "🚨 **Emergency**: Go to /emergency\n" +
      "🏥 **Blood Banks**: Check /bloodbanks\n" +
      "📞 **Need immediate help?** Please contact our support team.\n\n" +
      "I'll be back online shortly!";
    
    return NextResponse.json({
      response: fallbackResponse,
      intent: 'fallback',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable',
      timestamp: new Date().toISOString()
    }, { status: 200 }); // Return 200 to show fallback message to user
  }
}

// Handle GET requests for health check
export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'BloodBond Chatbot API',
    timestamp: new Date().toISOString()
  });
}
