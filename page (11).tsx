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

type Announcement = {
  id: string;
  title: string;
  message: string;
  category: string;
  author_email: string;
  published: boolean;
  created_at: string;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [announcementCategory, setAnnouncementCategory] = useState("update");

  const [activeTab, setActiveTab] = useState<"tickets" | "announcements">(
    "tickets"
  );

  const [successMessage, setSuccessMessage] = useState("");

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
    await fetchAnnouncements();
    setLoading(false);
  }

  function showSuccess(message: string) {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
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

  async function fetchAnnouncements() {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setAnnouncements(data);
  }

  async function updateTicketStatus(id: string, status: string) {
    const { error } = await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", id);

    if (error) {
      showSuccess(error.message);
      return;
    }

    await fetchTickets();
    showSuccess(`Ticket marked as ${status}.`);
  }

  async function deleteTicket(id: string) {
    const { error: replyError } = await supabase
      .from("ticket_replies")
      .delete()
      .eq("ticket_id", id);

    if (replyError) {
      showSuccess(replyError.message);
      return;
    }

    const { error } = await supabase
      .from("support_tickets")
      .delete()
      .eq("id", id);

    if (error) {
      showSuccess(error.message);
      return;
    }

    await fetchTickets();
    await fetchReplies();
    showSuccess("Ticket deleted.");
  }

  async function sendReply(ticketId: string) {
    const message = replyText[ticketId];

    if (!message || !message.trim()) {
      showSuccess("Please type a reply first.");
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
      showSuccess(error.message);
      return;
    }

    setReplyText((prev) => ({ ...prev, [ticketId]: "" }));
    await fetchReplies();
    showSuccess("Reply sent.");
  }

  async function createAnnouncement() {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      showSuccess("Please add a title and message.");
      return;
    }

    const { error } = await supabase.from("announcements").insert([
      {
        title: announcementTitle,
        message: announcementMessage,
        category: announcementCategory,
        author_email: email,
        published: true,
      },
    ]);

    if (error) {
      showSuccess(error.message);
      return;
    }

    setAnnouncementTitle("");
    setAnnouncementMessage("");
    setAnnouncementCategory("update");

    await fetchAnnouncements();
    showSuccess("Announcement published.");
  }

  async function deleteAnnouncement(id: string) {
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      showSuccess(error.message);
      return;
    }

    await fetchAnnouncements();
    showSuccess("Announcement deleted.");
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

          {successMessage && (
            <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 px-5 py-4 font-bold text-green-400">
              {successMessage}
            </div>
          )}

          <div className="mt-10 grid gap-6 md:grid-cols-4">
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

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                Announcements
              </p>
              <p className="mt-3 text-5xl font-black">
                {announcements.length}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("tickets")}
              className={`rounded-lg px-5 py-3 font-bold uppercase ${
                activeTab === "tickets"
                  ? "bg-orange-600"
                  : "border border-zinc-700 hover:border-orange-500"
              }`}
            >
              Support Tickets
            </button>

            <button
              onClick={() => setActiveTab("announcements")}
              className={`rounded-lg px-5 py-3 font-bold uppercase ${
                activeTab === "announcements"
                  ? "bg-orange-600"
                  : "border border-zinc-700 hover:border-orange-500"
              }`}
            >
              Announcements
            </button>

            <button
              onClick={async () => {
                await fetchTickets();
                await fetchReplies();
                await fetchAnnouncements();
                showSuccess("Admin dashboard refreshed.");
              }}
              className="rounded-lg border border-zinc-700 px-5 py-3 font-bold uppercase hover:border-orange-500 hover:text-orange-500"
            >
              Refresh
            </button>
          </div>

          {activeTab === "announcements" && (
            <div className="mt-10 rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">
                News System
              </p>

              <h2 className="mt-3 text-4xl font-black uppercase">
                Create Announcement
              </h2>

              <div className="mt-8 grid gap-4">
                <input
                  type="text"
                  placeholder="Announcement Title"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-4 outline-none focus:border-orange-500"
                />

                <select
                  value={announcementCategory}
                  onChange={(e) => setAnnouncementCategory(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-4 outline-none focus:border-orange-500"
                >
                  <option value="update">Update</option>
                  <option value="wipe">Wipe</option>
                  <option value="event">Event</option>
                  <option value="store">Store</option>
                  <option value="alert">Alert</option>
                </select>

                <textarea
                  placeholder="Announcement Message"
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-4 outline-none focus:border-orange-500"
                />

                <button
                  onClick={createAnnouncement}
                  className="rounded-xl bg-orange-600 px-6 py-4 font-black uppercase transition hover:bg-orange-700"
                >
                  Publish Announcement
                </button>
              </div>

              <div className="mt-10 grid gap-6">
                {announcements.length === 0 ? (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-zinc-400">
                    No announcements yet.
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8"
                    >
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div>
                          <p className="text-sm font-bold uppercase tracking-widest text-orange-500">
                            {announcement.category}
                          </p>

                          <h3 className="mt-2 text-3xl font-black uppercase">
                            {announcement.title}
                          </h3>

                          <p className="mt-2 text-sm text-zinc-500">
                            By: {announcement.author_email || "Admin"}
                          </p>

                          <p className="mt-2 text-sm text-zinc-600">
                            Posted:{" "}
                            {new Date(
                              announcement.created_at
                            ).toLocaleString()}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteAnnouncement(announcement.id)}
                          className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-bold uppercase text-red-400 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>

                      <p className="mt-6 whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300">
                        {announcement.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "tickets" && (
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
                                  {new Date(
                                    reply.created_at
                                  ).toLocaleString()}
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
          )}
        </section>
      </main>
    </>
  );
}