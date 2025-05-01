// With `output: 'static'` configured:
export const prerender = false;

import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const token = formData.get("token")?.toString();

  if (!email || !token) {
    return new Response("Email and token are required", { status: 400 });
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  // Successfully verified OTP, user is now logged in
  // Redirect to the dashboard or home page
  return redirect("/dashboard");
};
