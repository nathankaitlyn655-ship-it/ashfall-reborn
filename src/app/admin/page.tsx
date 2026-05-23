"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";

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

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setEmail(user.email || "");

    const { data: adminData } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!adminData) {
      window.location.href = "/";
      return;
    }

    setAuthorized(true);
    await fetchTickets();
    await fetchReplies();
    setLoading(false);
  }

  async function fetchTickets() {
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setTickets(data);
  }

  async function fetchReplies() {
    const { data } = await supabase
      .from("ticket_replies")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) setReplies(data);
  }

  async function updateTicketStatus(id: string, status: string) {
    const { error } = await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await fetchTickets();
  }

  async function deleteTicket(id: string) {
    const confirmDelete = confirm("Delete this ticket permanently?");
    if (!confirmDelete) return;

    await supabase.from("ticket_replies").delete().eq("ticket_id", id);

    const { error } = await supabase
      .from("support_tickets")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await fetchTickets();
    await fetchReplies();
  }

  async function sendReply(ticketId: string) {
    const message = replyText[ticketId];

    if (!message || !message.trim()) {
      alert("Please type a reply first.");
      return;
    }

    const { error } = await supabase.from("ticket_replies").insert([
      {
        ticket_id: ticketId,
        email,
        message,
        is_admin: true,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setReplyText((prev) => ({ ...prev, [ticketId]: "" }));
    await fetchReplies();
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        Loading admin panel...
      </main>
    );
  }

  if (!authorized) return null;

  const openTickets = tickets.filter((ticket) => ticket.status === "open");
  const closedTickets = tickets.filter((ticket) => ticket.status === "closed");

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-950 px-6 py-32 text-white">
        <section className="mx-auto max-w-7xl fade-up">
          <div className="rounded-3xl border border-orange-500/20 bg-zinc-900 p-10 shadow-2xl shadow-orange-500/10">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
              Admin Only
            </p>

            <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <h1 className="text-5xl font-black uppercase">
                  Staff Control Panel
                </h1>

                <p className="mt-4 text-zinc-400">
                  Logged in as{" "}
                  <span className="font-bold text-orange-500">{email}</span>
                </p>
              </div>

              <button
                onClick={logout}
                className="rounded-lg bg-orange-600 px-6 py-3 font-bold uppercase transition hover:bg-orange-700"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                Total Tickets
              </p>
              <p className="mt-3 text-5xl font-black">{tickets.length}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                Open Tickets
              </p>
              <p className="mt-3 text-5xl font-black text-green-400">
                {openTickets.length}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                Closed Tickets
              </p>
              <p className="mt-3 text-5xl font-black text-red-400">
                {closedTickets.length}
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
                  Support Center
                </p>

                <h2 className="mt-3 text-4xl font-black uppercase">
                  Support Tickets
                </h2>
              </div>

              <button
                onClick={async () => {
                  await fetchTickets();
                  await fetchReplies();
                }}
                className="rounded-lg border border-zinc-700 px-5 py-3 font-bold uppercase transition hover:border-orange-500 hover:text-orange-500"
              >
                Refresh
              </button>
            </div>

            <div className="mt-8 grid gap-6">
              {tickets.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-400">
                  No support tickets yet.
                </div>
              ) : (
                tickets.map((ticket) => {
                  const ticketReplies = replies.filter(
                    (reply) => reply.ticket_id === ticket.id
                  );

                  return (
                    <div
                      key={ticket.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8"
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div>
                          <p
                            className={`text-sm font-bold uppercase tracking-widest ${
                              ticket.status === "open"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {ticket.status}
                          </p>

                          <h3 className="mt-2 text-3xl font-black uppercase">
                            {ticket.subject}
                          </h3>

                          <p className="mt-2 text-sm text-zinc-500">
                            From: {ticket.email || "No email provided"}
                          </p>

                          <p className="mt-2 text-sm text-zinc-600">
                            Created:{" "}
                            {new Date(ticket.created_at).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() =>
                              updateTicketStatus(ticket.id, "open")
                            }
                            className="rounded-lg border border-green-500/40 px-4 py-2 text-sm font-bold uppercase text-green-400 hover:bg-green-500/10"
                          >
                            Open
                          </button>

                          <button
                            onClick={() =>
                              updateTicketStatus(ticket.id, "closed")
                            }
                            className="rounded-lg border border-orange-500/40 px-4 py-2 text-sm font-bold uppercase text-orange-400 hover:bg-orange-500/10"
                          >
                            Close
                          </button>

                          <button
                            onClick={() => deleteTicket(ticket.id)}
                            className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-bold uppercase text-red-400 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                          Original Message
                        </p>

                        <p className="mt-3 whitespace-pre-wrap text-zinc-300">
                          {ticket.message}
                        </p>
                      </div>

                      <div className="mt-6 space-y-4">
                        <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                          Conversation
                        </p>

                        {ticketReplies.length === 0 ? (
                          <p className="text-zinc-500">No replies yet.</p>
                        ) : (
                          ticketReplies.map((reply) => (
                            <div
                              key={reply.id}
                              className={`rounded-xl border p-5 ${
                                reply.is_admin
                                  ? "border-orange-500/30 bg-orange-500/10"
                                  : "border-zinc-800 bg-zinc-900"
                              }`}
                            >
                              <p className="text-sm font-bold text-orange-500">
                                {reply.is_admin ? "Admin" : "User"} •{" "}
                                {reply.email || "Unknown"}
                              </p>

                              <p className="mt-2 whitespace-pre-wrap text-zinc-300">
                                {reply.message}
                              </p>

                              <p className="mt-3 text-xs text-zinc-600">
                                {new Date(reply.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="mt-6">
                        <textarea
                          placeholder="Reply to this ticket..."
                          value={replyText[ticket.id] || ""}
                          onChange={(e) =>
                            setReplyText((prev) => ({
                              ...prev,
                              [ticket.id]: e.target.value,
                            }))
                          }
                          rows={4}
                          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-orange-500"
                        />

                        <button
                          onClick={() => sendReply(ticket.id)}
                          className="mt-3 rounded-lg bg-orange-600 px-6 py-3 font-bold uppercase transition hover:bg-orange-700"
                        >
                          Send Reply
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}