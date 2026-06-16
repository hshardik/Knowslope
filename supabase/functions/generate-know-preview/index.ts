import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KnowPreview {
  title: string;
  summary: string;
  category: string;
  type: string;
  tags: string[];
  sections: {
    userProblem: string;
    currentBehavior: string;
    expectedBehavior: string;
    stepsToReproduce: string;
    knownLimitations: string;
    customerQuotes: string;
  };
}

async function generateKnowPreview(content: string, apiKey: string): Promise<KnowPreview> {
  console.log('Generating Know preview with Lovable AI...');
  
  const systemPrompt = `You are an expert technical writer who creates structured knowledge base documentation.
Analyze the provided content and transform it into a well-structured "Know" document.

A "Know" is a clean, structured, searchable knowledge asset. Your task is to extract key information and organize it.

Respond ONLY with valid JSON matching this exact structure:
{
  "title": "A clear, descriptive title (max 80 chars)",
  "summary": "A markdown-formatted summary (2-4 sentences). Use **bold** for key terms, bullet points for multiple items, and \`backticks\` for code/technical terms when appropriate.",
  "category": "One of: product, engineering, support, sales, marketing, operations",
  "type": "One of: bug, feature, how_to, troubleshooting, faq, policy",
  "tags": ["tag1", "tag2", "tag3"],
  "sections": {
    "userProblem": "Markdown-formatted description of the user's problem or question. Use **bold** for key terms.",
    "currentBehavior": "Markdown-formatted description of current behavior or situation.",
    "expectedBehavior": "Markdown-formatted description of expected or ideal outcome.",
    "stepsToReproduce": "Markdown-formatted numbered list of steps if applicable. Use 1. 2. 3. format.",
    "knownLimitations": "Markdown-formatted list of limitations or considerations if any.",
    "customerQuotes": "Notable quotes from the content, formatted with > for blockquotes if applicable."
  }
}

Guidelines:
- Identify the main topic and purpose
- Extract actionable information
- Use direct quotes when capturing notable statements
- If information for a section is not available, use an empty string
- Be concise but thorough`;

  const userPrompt = `Transform this content into a structured Know document:

${content}

Respond with valid JSON only.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('RATE_LIMIT');
    }
    if (response.status === 402) {
      throw new Error('PAYMENT_REQUIRED');
    }
    const errorText = await response.text();
    console.error('Lovable AI error:', response.status, errorText);
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const data = await response.json();
  const responseContent = data.choices?.[0]?.message?.content;
  
  if (!responseContent) {
    throw new Error('No content returned from AI');
  }

  // Parse JSON from response (handle markdown code blocks if present)
  let jsonContent = responseContent.trim();
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    return JSON.parse(jsonContent);
  } catch (e) {
    console.error('Failed to parse AI response:', jsonContent);
    throw new Error('Failed to parse AI response as JSON');
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: 'Please provide at least 20 characters of content to analyze' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit content length for demo
    const truncatedContent = content.slice(0, 5000);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const preview = await generateKnowPreview(truncatedContent, LOVABLE_API_KEY);

    return new Response(
      JSON.stringify({ success: true, data: preview }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating preview:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage === 'RATE_LIMIT') {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again in a moment.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (errorMessage === 'PAYMENT_REQUIRED') {
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable. Please try again later.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to generate preview. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
