// With `output: 'static'` configured:
export const prerender = false;

import type { APIRoute } from "astro";
import { supabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();

  if (!email) {
    return new Response("Email is required", { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
      shouldCreateUser: false,
    },
  });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  // Redirect to the verification page with the email as a parameter
  return redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
};
