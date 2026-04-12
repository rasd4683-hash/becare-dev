import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin using their token
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roles } = await adminClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Unlink FK references on site_visitors first
    await adminClient.from("site_visitors").update({ linked_conversation_id: null, linked_request_id: null }).neq("id", "00000000-0000-0000-0000-000000000000");
    // Delete all data from tables (order matters for foreign keys)
    await adminClient.from("chat_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient.from("chat_conversations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient.from("insurance_orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient.from("insurance_requests").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient.from("claims").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient.from("site_visitors").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient.from("activity_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await adminClient.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
