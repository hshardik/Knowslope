import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("Only admins can update Slack credentials");
    }

    // Parse the request body
    const { bot_token, signing_secret } = await req.json();

    // Validate bot token format if provided
    if (bot_token && !bot_token.startsWith("xoxb-")) {
      throw new Error("Invalid bot token format. Should start with 'xoxb-'");
    }

    // Store credentials as secrets (these are already configured as Supabase secrets)
    // In a production environment, you would update the secrets via Supabase Management API
    // For now, we'll validate and confirm the credentials are in the correct format
    
    // Log the action (without exposing credentials)
    console.log(`Slack credentials update requested by user ${user.id}`);
    console.log(`Bot token provided: ${bot_token ? "Yes" : "No"}`);
    console.log(`Signing secret provided: ${signing_secret ? "Yes" : "No"}`);

    // In a real implementation, you would store these in a secure vault
    // For now, we'll just validate and return success
    // The actual secrets are managed through the Supabase dashboard

    return new Response(
      JSON.stringify({
        success: true,
        message: "Credentials validated successfully. Please ensure they are configured in your Supabase secrets.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error storing Slack credentials:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
