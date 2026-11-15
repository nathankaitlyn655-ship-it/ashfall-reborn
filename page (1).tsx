"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabaseClient";

type Ticket = {
  id: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

type Reply = {
  id: string;
  ticket_id: string;
  email: string;
  message: string;
  is_admin: boolean;
  created_at: string;
};

export default function SupportPage() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadSupport() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        setEmail(user.email || "");

        const { data: ticketData } = await supabase
          .from("support_tickets")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (ticketData) setTickets(ticketData);
      }
    }

    loadSupport();
    fetchReplies();
  }, []);

  async function fetchReplies() {
    const { data } = await supabase
      .from("ticket_replies")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) setReplies(data);
  }

  async function refreshTickets() {
    if (!userId) return;

    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) setTickets(data);

    await fetchReplies();
  }

  async function submitTicket() {
    if (!email.trim() || !subject.trim() || !message.trim()) {
      alert("Please fill out email, subject, and message.");
      return;
    }

    const { error } = await supabase.from("support_tickets").insert([
      {
        user_id: userId || null,
        email,
        subject,
        message,
        status: "open",
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setSuccessMessage("Support ticket submitted successfully!");

    setTimeout(() => {
      setSuccessMessage("");
    }, 4000);

    setSubject("");
    setMessage("");

    await refreshTickets();
  }

  async function sendUserReply(ticketId: string) {
    const text = replyText[ticketId];

    if (!text || !text.trim()) {
      alert("Please type a reply first.");
      return;
    }

    const { error } = await supabase.from("ticket_replies").insert([
      {
        ticket_id: ticketId,
        user_id: userId || null,
        email,
        message: text,
        is_admin: false,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setReplyText((prev) => ({ ...prev, [ticketId]: "" }));
    await fetchReplies();
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-white">
        <section className="mx-auto max-w-5xl fade-up">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-10">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
              Support
            </p>

            <h1 className="mt-4 text-5xl font-black uppercase">
              Create Ticket
            </h1>

            <p className="mt-6 text-zinc-400">
              Need help with the server, store, Discord, or gameplay? Submit a
              support ticket below.
            </p>

            {successMessage && (
              <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 font-bold text-green-400">
                {successMessage}
              </div>
            )}

            <div className="mt-8 space-y-4">
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
              />

              <input
                type="text"
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
              />

              <textarea
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-orange-500"
              />

              <button
                onClick={submitTicket}
                className="w-full rounded-xl bg-orange-600 px-6 py-3 font-bold transition hover:bg-orange-700"
              >
                Submit Ticket
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}