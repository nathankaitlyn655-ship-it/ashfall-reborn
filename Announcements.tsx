
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {announcements.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-500">
              No announcements published yet.
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 transition duration-300 hover:-translate-y-2 hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/10"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-500">
                    {announcement.category}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {new Date(
                      announcement.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>

                <h3 className="mt-5 text-3xl font-black uppercase">
                  {announcement.title}
                </h3>

                <p className="mt-5 whitespace-pre-wrap leading-7 text-zinc-400">
                  {announcement.message}
                </p>

                <div className="mt-6 border-t border-zinc-800 pt-4">
                  <p className="text-xs uppercase tracking-widest text-zinc-600">
                    Posted by{" "}
                    <span className="text-orange-500">
                      {announcement.author_email || "Admin"}
                    </span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
