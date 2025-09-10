"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Auth from "@/components/Auth";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard"); // redirect if logged in
      } else {
        setLoading(false); // show login/signup
      }
    };
    checkSession();

    // optional: listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/dashboard");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return <Auth />;
}
