import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { session_id, visitor_ids } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Batch mode: resolve geo for multiple visitors by their IDs (admin-triggered)
    if (visitor_ids && Array.isArray(visitor_ids) && visitor_ids.length > 0) {
      const { data: visitors } = await adminClient
        .from("site_visitors")
        .select("id, session_id, ip_address")
        .in("id", visitor_ids);

      if (!visitors || visitors.length === 0) {
        return new Response(JSON.stringify({ updated: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let updated = 0;
      for (const visitor of visitors) {
        const ip = visitor.ip_address;
        if (!ip || ip === "unknown" || ip === "127.0.0.1") continue;

        try {
          const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode`);
          const geoData = await geoRes.json();

          if (geoData.status === "success") {
            await adminClient
              .from("site_visitors")
              .update({ country: geoData.country, country_code: geoData.countryCode })
              .eq("id", visitor.id);
            updated++;
          }
        } catch {
          // Skip failed lookups
        }
      }

      return new Response(JSON.stringify({ updated }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Single mode: resolve geo for a session (visitor-triggered)
    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id or visitor_ids required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!clientIp || clientIp === "unknown" || clientIp === "127.0.0.1") {
      return new Response(JSON.stringify({ country: null, ip: clientIp }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geoRes = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,country,countryCode`);
    const geoData = await geoRes.json();

    const country = geoData.status === "success" ? geoData.country : null;
    const countryCode = geoData.status === "success" ? geoData.countryCode : null;

    await adminClient
      .from("site_visitors")
      .update({ country, country_code: countryCode, ip_address: clientIp })
      .eq("session_id", session_id);

    return new Response(
      JSON.stringify({ country, countryCode, ip: clientIp }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
