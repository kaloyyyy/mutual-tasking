"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string }>({
    full_name: "",
    avatar_url: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (data) setProfile({ full_name: data.full_name, avatar_url: data.avatar_url });
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id);
    if (error) alert(error.message);
    else alert("Profile updated!");
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">My Profile</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={profile.full_name}
        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
        className="border p-2 w-full mb-2 rounded"
      />
      <input
        type="text"
        placeholder="Avatar URL"
        value={profile.avatar_url}
        onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
        className="border p-2 w-full mb-2 rounded"
      />
      <button onClick={handleUpdate} className="bg-blue-500 text-white p-2 rounded">
        Update
      </button>
    </div>
  );
}
