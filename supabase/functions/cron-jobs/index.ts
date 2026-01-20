// Edge Function for Render keep-alive and cron jobs
// This function will be called by Supabase pg_cron on a schedule

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RENDER_API_URL = Deno.env.get("RENDER_API_URL") || "https://your-app.onrender.com";
const CRON_SECRET = Deno.env.get("CRON_SECRET") || ""; // Secret token for cron authentication

serve(async (req) => {
  try {
    const { action } = await req.json();

    if (action === "keep-alive") {
      // Ping the root endpoint to keep Render awake
      console.log("🔔 Keep-alive ping to Render...");
      const response = await fetch(`${RENDER_API_URL}/`, {
        method: "GET",
      });
      
      const text = await response.text();
      console.log(`✅ Keep-alive successful: ${response.status}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Keep-alive ping successful",
          status: response.status,
          body: text,
        }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
    }

    if (action === "daily-maintenance") {
      // Call the daily maintenance endpoint using secret token (no JWT expiration)
      console.log("🔧 Running daily maintenance...");
      console.log(`📍 Target URL: ${RENDER_API_URL}/timeslots/maintenance/daily-cron`);
      
      if (!CRON_SECRET) {
        throw new Error("CRON_SECRET environment variable is not set");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Cron-Secret": CRON_SECRET,
      };

      try {
        const response = await fetch(`${RENDER_API_URL}/timeslots/maintenance/daily-cron`, {
          method: "POST",
          headers,
        });

        const responseText = await response.text();
        console.log(`📊 Response status: ${response.status}`);
        console.log(`📄 Response body: ${responseText.substring(0, 500)}`);

        if (!response.ok) {
          throw new Error(`Maintenance failed: ${response.status} - ${responseText}`);
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.warn("⚠️ Failed to parse response as JSON, using raw text");
          data = { raw: responseText };
        }

        console.log(`✅ Daily maintenance completed: ${response.status}`);
        console.log(`📈 Maintenance result:`, JSON.stringify(data, null, 2));

        return new Response(
          JSON.stringify({
            success: true,
            message: "Daily maintenance completed",
            status: response.status,
            data,
          }),
          { headers: { "Content-Type": "application/json" }, status: 200 }
        );
      } catch (fetchError) {
        console.error("❌ Fetch error:", fetchError);
        throw new Error(`Failed to call maintenance endpoint: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid action. Use 'keep-alive' or 'daily-maintenance'",
      }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
