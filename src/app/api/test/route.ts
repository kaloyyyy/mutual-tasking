import { supabase } from '@/lib/supabaseClient';

const { data, error } = await supabase.auth.signUp({
  email: "test@example.com",
  password: "password123",
});

if (error) console.error("SignUp error:", error.message);
else if (data.user) console.log("User created:", data.user.id);
else console.log("User created, but user data is unavailable.");
