const notes = [
  { title: "On quiet mornings", meta: "Today · 312 words", active: true },
  { title: "Things worth keeping", meta: "Yesterday · 184 words" },
  { title: "The long way home", meta: "Sep 14 · 526 words" },
];

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="currentColor">
      <circle cx="3" cy="8" r="1" /><circle cx="8" cy="8" r="1" /><circle cx="13" cy="8" r="1" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-4 text-foreground sm:p-8">
      <section className="w-full max-w-3xl overflow-hidden rounded-2xl border bg-card shadow-md">
        <header className="flex h-14 items-center justify-between border-b px-4 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
              P
            </span>
            <span className="text-sm font-semibold tracking-tight">Papyrbound</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">Saved just now</span>
            <button aria-label="More options" className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              <MoreIcon />
            </button>
            <button className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground shadow-xs transition-transform hover:-translate-y-px">
              <PlusIcon /> New note
            </button>
          </div>
        </header>

        <div className="grid min-h-[32rem] sm:grid-cols-[15rem_1fr]">
          <aside className="hidden border-r bg-secondary/70 p-3 sm:block">
            <div className="mb-3 flex items-center justify-between px-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Library</span>
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">3</span>
            </div>

            <nav aria-label="Notes" className="space-y-1">
              {notes.map((note) => (
                <a
                  href="#"
                  key={note.title}
                  aria-current={note.active ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2.5 transition-colors ${
                    note.active
                      ? "bg-card text-card-foreground shadow-xs ring-1 ring-border"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span className="block truncate text-sm font-medium">{note.title}</span>
                  <span className="mt-1 block font-mono text-[10px] opacity-70">{note.meta}</span>
                </a>
              ))}
            </nav>

            <div className="mt-6 border-t px-2 pt-4">
              <p className="text-xs leading-5 text-muted-foreground">All changes are stored locally.</p>
              <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
                <div className="h-full w-2/5 rounded-full bg-foreground" />
              </div>
            </div>
          </aside>

          <article className="flex flex-col bg-card px-6 py-8 sm:px-10 sm:py-10">
            <div className="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <span>Personal</span>
              <span className="size-1 rounded-full bg-border" />
              <span>September 17</span>
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">On quiet mornings</h1>

            <div className="mt-7 max-w-lg space-y-5 text-[15px] leading-7 text-muted-foreground">
              <p>
                The day feels larger before everyone else wakes. There is room for a thought to arrive slowly, without being asked what it is for.
              </p>
              <p>
                I keep the window open and write down whatever stays. Not everything needs to become something. Some words are worth keeping simply because they were here.
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between border-t pt-5">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">reflection</span>
                <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">morning</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">312 words</span>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
