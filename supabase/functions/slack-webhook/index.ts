import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-slack-signature, x-slack-request-timestamp',
};

async function verifySlackSignature(req: Request, body: string): Promise<boolean> {
  const signingSecret = Deno.env.get('SLACK_SIGNING_SECRET');
  if (!signingSecret) {
    console.error('SLACK_SIGNING_SECRET not configured');
    return false;
  }

  const timestamp = req.headers.get('x-slack-request-timestamp');
  const slackSignature = req.headers.get('x-slack-signature');

  if (!timestamp || !slackSignature) {
    console.error('Missing Slack signature headers');
    return false;
  }

  // Check timestamp to prevent replay attacks (5 min window)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    console.error('Request timestamp too old');
    return false;
  }

  const sigBasestring = `v0:${timestamp}:${body}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(signingSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(sigBasestring));
  const mySignature = 'v0=' + Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return mySignature === slackSignature;
}

// Parse Slack URL to extract channel and message info
function parseSlackUrl(rawUrl: string): { channelId: string; messageTs: string; threadTs?: string } | null {
  try {
    const urlStr = (rawUrl || '').trim().replace(/^<|>$/g, '');
    const urlObj = new URL(urlStr);

    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    // Classic permalink format
    const archivesIndex = pathParts.indexOf('archives');
    if (archivesIndex !== -1 && archivesIndex + 2 < pathParts.length) {
      const channelId = pathParts[archivesIndex + 1];
      const messageId = pathParts[archivesIndex + 2];

      const tsMatch = messageId.match(/^p?(\d{10})(\d{6})$/);
      if (!tsMatch) return null;

      const messageTs = `${tsMatch[1]}.${tsMatch[2]}`;
      const threadTs = urlObj.searchParams.get('thread_ts') || undefined;
      return { channelId, messageTs, threadTs };
    }

    // Slack app client format
    if (pathParts[0] === 'client' && pathParts.length >= 3) {
      const channelId = pathParts[2];

      const threadIndex = pathParts.indexOf('thread');
      if (threadIndex !== -1 && threadIndex + 1 < pathParts.length) {
        const threadToken = pathParts[threadIndex + 1];
        const m = threadToken.match(/^[A-Z0-9]+-(\d{10}\.\d{6})$/);
        if (m) {
          const threadTs = m[1];
          return { channelId, messageTs: threadTs, threadTs };
        }
      }

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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle GET requests (for testing connectivity)
  if (req.method === 'GET') {
    return new Response(
      JSON.stringify({ status: 'ok', message: 'Slack webhook is running' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  const body = await req.text();
  
  // Verify Slack signature
  const isValid = await verifySlackSignature(req, body);
  if (!isValid) {
    console.error('Invalid Slack signature');
    return new Response(JSON.stringify({ error: 'Invalid signature' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let payload: any;

    // Slack sends slash commands as form-urlencoded, but interactive payloads can be JSON or form-encoded
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(body);
      
      // Check if this is an interactive payload (wrapped in a "payload" field)
      const payloadStr = params.get('payload');
      if (payloadStr) {
        payload = JSON.parse(payloadStr);
      } else {
        // This is a slash command - convert form data to object
        payload = {
          type: 'slash_command',
          command: params.get('command'),
          text: params.get('text'),
          response_url: params.get('response_url'),
          trigger_id: params.get('trigger_id'),
          user_id: params.get('user_id'),
          user_name: params.get('user_name'),
          team_id: params.get('team_id'),
          team_domain: params.get('team_domain'),
          channel_id: params.get('channel_id'),
          channel_name: params.get('channel_name'),
          token: params.get('token'),
        };
      }
    } else {
      // JSON content type
      payload = JSON.parse(body);
    }

    console.log('Received Slack webhook:', JSON.stringify(payload, null, 2));

    // Handle URL verification challenge
    if (payload.type === 'url_verification') {
      console.log('Responding to URL verification challenge');
      return new Response(JSON.stringify({ challenge: payload.challenge }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Handle shortcut interactions (message actions) - "Send to KnowSlope"
    if (payload.type === 'shortcut' || payload.type === 'message_action') {
      return await handleSendToKnowSlope(payload, supabase);
    }

    // Handle slash commands - unified "/knowslope" command
    if (payload.type === 'slash_command' || payload.command) {
      return await handleSlashCommand(payload, supabase);
    }

    // Handle interactive components (buttons, modals)
    if (payload.type === 'view_submission' || payload.type === 'block_actions') {
      return await handleInteraction(payload, supabase);
    }

    // Handle events
    if (payload.type === 'event_callback') {
      return await handleEvent(payload, supabase);
    }

    console.log('Unhandled webhook type:', payload.type);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Webhook processing error:', err);
    // Return 200 to Slack to prevent retries, but log the error
    return new Response(JSON.stringify({ ok: true, error_logged: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Handle "Send to KnowSlope" shortcut - creates a neutral incoming item
async function handleSendToKnowSlope(payload: any, supabase: any) {
  console.log('Processing Send to KnowSlope shortcut:', payload.callback_id);
  
  if (payload.callback_id === 'send_to_knowledge_hub' || payload.callback_id === 'send_to_knowslope') {
    const message = payload.message;
    const channel = payload.channel;
    const user = payload.user;
    
    // Build Slack URL from message data
    const slackUrl = `https://slack.com/archives/${channel?.id}/p${(message?.ts || '').replace('.', '')}`;
    const messageText = message?.text || '';
    const messagePreview = messageText.substring(0, 200) + (messageText.length > 200 ? '...' : '');
    
    console.log('Creating incoming item from shortcut:', slackUrl);
    
    // Create neutral incoming item (no AI processing yet)
    const { data: item, error: itemError } = await supabase
      .from('slack_incoming_items')
      .insert({
        slack_url: slackUrl,
        slack_channel_id: channel?.id,
        slack_channel_name: channel?.name,
        slack_message_ts: message?.ts,
        slack_thread_id: message?.thread_ts || message?.ts,
        message_preview: messagePreview,
        sent_by_slack_user_id: user?.id,
        sent_by_slack_user_name: user?.name || user?.username,
        status: 'pending',
      })
      .select()
      .single();

    if (itemError) {
      console.error('Failed to create incoming item:', itemError);
      return new Response(JSON.stringify({ 
        response_type: 'ephemeral',
        text: '❌ Failed to send to KnowSlope. Please try again.'
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Created incoming item from Slack shortcut:', item.id);

    return new Response(JSON.stringify({ 
      response_type: 'ephemeral',
      text: `✅ Sent to KnowSlope!\n\nThis thread has been added to the incoming queue. Go to KnowSlope to choose how to process it:\n• Create Doc\n• Log Bug\n• Create How-To\n• Update existing doc`
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// Handle unified /knowledgehub slash command
async function handleSlashCommand(payload: any, supabase: any) {
  console.log('Processing slash command:', payload.command);
  
  // Handle /knowledgehub command (or legacy commands that redirect to this flow)
  if (payload.command === '/knowledgehub' || payload.command === '/knowslope' || 
      payload.command === '/createdoc' || payload.command === '/logbug' || 
      payload.command === '/createhow-to' || payload.command === '/logfeature' || 
      payload.command === '/knowledge-hub' || payload.command === '/swivu') {
    
    const slackUrl = payload.text?.trim();
    
    // If no URL provided, show help
    if (!slackUrl) {
      return new Response(JSON.stringify({
        response_type: 'ephemeral',
        text: `📚 *KnowSlope*\n\nUsage: \`/knowledgehub <slack-thread-url>\`\n\nPaste a Slack thread URL to send it to KnowSlope. You can then choose how to process it in the KnowSlope UI:\n• Create Doc\n• Log Bug\n• Create How-To\n• Update existing doc\n\n_Or use the message shortcut "Send to KnowSlope" on any message._`
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Validate it's a Slack URL
    const parsed = parseSlackUrl(slackUrl);
    if (!parsed) {
      return new Response(JSON.stringify({
        response_type: 'ephemeral',
        text: '❌ Invalid Slack URL format. Please provide a valid Slack thread or message URL.'
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Creating incoming item from /knowledgehub:', slackUrl);
    
    // Create neutral incoming item (no AI processing yet)
    const { data: item, error: itemError } = await supabase
      .from('slack_incoming_items')
      .insert({
        slack_url: slackUrl,
        slack_channel_id: parsed.channelId,
        slack_message_ts: parsed.messageTs,
        slack_thread_id: parsed.threadTs || parsed.messageTs,
        sent_by_slack_user_id: payload.user_id,
        sent_by_slack_user_name: payload.user_name,
        status: 'pending',
      })
      .select()
      .single();

    if (itemError) {
      console.error('Failed to create incoming item:', itemError);
      return new Response(JSON.stringify({ 
        response_type: 'ephemeral',
        text: '❌ Failed to send to KnowSlope. Please try again.'
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Created incoming item from slash command:', item.id);

    return new Response(JSON.stringify({
      response_type: 'ephemeral',
      text: `✅ Sent to KnowSlope!\n\nThis thread has been added to the incoming queue. Go to KnowSlope to choose how to process it:\n• Create Doc\n• Log Bug\n• Create How-To\n• Update existing doc`
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleInteraction(payload: any, supabase: any) {
  console.log('Processing interaction:', payload.type);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleEvent(payload: any, supabase: any) {
  console.log('Processing event:', payload.event?.type);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
