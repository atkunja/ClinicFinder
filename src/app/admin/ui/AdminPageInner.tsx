"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";
import Link from "next/link";

type Coords = [number, number];

export type Clinic = {
  id: string;
  slug?: string;
  name: string;
  nameLower?: string;
  address: string;
  url?: string;
  phone?: string;
  services: string[];
  coords: Coords;
  summary?: string;
  verified?: boolean;
  languages?: string[];
  eligibility?: string[];
  hours?: Record<string, string>;
  photoUrl?: string;
};

const DAYS: Array<keyof NonNullable<Clinic["hours"]>> = [
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
];

function parseCSV(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

export default function AdminPageInner() {
  // ——— NO gating / NO disabled overlay ———
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // form state
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [url, setUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [servicesInput, setServicesInput] = useState("");
  const [lat, setLat] = useState<string>("0");
  const [lng, setLng] = useState<string>("0");
  const [summary, setSummary] = useState("");
  const [verified, setVerified] = useState(false);
  const [languagesInput, setLanguagesInput] = useState("");
  const [eligibilityInput, setEligibilityInput] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [hours, setHours] = useState<Record<string, string>>({
    Mon: "", Tue: "", Wed: "", Thu: "", Fri: "", Sat: "", Sun: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const ref = collection(db, "clinics");
    const unsub = onSnapshot(ref, (snap) => {
      const rows: Clinic[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setClinics(rows.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  function resetForm() {
    setId("");
    setName("");
    setAddress("");
    setUrl("");
    setPhone("");
    setServicesInput("");
    setLat("0");
    setLng("0");
    setSummary("");
    setVerified(false);
    setLanguagesInput("");
    setEligibilityInput("");
    setPhotoUrl("");
    setHours({ Mon: "", Tue: "", Wed: "", Thu: "", Fri: "", Sat: "", Sun: "" });
    setEditingId(null);
  }

  function loadForEdit(c: Clinic) {
    setEditingId(c.id);
    setId(c.id);
    setName(c.name || "");
    setAddress(c.address || "");
    setUrl(c.url || "");
    setPhone(c.phone || "");
    setServicesInput((c.services || []).join(", "));
    setLat(String(c.coords?.[0] ?? 0));
    setLng(String(c.coords?.[1] ?? 0));
    setSummary(c.summary || "");
    setVerified(!!c.verified);
    setLanguagesInput((c.languages || []).join(", "));
    setEligibilityInput((c.eligibility || []).join(", "));
    setPhotoUrl(c.photoUrl || "");
    setHours({
      Mon: c.hours?.Mon || "",
      Tue: c.hours?.Tue || "",
      Wed: c.hours?.Wed || "",
      Thu: c.hours?.Thu || "",
      Fri: c.hours?.Fri || "",
      Sat: c.hours?.Sat || "",
      Sun: c.hours?.Sun || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function geocodeAddress() {
    const q = address.trim();
    if (!q) return alert("Enter an address first");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
        { headers: { "User-Agent": "clinic-finder/1.0" } }
      );
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) return alert("Address not found.");
      setLat(String(parseFloat(data[0].lat)));
      setLng(String(parseFloat(data[0].lon)));
    } catch {
      alert("Geocoding failed.");
    }
  }

  async function autofillFromWebsite() {
    const link = url.trim();
    if (!link) return alert("Enter a website URL first");
    setBusy(true);
    try {
      const res = await fetch(`/api/ingest?url=${encodeURIComponent(link)}`);
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || "Ingest failed");
      const d = json.data as any;

      // OVERWRITE EVERY FIELD
      setName(d.name || "");
      setAddress(d.address || "");
      setUrl(d.website || link);
      setPhone(d.phone || "");
      setServicesInput(Array.isArray(d.services) ? d.services.join(", ") : "");
      setLanguagesInput(Array.isArray(d.languages) ? d.languages.join(", ") : "");
      setEligibilityInput(Array.isArray(d.eligibility) ? d.eligibility.join(", ") : "");
      setSummary(d.summary || "");
      setHours({
        Mon: d?.hours?.Mon || "",
        Tue: d?.hours?.Tue || "",
        Wed: d?.hours?.Wed || "",
        Thu: d?.hours?.Thu || "",
        Fri: d?.hours?.Fri || "",
        Sat: d?.hours?.Sat || "",
        Sun: d?.hours?.Sun || "",
      });
      if (Array.isArray(d.coords) && d.coords.length === 2) {
        setLat(String(d.coords[0] ?? ""));
        setLng(String(d.coords[1] ?? ""));
      }
      alert("Auto-filled from website. Review and Save.");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Auto-fill failed.");
    } finally {
      setBusy(false);
    }
  }

  async function saveClinic(e: React.FormEvent) {
    e.preventDefault();
    const idVal = id.trim();
    if (!idVal) return alert("Document ID is required");
    if (!name.trim()) return alert("Name is required");
    if (!address.trim()) return alert("Address is required");

    const la = parseFloat(lat), lo = parseFloat(lng);
    if (!Number.isFinite(la) || !Number.isFinite(lo)) return alert("Lat/Lng must be numbers");

    const payload: Clinic = {
      id: idVal,
      slug: idVal,
      name: name.trim(),
      nameLower: name.trim().toLowerCase(),
      address: address.trim(),
      url: url.trim() || undefined,
      phone: phone.trim() || undefined,
      services: parseCSV(servicesInput),
      coords: [la, lo],
      summary: summary.trim() || undefined,
      verified,
      languages: parseCSV(languagesInput),
      eligibility: parseCSV(eligibilityInput),
      hours: {
        Mon: (hours?.Mon || "").trim(),
        Tue: (hours?.Tue || "").trim(),
        Wed: (hours?.Wed || "").trim(),
        Thu: (hours?.Thu || "").trim(),
        Fri: (hours?.Fri || "").trim(),
        Sat: (hours?.Sat || "").trim(),
        Sun: (hours?.Sun || "").trim(),
      },
      photoUrl: photoUrl.trim() || undefined,
    };

    await setDoc(doc(db, "clinics", idVal), payload, { merge: true });
    resetForm();
  }

  async function removeClinic(cid: string) {
    if (!confirm("Delete this clinic?")) return;
    await deleteDoc(doc(db, "clinics", cid));
    if (editingId === cid) resetForm();
  }

  const totalVerified = useMemo(() => clinics.filter((c) => c.verified).length, [clinics]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/finder" className="text-emerald-700 underline">&larr; Back to Finder</Link>
      <h1 className="text-2xl font-bold mt-3 mb-4">Admin Dashboard</h1>
      <div className="mb-4 text-sm opacity-80">Total clinics: {clinics.length} · Verified: {totalVerified}</div>

      {/* ——— NEVER DISABLE THIS FORM ——— */}
      <form onSubmit={saveClinic} className="rounded-lg border p-4 space-y-3 bg-white">
        <h2 className="font-semibold">Add / Edit Clinic</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Document ID (slug)" value={id} onChange={(e) => setId(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <input className="border rounded px-3 py-2 w-full" placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Website URL" value={url} onChange={(e) => setUrl(e.target.value)} />
          <button type="button" onClick={autofillFromWebsite} className="border rounded px-3 py-2 w-full md:w-auto">
            {busy ? "Auto-filling…" : "Auto-fill from website"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Photo URL (optional)" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
        </div>

        <input className="border rounded px-3 py-2 w-full" placeholder="Services (comma-separated)" value={servicesInput} onChange={(e) => setServicesInput(e.target.value)} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Languages (comma-separated)" value={languagesInput} onChange={(e) => setLanguagesInput(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Eligibility (comma-separated)" value={eligibilityInput} onChange={(e) => setEligibilityInput(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex gap-2">
            <input className="border rounded px-3 py-2 w-full" placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
            <input className="border rounded px-3 py-2 w-full" placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
          </div>
          <button type="button" onClick={geocodeAddress} className="border rounded px-3 py-2">Geocode address</button>
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={verified} onChange={() => setVerified(!verified)} /> Verified</label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {DAYS.map((d) => (
            <div key={d} className="flex flex-col">
              <label className="text-xs opacity-70 mb-1">{d}</label>
              <input className="border rounded px-2 py-1 text-sm" placeholder='e.g., 9–5 or "Closed"' value={hours[d] || ""} onChange={(e) => setHours({ ...hours, [d]: e.target.value })} />
            </div>
          ))}
        </div>

        <textarea className="border rounded px-3 py-2 w-full h-28" placeholder="Summary" value={summary} onChange={(e) => setSummary(e.target.value)} />

        <div className="flex gap-2">
          <button type="submit" className="px-3 py-2 rounded bg-emerald-600 text-white">Save Clinic</button>
          <button type="button" onClick={() => setSummary(buildSummary({ servicesInput, languagesInput, eligibilityInput }))} className="px-3 py-2 border rounded">Generate Summary</button>
          <button type="button" onClick={resetForm} className="px-3 py-2 border rounded">Cancel</button>
        </div>
      </form>

      <div className="mt-6 rounded-lg border overflow-x-auto bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Address</th>
              <th className="text-left px-3 py-2">Services</th>
              <th className="text-left px-3 py-2">Verified</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-3 py-2" colSpan={5}>Loading…</td></tr>}
            {!loading && clinics.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2">{c.address}</td>
                <td className="px-3 py-2">{(c.services || []).join(", ")}</td>
                <td className="px-3 py-2">{c.verified ? "✅" : ""}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded" onClick={() => loadForEdit(c)}>Edit</button>
                    {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="px-2 py-1 border rounded">Website</a>}
                    <Link href={`/finder/${encodeURIComponent(c.slug ?? c.id)}`} className="px-2 py-1 border rounded">View</Link>
                    <button className="px-2 py-1 border rounded text-red-700" onClick={() => removeClinic(c.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && clinics.length === 0 && <tr><td className="px-3 py-2" colSpan={5}>No clinics yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function buildSummary(args: { servicesInput: string; languagesInput: string; eligibilityInput: string; }) {
  const parts: string[] = [];
  const svcs = parseCSV(args.servicesInput);
  const langs = parseCSV(args.languagesInput);
  const elig = parseCSV(args.eligibilityInput);
  if (svcs.length) parts.push(`Services: ${svcs.join(", ")}.`);
  if (langs.length) parts.push(`Languages: ${langs.join(", ")}.`);
  if (elig.length) parts.push(`Eligibility: ${elig.join(", ")}.`);
  parts.push("Call ahead to confirm hours and bring ID/insurance if available.");
  return parts.join(" ");
}
