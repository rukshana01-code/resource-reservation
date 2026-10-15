"use client";

import { useEffect, useState, type FormEvent } from "react";

type Resource = {
  id: number;
  name: string;
  category: string;
  capacity: number;
  description: string | null;
  isActive: boolean;
};

const emptyForm = { name: "", category: "", capacity: "1", description: "" };
const JSON_HEADERS = { "Content-Type": "application/json" };

async function readErrors(res: Response): Promise<string[]> {
  const data = await res.json().catch(() => ({}));
  if (Array.isArray(data.issues)) {
    return data.issues.map((i: { message: string }) => i.message);
  }
  return [data.error ?? "Something went wrong"];
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetch("/api/resources?all=true")
      .then((r) => r.json())
      .then((data: Resource[]) => {
        if (!ignore) setResources(data);
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);

    const payload = {
      name: form.name,
      category: form.category,
      capacity: Number(form.capacity),
      description: form.description,
    };
    const res = await fetch(
      editingId ? `/api/resources/${editingId}` : "/api/resources",
      {
        method: editingId ? "PATCH" : "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(payload),
      },
    );
    setSaving(false);

    if (!res.ok) {
      setErrors(await readErrors(res));
      return;
    }
    setForm(emptyForm);
    setEditingId(null);
    reload();
  }

  async function toggleActive(r: Resource) {
    await fetch(`/api/resources/${r.id}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify({ isActive: !r.isActive }),
    });
    reload();
  }

  function startEdit(r: Resource) {
    setEditingId(r.id);
    setErrors([]);
    setForm({
      name: r.name,
      category: r.category,
      capacity: String(r.capacity),
      description: r.description ?? "",
    });
  }

  const input = "w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Resources</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-4">
        <h2 className="font-medium">{editingId ? "Edit resource" : "Add a resource"}</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm">
            Name
            <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </label>
          <label className="text-sm">
            Category
            <input className={input} placeholder="Meeting Room, Lab, Equipment..." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </label>
          <label className="text-sm">
            Capacity
            <input type="number" min={1} className={input} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </label>
        </div>

        <label className="block text-sm">
          Description (optional)
          <input className={input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </label>

        {errors.length > 0 && (
          <ul className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {errors.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <button disabled={saving} className="rounded bg-blue-700 px-4 py-2 text-sm text-white disabled:opacity-50">
            {saving ? "Saving..." : editingId ? "Save changes" : "Add resource"}
          </button>
          {editingId && (
            <button
              type="button"
              className="rounded border px-4 py-2 text-sm"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setErrors([]);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Capacity</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {resources === null && (
              <tr><td className="p-3 text-gray-500" colSpan={5}>Loading...</td></tr>
            )}
            {resources?.length === 0 && (
              <tr><td className="p-3 text-gray-500" colSpan={5}>No resources yet. Add one above.</td></tr>
            )}
            {resources?.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-3 font-medium">
                  {r.name}
                  {r.description && <div className="text-xs font-normal text-gray-500">{r.description}</div>}
                </td>
                <td className="p-3">{r.category}</td>
                <td className="p-3">{r.capacity}</td>
                <td className="p-3">
                  <span className={r.isActive ? "text-green-700" : "text-gray-500"}>
                    {r.isActive ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="space-x-3 p-3 text-right">
                  <button className="text-blue-700 hover:underline" onClick={() => startEdit(r)}>Edit</button>
                  <button className="text-blue-700 hover:underline" onClick={() => toggleActive(r)}>
                    {r.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}