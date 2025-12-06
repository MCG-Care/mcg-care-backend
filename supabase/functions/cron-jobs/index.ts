// Edge Function for Render keep-alive and cron jobs
// This function will be called by Supabase pg_cron on a schedule

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RENDER_API_URL = Deno.env.get("RENDER_API_URL") || "https://your-app.onrender.com";
const API_AUTH_TOKEN = Deno.env.get("API_AUTH_TOKEN") || ""; // Optional: if you need auth

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
      // Call the daily maintenance endpoint
      console.log("🔧 Running daily maintenance...");
      
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      // Add auth token if provided
      if (API_AUTH_TOKEN) {
        headers["Authorization"] = `Bearer ${API_AUTH_TOKEN}`;
      }

      const response = await fetch(`${RENDER_API_URL}/timeslots/maintenance/daily`, {
        method: "POST",
        headers,
      });

      const data = await response.json();
      console.log(`✅ Daily maintenance completed: ${response.status}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Daily maintenance completed",
          status: response.status,
          data,
        }),
        { headers: { "Content-Type": "application/json" }, status: 200 }
      );
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
        error: error.message,
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
