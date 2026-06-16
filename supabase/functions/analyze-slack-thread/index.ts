import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SlackMessage {
  user: string;
  userName?: string;
  text: string;
  ts: string;
  reply_count?: number;
  replies?: { user: string; ts: string }[];
}

interface AnalysisResult {
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
  slackData: {
    channel: string;
    messageSnippet: string;
    replyCount: number;
    dateRange: string;
  };
}

// Parse Slack URL to extract channel and message info
function parseSlackUrl(rawUrl: string): { channelId: string; messageTs: string; threadTs?: string } | null {
  try {
    // Slack links are often pasted like: <https://...>
    const urlStr = (rawUrl || '').trim().replace(/^<|>$/g, '');
    const urlObj = new URL(urlStr);

    // 1) Classic permalink format:
    // https://{workspace}.slack.com/archives/{CHANNEL_ID}/p1234567890123456
    // https://slack.com/archives/{CHANNEL_ID}/p1234567890123456?thread_ts=1234567890.123456
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const archivesIndex = pathParts.indexOf('archives');
    if (archivesIndex !== -1 && archivesIndex + 2 < pathParts.length) {
      const channelId = pathParts[archivesIndex + 1];
      const messageId = pathParts[archivesIndex + 2];

      // Support both p1234567890123456 and 1234567890123456
      const tsMatch = messageId.match(/^p?(\d{10})(\d{6})$/);
      if (!tsMatch) return null;

      const messageTs = `${tsMatch[1]}.${tsMatch[2]}`;
      const threadTs = urlObj.searchParams.get('thread_ts') || undefined;
      return { channelId, messageTs, threadTs };
    }

    // 2) Slack app client format (common when copying from Slack UI):
    // https://app.slack.com/client/{TEAM_ID}/{CHANNEL_ID}/thread/{CHANNEL_ID}-{THREAD_TS}
    // https://app.slack.com/client/{TEAM_ID}/{CHANNEL_ID}/p1234567890123456
    if (pathParts[0] === 'client' && pathParts.length >= 3) {
      const channelId = pathParts[2];

      // thread route
      const threadIndex = pathParts.indexOf('thread');
      if (threadIndex !== -1 && threadIndex + 1 < pathParts.length) {
        const threadToken = pathParts[threadIndex + 1];
        // Usually: {CHANNEL_ID}-{THREAD_TS} where THREAD_TS is 1234567890.123456
        const m = threadToken.match(/^[A-Z0-9]+-(\d{10}\.\d{6})$/);
        if (m) {
          const threadTs = m[1];
          return { channelId, messageTs: threadTs, threadTs };
        }
      }

      // direct message permalink on client route
      const pSeg = pathParts.find((p) => /^p\d{16}$/.test(p));
      if (pSeg) {
        const tsMatch = pSeg.match(/^p(\d{10})(\d{6})$/);
        if (!tsMatch) return null;
        const messageTs = `${tsMatch[1]}.${tsMatch[2]}`;
        const threadTs = urlObj.searchParams.get('thread_ts') || undefined;
        return { channelId, messageTs, threadTs };
      }
    }

    return null;
  } catch (e) {
    console.error('Error parsing Slack URL:', e);
    return null;
  }
}

// Fetch thread messages from Slack
async function fetchSlackThread(channelId: string, threadTs: string, token: string): Promise<SlackMessage[]> {
  console.log(`Fetching Slack thread: channel=${channelId}, thread_ts=${threadTs}`);
  
  const response = await fetch(
    `https://slack.com/api/conversations.replies?channel=${channelId}&ts=${threadTs}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const data = await response.json();
  
  if (!data.ok) {
    console.error('Slack API error:', data.error);
    if (data.error === 'not_in_channel') {
      throw new Error('Bot is not in this channel. Invite the Slack app to the channel first (type /invite @YourBotName in the channel).');
    }
    if (data.error === 'channel_not_found') {
      throw new Error('Channel not found. The bot may not have access to this private channel.');
    }
    throw new Error(`Slack API error: ${data.error}`);
  }
  
  return data.messages || [];
}

// Fetch channel info
async function fetchChannelInfo(channelId: string, token: string): Promise<{ name: string }> {
  const response = await fetch(
    `https://slack.com/api/conversations.info?channel=${channelId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const data = await response.json();
  
  if (!data.ok) {
    console.error('Error fetching channel info:', data.error);
    return { name: channelId };
  }
  
  return { name: data.channel?.name || channelId };
}

// Fetch user info to get display name
async function fetchUserInfo(userId: string, token: string): Promise<string> {
  try {
    const response = await fetch(
      `https://slack.com/api/users.info?user=${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error('Error fetching user info:', data.error);
      return userId;
    }
    
    // Prefer display name, fall back to real name, then username
    return data.user?.profile?.display_name || 
           data.user?.profile?.real_name || 
           data.user?.name || 
           userId;
  } catch (e) {
    console.error('Error fetching user info:', e);
    return userId;
  }
}

// Fetch user names for all unique users in messages
async function enrichMessagesWithUserNames(messages: SlackMessage[], token: string): Promise<SlackMessage[]> {
  // Get unique user IDs
  const uniqueUserIds = [...new Set(messages.map(msg => msg.user).filter(Boolean))];
  
  // Fetch all user names in parallel
  const userNameMap = new Map<string, string>();
  await Promise.all(
    uniqueUserIds.map(async (userId) => {
      const userName = await fetchUserInfo(userId, token);
      userNameMap.set(userId, userName);
    })
  );
  
  // Enrich messages with user names
  return messages.map(msg => ({
    ...msg,
    userName: userNameMap.get(msg.user) || msg.user,
  }));
}

// Format messages for AI analysis
function formatMessagesForAnalysis(messages: SlackMessage[]): string {
  return messages
    .map((msg, idx) => {
      const author = msg.userName || msg.user;
      return `[Message ${idx + 1} from ${author}]: ${msg.text}`;
    })
    .join('\n\n');
}

// Analyze thread with Lovable AI
async function analyzeWithAI(
  threadContent: string,
  channelName: string,
  additionalNotes: string,
  apiKey: string
): Promise<Omit<AnalysisResult, 'slackData'>> {
  console.log('Analyzing thread with Lovable AI...');
  
  const systemPrompt = `You are an expert technical writer analyzing Slack conversations to create knowledge base documentation. 
Extract key information and structure it for a KnowSlope article.

Respond ONLY with valid JSON matching this exact structure:
{
  "title": "A clear, descriptive title (max 80 chars)",
  "summary": "A markdown-formatted summary (2-4 sentences). Use **bold** for key terms, bullet points for multiple items, and \`backticks\` for code/technical terms when appropriate.",
  "category": "One of: product, engineering, support, sales, marketing, operations",
  "type": "One of: bug, feature, how_to, troubleshooting, faq, policy",
  "tags": ["tag1", "tag2", "tag3"],
  "sections": {
    "userProblem": "Markdown-formatted description of the user's problem. Use **bold** for key terms, bullet points for lists, and \`backticks\` for code/technical terms.",
    "currentBehavior": "Markdown-formatted description of current behavior. Use formatting to highlight important details.",
    "expectedBehavior": "Markdown-formatted description of expected behavior. Use formatting for clarity.",
    "stepsToReproduce": "Markdown-formatted numbered list of steps. Use 1. 2. 3. format and \`backticks\` for commands/code.",
    "knownLimitations": "Markdown-formatted list of limitations or workarounds. Use bullet points and **bold** for emphasis.",
    "customerQuotes": "Notable quotes from the conversation, formatted with > for blockquotes if multiple quotes."
  }
}

Analyze the conversation carefully:
- Identify if this is a bug report, feature request, question, or general discussion
- Extract actionable information
- Use direct quotes when capturing customer feedback
- If information for a section is not available, use an empty string`;

  const userPrompt = `Analyze this Slack thread from #${channelName} and extract structured documentation:

${threadContent}

${additionalNotes ? `Additional context from the user: ${additionalNotes}` : ''}

Respond with valid JSON only.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI error:', response.status, errorText);
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content returned from AI');
  }

  // Parse JSON from response (handle markdown code blocks if present)
  let jsonContent = content.trim();
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

// Regenerate a specific section with AI
async function regenerateSection(
  sectionKey: string,
  currentContent: Record<string, string>,
  context: { title: string; summary: string; slackUrl?: string; notes?: string },
  apiKey: string
): Promise<string> {
  console.log(`Regenerating section: ${sectionKey}`);
  
  const sectionPrompts: Record<string, string> = {
    userProblem: "What is the core problem or question the user is experiencing? Be specific and actionable.",
    currentBehavior: "What is the current behavior or state that's causing issues? Describe what's happening.",
    expectedBehavior: "What should happen instead? Describe the expected or ideal behavior.",
    stepsToReproduce: "What are the step-by-step instructions to reproduce this issue or use this feature?",
    knownLimitations: "What are the known limitations, edge cases, or workarounds for this issue?",
    customerQuotes: "Extract any notable quotes or feedback from the conversation."
  };

  const systemPrompt = `You are an expert technical writer. Regenerate the "${sectionKey}" section for a knowledge base document.
Respond with ONLY the content for this section - no JSON, no markdown formatting, just plain text.
Be clear, concise, and actionable.`;

  const userPrompt = `Document context:
Title: ${context.title}
Summary: ${context.summary}

Current document sections:
${Object.entries(currentContent).map(([key, value]) => `${key}: ${value}`).join('\n\n')}

${context.notes ? `Additional notes: ${context.notes}` : ''}

Task: ${sectionPrompts[sectionKey] || 'Regenerate this section with improved content.'}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Lovable AI error:', response.status, errorText);
    throw new Error(`AI regeneration failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('No content returned from AI');
  }

  return content.trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Supabase configuration missing');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('JWT verification failed:', claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', claimsData.claims.sub);

    const body = await req.json();
    const { slackUrl, notes, regenerateSection: sectionToRegenerate, currentDocument } = body;

    // Get required env vars
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle section regeneration
    if (sectionToRegenerate && currentDocument) {
      console.log(`Regenerating section: ${sectionToRegenerate}`);
      
      const newContent = await regenerateSection(
        sectionToRegenerate,
        currentDocument.sections || {},
        {
          title: currentDocument.title || '',
          summary: currentDocument.summary || '',
          slackUrl: currentDocument.slackUrl,
          notes: notes,
        },
        LOVABLE_API_KEY
      );

      return new Response(
        JSON.stringify({ 
          success: true, 
          section: sectionToRegenerate,
          content: newContent 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Original full analysis flow
    // Handle notes-only analysis (no Slack URL)
    if (!slackUrl || slackUrl.trim() === '') {
      if (notes && notes.trim()) {
        // Generate document from notes only
        console.log('Generating document from notes only');
        const analysis = await analyzeWithAI(
          `User provided notes:\n${notes}`,
          'notes',
          '',
          LOVABLE_API_KEY
        );
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              ...analysis,
              slackData: null
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Slack URL or notes are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse Slack URL
    const parsed = parseSlackUrl(slackUrl);
    if (!parsed) {
      return new Response(
        JSON.stringify({ error: 'Invalid Slack URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { channelId, messageTs, threadTs } = parsed;
    const effectiveThreadTs = threadTs || messageTs;

    // Create Supabase client to get Slack token from settings
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // For now, we'll do analysis without fetching the actual Slack messages
    // This requires a Slack bot token which would need to be stored as a secret
    // We'll simulate the thread content based on the URL structure
    
    // Check if we have a Slack bot token
    const SLACK_BOT_TOKEN = Deno.env.get('SLACK_BOT_TOKEN')?.trim();

    let messages: SlackMessage[] = [];
    let channelName = 'unknown-channel';
    let threadContent = '';

    // If token is present but not a Bot token, fail with a clear message.
    // Slack Web API endpoints used below require a Bot User OAuth Token (xoxb-).
    if (SLACK_BOT_TOKEN && !SLACK_BOT_TOKEN.startsWith('xoxb-')) {
      console.error('Invalid Slack token type configured (expected xoxb-)');
      return new Response(
        JSON.stringify({
          error:
            'Slack is connected but the bot token is invalid. Please configure a Bot User OAuth Token (starts with xoxb-).',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (SLACK_BOT_TOKEN) {
      // Fetch actual Slack data
      try {
        messages = await fetchSlackThread(channelId, effectiveThreadTs, SLACK_BOT_TOKEN);
        // Enrich messages with user names
        messages = await enrichMessagesWithUserNames(messages, SLACK_BOT_TOKEN);
        const channelInfo = await fetchChannelInfo(channelId, SLACK_BOT_TOKEN);
        channelName = channelInfo.name;
        threadContent = formatMessagesForAnalysis(messages);
      } catch (slackError) {
        console.error('Error fetching Slack data:', slackError);
        return new Response(
          JSON.stringify({
            error:
              slackError instanceof Error
                ? slackError.message
                : 'Failed to fetch Slack thread. Check app permissions and bot access to the channel.',
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // No Slack token - use notes and generate based on URL context
      console.log('No SLACK_BOT_TOKEN - analyzing based on URL and notes');
      threadContent = notes
        ? `User provided context: ${notes}`
        : 'Please analyze this document request. No specific Slack content was provided.';
      channelName = 'slack-thread';
    }

    // Analyze with AI
    const analysis = await analyzeWithAI(
      threadContent,
      channelName,
      notes || '',
      LOVABLE_API_KEY
    );

    // Build response
    const result: AnalysisResult = {
      ...analysis,
      slackData: {
        channel: `#${channelName}`,
        messageSnippet: messages[0]?.text?.slice(0, 150) || 'Thread content from Slack',
        replyCount: messages.length > 1 ? messages.length - 1 : 0,
        dateRange: messages.length > 0 
          ? formatDateRange(messages[0].ts, messages[messages.length - 1].ts)
          : 'Recent',
      },
    };

    console.log('Analysis complete:', result.title);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing Slack thread:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function formatDateRange(startTs: string, endTs: string): string {
  try {
    const start = new Date(parseFloat(startTs) * 1000);
    const end = new Date(parseFloat(endTs) * 1000);
    
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (start.toDateString() === end.toDateString()) {
      return formatDate(start);
    }
    return `${formatDate(start)} - ${formatDate(end)}`;
  } catch {
    return 'Recent';
  }
}
