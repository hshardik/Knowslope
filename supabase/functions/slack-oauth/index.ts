import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  const SLACK_CLIENT_ID = Deno.env.get('SLACK_CLIENT_ID');
  const SLACK_CLIENT_SECRET = Deno.env.get('SLACK_CLIENT_SECRET');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // Redirect URL for after OAuth completes - use the Lovable project URL
  const settingsUrl = 'https://0e7af04d-2b73-4e33-ba66-cd248d1609d7.lovableproject.com/settings';

  if (error) {
    console.error('Slack OAuth error:', error);
    return Response.redirect(`${settingsUrl}?slack_error=${encodeURIComponent(error)}`, 302);
  }

  if (!code) {
    console.error('No code provided in OAuth callback');
    return Response.redirect(`${settingsUrl}?slack_error=no_code`, 302);
  }

  if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
    console.error('Missing Slack credentials');
    return Response.redirect(`${settingsUrl}?slack_error=config_error`, 302);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log('Slack OAuth response:', JSON.stringify(tokenData, null, 2));

    if (!tokenData.ok) {
      console.error('Slack token exchange failed:', tokenData.error);
      return Response.redirect(`${settingsUrl}?slack_error=${encodeURIComponent(tokenData.error)}`, 302);
    }

    // Extract workspace info
    const workspaceName = tokenData.team?.name || 'Connected Workspace';
    const accessToken = tokenData.access_token;

    // Store the connection in database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Update knowledge_hub_settings with Slack connection
    const { error: updateError } = await supabase
      .from('knowledge_hub_settings')
      .update({
        slack_connected: true,
        slack_workspace_name: workspaceName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', (await supabase.from('knowledge_hub_settings').select('id').limit(1).single()).data?.id);

    if (updateError) {
      console.error('Failed to update settings:', updateError);
      // Still redirect as success since OAuth worked
    }

    console.log(`Successfully connected Slack workspace: ${workspaceName}`);
    return Response.redirect(`${settingsUrl}?slack_connected=true`, 302);

  } catch (err) {
    console.error('Slack OAuth error:', err);
    return Response.redirect(`${settingsUrl}?slack_error=server_error`, 302);
  }
});
