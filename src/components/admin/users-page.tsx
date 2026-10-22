"use client";

import { useCallback, useEffect, useState } from "react";

type ManagedUser = {
  id: string;
  email: string;
  display_name: string;
  role: string;
  is_founder?: boolean;
  must_change_password?: boolean;
  created_at?: string;
  last_sign_in_at?: string | null;
};

function UserEditor({ user, onSaved }: { user: ManagedUser; onSaved: () => void }) {
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.display_name);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const changes: Record<string, string> = {};
    if (email.trim().toLowerCase() !== user.email.toLowerCase()) changes.email = email.trim();
    if (name.trim() !== user.display_name) changes.display_name = name.trim();
    if (password) changes.password = password;
    if (!Object.keys(changes).length) { setMessage("No changes to save."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "User could not be updated");
      setPassword("");
      setMessage("User updated.");
      onSaved();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "User could not be updated"); }
    finally { setBusy(false); }
  }

  return <details className="group border-t border-[#d8d3c8] py-5"><summary className="min-h-12 cursor-pointer list-none rounded px-2 py-2 focus-visible:outline-2 focus-visible:outline-[#163e3a]"><span className="flex flex-wrap items-center justify-between gap-2"><span className="font-serif text-xl">{user.display_name || user.email}</span><span className="text-sm font-semibold text-[#9a533e] group-open:hidden">Manage account ↓</span><span className="hidden text-sm font-semibold text-[#9a533e] group-open:inline">Close ↑</span></span><span className="mt-1 block break-all text-sm text-[#4f625f]">{user.email}</span><span className="mt-1 block text-xs text-[#4f625f]">{user.role}{user.must_change_password ? " · Password change required" : ""} · Last sign in: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "Never"}</span></summary><form onSubmit={save} className="px-2 pb-2">
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold">Display name<input required autoComplete="off" maxLength={100} value={name} onChange={event => setName(event.target.value)} className="mt-2 min-h-12 w-full rounded border border-[#aaa99e] bg-white p-3 text-base focus-visible:outline-2 focus-visible:outline-[#163e3a]" /></label>
      <label className="text-sm font-semibold">Sign-in email<input required type="email" autoComplete="off" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 min-h-12 w-full rounded border border-[#aaa99e] bg-white p-3 text-base focus-visible:outline-2 focus-visible:outline-[#163e3a]" /></label>
      <label className="text-sm font-semibold sm:col-span-2">New temporary password, if resetting<input type="password" autoComplete="new-password" minLength={12} value={password} onChange={event => setPassword(event.target.value)} placeholder="Leave blank to keep the current password" className="mt-2 min-h-12 w-full rounded border border-[#aaa99e] bg-white p-3 text-base focus-visible:outline-2 focus-visible:outline-[#163e3a]" /></label>
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-[#9a2e2e]">{error}</p>}
    {message && <p role="status" className="mt-3 text-sm text-[#256b45]">{message}</p>}
    <button disabled={busy} className="mt-4 min-h-12 w-full rounded border border-[#163e3a] px-5 font-semibold disabled:opacity-50 sm:w-auto">{busy ? "Saving…" : "Save changes"}</button>
  </form></details>;
}

export function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const reload = useCallback(() => setRefresh(value => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/users?page=${page}`, { signal: controller.signal })
      .then(async response => { const result = await response.json(); if (!response.ok) throw Error(result.error || "Could not load users"); return result; })
      .then(result => { setUsers(result.data || []); setHasMore(Boolean(result.pagination?.hasMore)); setError(""); })
      .catch(cause => { if (cause.name !== "AbortError") setError(cause.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, refresh]);

  async function create(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, display_name: name, password }),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || "Could not create user");
      setEmail(""); setName(""); setPassword("");
      setMessage("User created. They will be asked to change the temporary password when they first sign in.");
      setPage(1); reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not create user"); }
    finally { setBusy(false); }
  }

  return <><p className="text-xs font-bold uppercase tracking-[.2em] text-[#9a533e]">Account access</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Users</h1>
    <p className="mt-3 max-w-2xl leading-7 text-[#4f625f]">As founder, you can add users and manage their sign-in details. New users must change their temporary password on first sign-in.</p>
    {error && <p role="alert" className="mt-6 rounded border border-[#9a2e2e] p-4 text-[#9a2e2e]">{error}</p>}
    {message && <p role="status" className="mt-6 rounded border border-[#256b45] p-4 text-[#256b45]">{message}</p>}
    <div className="mt-9 grid gap-10 xl:grid-cols-[380px_1fr]">
      <form onSubmit={create} className="h-fit border border-[#d8d3c8] bg-[#fffcf6] p-5 sm:p-6"><h2 className="font-serif text-2xl">Add user</h2>
        <div className="mt-5 grid gap-4"><label className="text-sm font-semibold">Display name<input required maxLength={100} value={name} onChange={event => setName(event.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3" /></label>
          <label className="text-sm font-semibold">Sign-in email<input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3" /></label>
          <label className="text-sm font-semibold">Temporary password<input required type="password" autoComplete="new-password" minLength={12} value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded border border-[#aaa99e] bg-white p-3" /></label></div>
        <p className="mt-4 text-xs leading-5 text-[#4f625f]">Use a unique password of at least 12 characters. Share it privately; the new administrator must change it before opening the dashboard.</p>
        <button disabled={busy} className="mt-5 min-h-11 rounded bg-[#163e3a] px-5 font-semibold text-white disabled:opacity-50">{busy ? "Creating…" : "Create user"}</button>
      </form>
      <section><h2 className="font-serif text-2xl">Existing users</h2>{loading ? <p className="mt-5">Loading users…</p> : users.length ? users.map(user => <UserEditor key={user.id} user={user} onSaved={reload} />) : <p className="mt-5 text-[#4f625f]">No users on this page.</p>}
        {(page > 1 || hasMore) && <nav aria-label="User pages" className="mt-5 flex items-center gap-4 text-sm font-semibold"><button disabled={page === 1} onClick={() => { setLoading(true); setPage(page - 1); }} className="rounded border border-[#163e3a] px-4 py-2 disabled:opacity-40">Previous</button><span>Page {page}</span><button disabled={!hasMore} onClick={() => { setLoading(true); setPage(page + 1); }} className="rounded border border-[#163e3a] px-4 py-2 disabled:opacity-40">Next</button></nav>}
      </section>
    </div>
  </>;
}
