// With `output: 'static'` configured:
export const prerender = false;

import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const token = formData.get("token")?.toString();

  if (!email || !token) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Email and token are required",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Check if we got a session back
  if (!data.session) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to create session",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Successfully verified OTP and got a session
  const { session } = data;

  // Set auth cookies
  cookies.set("sb-access-token", session.access_token, {
    path: "/",
  });
  cookies.set("sb-refresh-token", session.refresh_token, {
    path: "/",
  });

  return redirect("/dashboard");
};
