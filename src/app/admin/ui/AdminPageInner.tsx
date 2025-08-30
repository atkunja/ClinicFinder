"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  setDoc,
  doc,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import type { ClinicDoc, ClinicRow, Coords } from "@/types/clinic";

const CLINICS = collection(db, "clinics");

// ----------------- helpers -----------------
function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function fixCoords(latRaw: unknown, lngRaw: unknown): Coords | null {
  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  let L = lat, G = lng;
  if (Math.abs(L) > 90 && Math.abs(G) <= 90) [L, G] = [lng, lat];
  if (Math.abs(L) > 90 || Math.abs(G) > 180) return null;
  return [L, G];
}

async function geocodeAddress(address: string): Promise<Coords | null> {
  if (!address?.trim()) return null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
      {
        headers: {
          Accept: "application/json",
          // (Optional) Nominatim likes a descriptive UA or email:
          // "User-Agent": "ClinicFinder/1.0 (contact@example.com)"
        },
      }
    );
    type NomRow = { lat: string; lon: string };
    const data: NomRow[] = (await res.json()) as NomRow[];
    if (!Array.isArray(data) || data.length === 0) return null;
    return fixCoords(data[0].lat, data[0].lon);
  } catch {
    return null;
  }
}

function toRow(d: QueryDocumentSnapshot<DocumentData>): ClinicRow {
  const data = d.data() as Partial<ClinicDoc> & {
    coords?: Coords;
    lat?: number;
    lng?: number;
  };
  const fixed = fixCoords(
    data?.coords?.[0] ?? data?.lat,
    data?.coords?.[1] ?? data?.lng
  );
  return {
    docId: d.id,
    id: (data.id ?? d.id) as string,
    name: data.name ?? "",
    address: data.address ?? "",
    url: data.url ?? "",
    services: Array.isArray(data.services)
      ? (data.services as string[])
      : String(data.services ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
    coords: (fixed ?? [0, 0]) as Coords,
    summary: data.summary ?? "",
    slug: data.slug,
    nameLower: data.nameLower,
  };
}
// -------------------------------------------

export default function AdminPageInner() {
  const [rows, setRows] = useState<ClinicRow[]>([]);
  const [editing, setEditing] = useState<ClinicRow | null>(null);
  const [form, setForm] = useState<ClinicRow>({
    docId: "",
    id: "",
    name: "",
    address: "",
    url: "",
    services: [],
    coords: [0, 0],
    summary: "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Load clinics
  useEffect(() => {
    (async () => {
      const snap = await getDocs(CLINICS);
      const list: ClinicRow[] = [];
      snap.forEach((d) => list.push(toRow(d)));
      setRows(list.sort((a, b) => a.name.localeCompare(b.name)));
    })();
  }, []);

  function setField<K extends keyof ClinicRow>(key: K, val: ClinicRow[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function startAdd() {
    setEditing(null);
    setForm({
      docId: "",
      id: "",
      name: "",
      address: "",
      url: "",
      services: [],
      coords: [0, 0],
      summary: "",
    });
  }

  function startEdit(c: ClinicRow) {
    setEditing(c);
    setForm(c);
  }

  function afterWriteReset(row?: ClinicRow) {
    setRows((prev) => {
      let next = prev.slice();
      if (row) {
        const i = next.findIndex((x) => x.docId === row.docId);
        if (i >= 0) next[i] = row;
        else next.push(row);
        next = next.sort((a, b) => a.name.localeCompare(b.name));
      }
      return next;
    });
    setEditing(null);
    startAdd();
  }

  async function handleSave() {
    setBusy(true);
    setMsg("");
    try {
      const latest = { ...form };
      const services = Array.isArray(latest.services)
        ? latest.services
        : String(latest.services ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

      let coords = fixCoords(latest.coords?.[0], latest.coords?.[1]);
      if (!coords) coords = await geocodeAddress(latest.address);
      if (!coords) throw new Error("Could not determine coordinates for this address.");

      const id = latest.id?.trim() || slugify(latest.name);
      if (!id) throw new Error("Please enter a name.");

      const payload: ClinicDoc = {
        id,
        name: latest.name,
        address: latest.address,
        url: latest.url,
        services,
        coords,
        summary: latest.summary ?? "",
        nameLower: latest.name.toLowerCase(),
        slug: id,
      };
      const targetDocId = editing?.docId || id;
      await setDoc(doc(CLINICS, targetDocId), payload);

      setMsg("Saved!");
      afterWriteReset({ ...payload, docId: targetDocId });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Save failed";
      setMsg(message);
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateSummary() {
    const url = (form.url || "").trim();
    if (!url) {
      setMsg("Enter the clinic website URL first.");
      return;
    }
    setBusy(true);
    setMsg("Fetching summary…");
    try {
      const res = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = (await res.json()) as { text?: string; error?: string };
      if (!res.ok) throw new Error(payload?.error || "Scrape failed");
      const text = String(payload?.text ?? "").trim();
      if (!text) throw new Error("No content found on that page.");
      setField("summary", text);
      setMsg("Summary fetched. Review and click Save Clinic.");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Summary failed";
      setMsg(message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Delete this clinic?")) return;
    await deleteDoc(doc(CLINICS, docId));
    setRows((prev) => prev.filter((r) => r.docId !== docId));
    if (editing?.docId === docId) startAdd();
  }

  return (
    <div className="max-w-5xl mx-auto p-6 text-black">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link href="/finder" className="text-emerald-700 underline">
          ← Back to Finder
        </Link>
      </div>

      {msg && <div className="mb-3 text-sm text-emerald-700">{msg}</div>}

      <div className="rounded border bg-white p-4 mb-8">
        <h2 className="font-semibold mb-3">
          {editing ? "Edit Clinic" : "Add New Clinic"}
        </h2>

        <div className="grid md:grid-cols-2 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Document ID (used as slug)"
            value={form.id}
            onChange={(e) => setField("id", e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
          />
          <input
            className="border p-2 rounded md:col-span-2"
            placeholder="Street address"
            value={form.address}
            onChange={(e) => setField("address", e.target.value)}
            onBlur={async (e) => {
              const c = await geocodeAddress(e.currentTarget.value);
              if (c) setField("coords", c);
            }}
          />
          <input
            className="border p-2 rounded md:col-span-2"
            placeholder="Website URL"
            value={form.url}
            onChange={(e) => setField("url", e.target.value)}
          />
          <input
            className="border p-2 rounded md:col-span-2"
            placeholder="Services (comma-separated)"
            value={form.services.join(", ")}
            onChange={(e) =>
              setField(
                "services",
                e.target.value.split(",").map((s) => s.trim())
              )
            }
          />
          <input
            className="border p-2 rounded"
            placeholder="Lat"
            value={form.coords[0]}
            onChange={(e) =>
              setField("coords", [
                Number(e.target.value) || 0,
                form.coords[1],
              ])
            }
          />
          <input
            className="border p-2 rounded"
            placeholder="Lng"
            value={form.coords[1]}
            onChange={(e) =>
              setField("coords", [
                form.coords[0],
                Number(e.target.value) || 0,
              ])
            }
          />
        </div>

        <label className="block text-sm mt-4 mb-1">Summary</label>
        <textarea
          className="border rounded w-full p-2 min-h-[140px]"
          value={form.summary ?? ""}
          onChange={(e) => setField("summary", e.target.value)}
        />

        <div className="flex gap-3 mt-4">
          <button
            disabled={busy}
            onClick={handleSave}
            className="px-4 py-2 rounded bg-emerald-600 text-white"
          >
            {editing ? "Update Clinic" : "Add Clinic"}
          </button>
          <button
            disabled={busy || !form.url}
            onClick={handleGenerateSummary}
            className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-60"
            title={!form.url ? "Enter the clinic website URL first" : ""}
          >
            {busy ? "Fetching…" : "Generate Summary"}
          </button>
          <button onClick={startAdd} className="px-4 py-2 rounded border">
            Cancel
          </button>
        </div>
      </div>

      <div className="rounded border bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Address</th>
              <th className="text-left px-3 py-2">Services</th>
              <th className="text-left px-3 py-2">Summary</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.docId} className="border-b">
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.address}</td>
                <td className="px-3 py-2">{r.services.join(", ")}</td>
                <td className="px-3 py-2 truncate max-w-[260px]">
                  {r.summary ? r.summary.slice(0, 80) : "—"}
                </td>
                <td className="px-3 py-2 flex gap-2">
                  <button
                    className="px-2 py-1 border rounded"
                    onClick={() => startEdit(r)}
                  >
                    Edit
                  </button>
                  <a
                    className="px-2 py-1 border rounded"
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Website
                  </a>
                  <button
                    className="px-2 py-1 border rounded text-red-600"
                    onClick={() => handleDelete(r.docId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="px-3 py-4 text-gray-600" colSpan={5}>
                  No clinics yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
