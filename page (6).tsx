"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";

export default function ProfilePage() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [steamId, setSteamId] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      const { data } = await supabase
        .from("player_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setDisplayName(data.display_name || data.username || "");
        setSteamId(data.steam_id_public || "");
        setAvatarUrl(data.avatar_url || "");
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function uploadAvatar(file: File) {
    setErrorMessage("");
    setSuccessMessage("");

    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      setUploading(false);
      setErrorMessage(uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const publicUrl = data.publicUrl;

    setAvatarUrl(publicUrl);
    setUploading(false);
    setSuccessMessage("Avatar uploaded. Click Save Profile to finish.");
  }

  async function saveProfile() {
    setSuccessMessage("");
    setErrorMessage("");

    if (!displayName.trim()) {
      setErrorMessage("Please enter a display name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("player_profiles")
      .upsert(
        {
          user_id: userId,
          username: displayName,
          display_name: displayName,
          steam_id_public: steamId,
          avatar_url: avatarUrl,
        },
        {
          onConflict: "user_id",
        }
      );

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccessMessage("Profile saved successfully!");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1200);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading profile...
      </main>
    );
  }

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-6 py-32 text-white">
        <div className="absolute inset-0">
          <img
            src="https://i.imgur.com/OCzWrRI.png"
            alt="Ashfall Reborn Profile Background"
            className="h-full w-full scale-105 object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>

        <div className="pointer-events-none absolute left-10 top-32 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-20 right-10 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />

        <section className="relative z-10 mx-auto max-w-6xl fade-up">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-3xl border border-orange-500/20 bg-zinc-900/90 p-8 shadow-2xl shadow-orange-500/10 backdrop-blur">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-orange-500/30 bg-orange-500/10 text-6xl font-black text-orange-500">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Player Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (displayName || email || "A").charAt(0).toUpperCase()
                )}
              </div>

              <h1 className="mt-6 text-center text-4xl font-black uppercase">
                {displayName || "New Player"}
              </h1>

              <p className="mt-2 text-center text-sm font-bold uppercase tracking-widest text-orange-500">
                Ashfall Reborn Member
              </p>

              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-zinc-950 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Account Email
                  </p>
                  <p className="mt-2 break-all font-bold text-zinc-300">
                    {email}
                  </p>
                </div>

                <div className="rounded-2xl bg-zinc-950 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                    Steam
                  </p>
                  <p className="mt-2 break-all font-bold text-zinc-300">
                    {steamId || "Not linked yet"}
                  </p>
                </div>

                <div className="rounded-2xl bg-green-500/10 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                    Status
                  </p>
                  <p className="mt-2 font-black text-green-400">Active</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 backdrop-blur lg:col-span-2">
              <p className="text-sm font-bold uppercase tracking-[0.4em] text-orange-500">
                Player Profile
              </p>

              <h2 className="mt-4 text-5xl font-black uppercase">
                Edit Your Identity
              </h2>

              <p className="mt-4 max-w-2xl text-zinc-400">
                Set your avatar, public display name, and Steam profile
                information for future leaderboards, support tools, account
                moderation, and player tracking.
              </p>

              {errorMessage && (
                <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 font-bold text-red-400">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 font-bold text-green-400">
                  {successMessage}
                </div>
              )}

              <div className="mt-8 grid gap-5">
                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-zinc-500">
                    Upload Avatar
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        uploadAvatar(file);
                      }
                    }}
                    className="w-full cursor-pointer rounded-xl border border-zinc-700 bg-black px-5 py-4 text-zinc-400 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-orange-600 file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-orange-700 focus:border-orange-500"
                  />

                  <p className="mt-2 text-sm text-zinc-500">
                    {uploading
                      ? "Uploading avatar..."
                      : "Recommended: square image, PNG or JPG."}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-zinc-500">
                    Display Name
                  </label>

                  <input
                    type="text"
                    placeholder="Your in-game name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-black px-5 py-4 outline-none transition focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-zinc-500">
                    Steam ID / Steam Profile Link
                  </label>

                  <input
                    type="text"
                    placeholder="Steam ID or profile URL"
                    value={steamId}
                    onChange={(e) => setSteamId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-black px-5 py-4 outline-none transition focus:border-orange-500"
                  />
                </div>

                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-6">
                  <h3 className="text-2xl font-black uppercase text-orange-500">
                    Profile System
                  </h3>

                  <p className="mt-3 text-zinc-400">
                    Your avatar and profile will appear in future player
                    cards, leaderboards, tickets, account panels, and Rust
                    server integrations.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <button
                    onClick={saveProfile}
                    disabled={saving || uploading}
                    className="rounded-xl bg-orange-600 px-8 py-4 text-lg font-black uppercase tracking-wide transition hover:scale-[1.02] hover:bg-orange-700 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </button>

                  <a
                    href="/dashboard"
                    className="rounded-xl border border-zinc-700 px-8 py-4 text-center text-lg font-black uppercase tracking-wide transition hover:border-orange-500 hover:text-orange-500"
                  >
                    Back To Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}