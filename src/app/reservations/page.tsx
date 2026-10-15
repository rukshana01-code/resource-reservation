"use client";

import { useEffect, useState, type FormEvent } from "react";

type Resource = { id: number; name: string; capacity: number };
type User = { id: number; name: string };
type Reservation = {
  id: number;
  startTime: string;
  endTime: string;
  purpose: string | null;
  status: "CONFIRMED" | "CANCELLED";
  resource: { name: string };
  user: { name: string };
};

const emptyForm = { resourceId: "", userId: "", start: "", end: "", purpose: "" };
const JSON_HEADERS = { "Content-Type": "application/json" };

function fmt(iso: string) {
  return new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function ReservationsPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [filter, setFilter] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    const listUrl = filter ? `/api/reservations?resourceId=${filter}` : "/api/reservations";
    Promise.all([
      fetch("/api/resources").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch(listUrl).then((r) => r.json()),
    ]).then(([rs, us, rv]) => {
      if (ignore) return;
      setResources(rs);
      setUsers(us);
      setReservations(rv);
    });
    return () => {
      ignore = true;
    };
  }, [filter, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSuccess("");

    if (!form.start || !form.end) {
      setErrors(["Choose a start and end time"]);
      return;
    }

    setSaving(true);
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({
        resourceId: form.resourceId,
        userId: form.userId,
        startTime: new Date(form.start).toISOString(),
        endTime: new Date(form.end).toISOString(),
        purpose: form.purpose,
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrors(
        Array.isArray(data.issues)
          ? data.issues.map((i: { message: string }) => i.message)
          : [data.error ?? "Something went wrong"],
      );
      return;
    }
    setForm(emptyForm);
    setSuccess("Reservation confirmed!");
    reload();
  }

  async function cancel(id: number) {
    if (!window.confirm("Cancel this reservation?")) return;
    await fetch(`/api/reservations/${id}`, { method: "PATCH" });
    reload();
  }

  const input = "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Reservations</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-4">
        <h2 className="font-medium">New reservation</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Resource
            <select className={input} value={form.resourceId} onChange={(e) => setForm({ ...form, resourceId: e.target.value })}>
              <option value="">Choose a resource...</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} (capacity {r.capacity})
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Booked by
            <select className={input} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })}>
              <option value="">Choose a person...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Start
            <input type="datetime-local" className={input} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          </label>
          <label className="text-sm">
            End
            <input type="datetime-local" className={input} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
          </label>
        </div>

        <label className="block text-sm">
          Purpose (optional)
          <input className={input} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
        </label>

        {errors.length > 0 && (
          <ul className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {errors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
        {success && (
          <p className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800">{success}</p>
        )}

        <button disabled={saving} className="rounded bg-blue-700 px-4 py-2 text-sm text-white disabled:opacity-50">
          {saving ? "Booking..." : "Book"}
        </button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">All reservations</h2>
          <select className="rounded border border-gray-300 bg-white px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All resources</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-100">
              <tr>
                <th className="p-3">Resource</th>
                <th className="p-3">When</th>
                <th className="p-3">Booked by</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {reservations === null && (
                <tr><td className="p-3 text-gray-500" colSpan={5}>Loading...</td></tr>
              )}
              {reservations?.length === 0 && (
                <tr><td className="p-3 text-gray-500" colSpan={5}>No reservations yet.</td></tr>
              )}
              {reservations?.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">
                    {r.resource.name}
                    {r.purpose && <div className="text-xs font-normal text-gray-500">{r.purpose}</div>}
                  </td>
                  <td className="p-3">{fmt(r.startTime)} to {fmt(r.endTime)}</td>
                  <td className="p-3">{r.user.name}</td>
                  <td className="p-3">
                    <span className={r.status === "CONFIRMED" ? "text-green-700" : "text-gray-500"}>
                      {r.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {r.status === "CONFIRMED" && (
                      <button className="text-red-700 hover:underline" onClick={() => cancel(r.id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}