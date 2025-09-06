"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

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
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

function csvToArray(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function AdminPageInner() {
  // Table data
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  // Busy flags
  const [busyAutofill, setBusyAutofill] = useState(false);
  const [busySave, setBusySave] = useState(false);

  // Form fields
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [url, setUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [servicesInput, setServicesInput] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");
  const [eligibilityInput, setEligibilityInput] = useState("");
  const [lat, setLat] = useState("0");
  const [lng, setLng] = useState("0");
  const [verified, setVerified] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [hours, setHours] = useState<Record<string, string>>({
    Mon: "",
    Tue: "",
    Wed: "",
    Thu: "",
    Fri: "",
    Sat: "",
    Sun: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Load clinics live ---
  useEffect(() => {
    const ref = collection(db, "clinics"); // lowercase 'clinics'
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const rows: Clinic[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setClinics(rows.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        alert(`Firestore error: ${err.message}`);
      }
    );
    return () => unsub();
  }, []);

  // --- Helpers ---
  function resetForm() {
    setEditingId(null);
    setId("");
    setName("");
    setAddress("");
    setUrl("");
    setPhone("");
    setServicesInput("");
    setLanguagesInput("");
    setEligibilityInput("");
    setLat("0");
    setLng("0");
    setVerified(false);
    setPhotoUrl("");
    setSummary("");
    setHours({ Mon: "", Tue: "", Wed: "", Thu: "", Fri: "", Sat: "", Sun: "" });
  }

  function loadForEdit(c: Clinic) {
    setEditingId(c.id);
    setId(c.id);
    setName(c.name || "");
    setAddress(c.address || "");
    setUrl(c.url || "");
    setPhone(c.phone || "");
    setServicesInput((c.services || []).join(", "));
    setLanguagesInput((c.languages || []).join(", "));
    setEligibilityInput((c.eligibility || []).join(", "));
    setLat(String(c.coords?.[0] ?? "0"));
    setLng(String(c.coords?.[1] ?? "0"));
    setVerified(!!c.verified);
    setPhotoUrl(c.photoUrl || "");
    setSummary(c.summary || "");
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
    if (!q) {
      alert("Enter an address first");
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&limit=1`,
        { headers: { "User-Agent": "clinic-finder/1.0" } }
      );
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) {
        alert("Address not found.");
        return;
      }
      setLat(String(parseFloat(data[0].lat)));
      setLng(String(parseFloat(data[0].lon)));
    } catch (e: any) {
      alert(`Geocoding failed: ${e?.message || e}`);
    }
  }

  async function autofillFromWebsite() {
    const link = url.trim();
    if (!link) {
      alert("Enter a website URL first");
      return;
    }
    setBusyAutofill(true);
    try {
      const res = await fetch(`/api/ingest?url=${encodeURIComponent(link)}`);
      const json = await res.json();
      if (!json?.ok) throw new Error(json?.error || "Ingest failed");

      const d = json.data as any;

      // Overwrite every field we can
      setName(d.name || "");
      setAddress(d.address || "");
      setUrl(d.website || link);
      setPhone(d.phone || "");
      setServicesInput(Array.isArray(d.services) ? d.services.join(", ") : "");
      setLanguagesInput(
        Array.isArray(d.languages) ? d.languages.join(", ") : ""
      );
      setEligibilityInput(
        Array.isArray(d.eligibility) ? d.eligibility.join(", ") : ""
      );
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
      setBusyAutofill(false);
    }
  }

  async function saveClinic(e: React.FormEvent) {
    e.preventDefault();
    if (busySave) return;
    try {
      const cleanId = id.trim();
      if (!cleanId) throw new Error("Document ID (slug) is required");
      if (!name.trim()) throw new Error("Name is required");
      if (!address.trim()) throw new Error("Address is required");

      const la = parseFloat(lat);
      const lo = parseFloat(lng);
      if (!Number.isFinite(la) || !Number.isFinite(lo)) {
        throw new Error("Latitude and Longitude must be valid numbers");
      }

      const payload: Clinic = {
        id: cleanId,
        slug: cleanId,
        name: name.trim(),
        nameLower: name.trim().toLowerCase(),
        address: address.trim(),
        url: url.trim() || undefined,
        phone: phone.trim() || undefined,
        services: csvToArray(servicesInput),
        coords: [la, lo],
        summary: summary.trim() || undefined,
        verified,
        languages: csvToArray(languagesInput),
        eligibility: csvToArray(eligibilityInput),
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

      setBusySave(true);
      await setDoc(doc(db, "clinics", cleanId), payload, { merge: true });
      alert("Saved!");
      resetForm();
    } catch (err: any) {
      console.error(err);
      alert(err?.message || String(err));
    } finally {
      setBusySave(false);
    }
  }

  async function removeClinic(cid: string) {
    if (!confirm("Delete this clinic?")) return;
    try {
      await deleteDoc(doc(db, "clinics", cid));
      if (editingId === cid) resetForm();
    } catch (e: any) {
      alert(e?.message || "Delete failed.");
    }
  }

  const verifiedCount = useMemo(
    () => clinics.filter((c) => c.verified).length,
    [clinics]
  );

  return (
    <div className="admin-scope max-w-4xl mx-auto px-4 py-6 text-black">
      <Link href="/finder" className="text-emerald-700 underline">
        &larr; Back to Finder
      </Link>

      <h1 className="text-2xl font-bold mt-3 mb-4">Admin Dashboard</h1>
      <div className="mb-4 text-sm opacity-80">
        Total clinics: {clinics.length} · Verified: {verifiedCount}
      </div>

      {/* FORM */}
      <form
        onSubmit={saveClinic}
        className="rounded-lg border p-4 space-y-3 bg-white text-black"
      >
        <h2 className="font-semibold">Add / Edit Clinic</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border rounded px-3 py-2 bg-white text-black placeholder:text-gray-500"
            placeholder="Document ID (used as slug)"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 bg-white text-black placeholder:text-gray-500"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <input
          className="border rounded px-3 py-2 w-full bg-white text-black placeholder:text-gray-500"
          placeholder="Street address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border rounded px-3 py-2 bg-white text-black placeholder:text-gray-500"
            placeholder="Website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            type="button"
            onClick={autofillFromWebsite}
            className="border rounded px-3 py-2 bg-white text-black"
          >
            {busyAutofill ? "Auto-filling…" : "Auto-fill from website"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border rounded px-3 py-2 bg-white text-black placeholder:text-gray-500"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 bg-white text-black placeholder:text-gray-500"
            placeholder="Photo URL (optional)"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
        </div>

        <input
          className="border rounded px-3 py-2 w-full bg-white text-black placeholder:text-gray-500"
          placeholder="Services (comma-separated)"
          value={servicesInput}
          onChange={(e) => setServicesInput(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border rounded px-3 py-2 bg-white text-black placeholder:text-gray-500"
            placeholder="Languages (comma-separated)"
            value={languagesInput}
            onChange={(e) => setLanguagesInput(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 bg-white text-black placeholder:text-gray-500"
            placeholder="Eligibility (comma-separated)"
            value={eligibilityInput}
            onChange={(e) => setEligibilityInput(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex gap-2">
            <input
              className="border rounded px-3 py-2 bg-white text-black placeholder:text-gray-500"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
            <input
              className="border rounded px-3 py-2 bg-white text-black placeholder:text-gray-500"
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={geocodeAddress}
            className="border rounded px-3 py-2 bg-white text-black"
          >
            Geocode address
          </button>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={verified}
              onChange={() => setVerified((v) => !v)}
            />
            Verified
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {DAYS.map((d) => (
            <div key={d} className="flex flex-col">
              <label className="text-xs opacity-70 mb-1">{d}</label>
              <input
                className="border rounded px-2 py-1 text-sm bg-white text-black placeholder:text-gray-500"
                placeholder='e.g., 9–5 or "Closed"'
                value={hours[d] || ""}
                onChange={(e) =>
                  setHours({
                    ...hours,
                    [d]: e.target.value,
                  })
                }
              />
            </div>
          ))}
        </div>

        <textarea
          className="border rounded px-3 py-2 w-full h-28 bg-white text-black placeholder:text-gray-500"
          placeholder="Summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busySave}
            className="px-3 py-2 rounded bg-emerald-600 text-white disabled:opacity-60"
          >
            {busySave ? "Saving…" : "Save Clinic"}
          </button>
          <button
            type="button"
            onClick={() =>
              setSummary(buildSummary({ servicesInput, languagesInput, eligibilityInput }))
            }
            className="px-3 py-2 border rounded bg-white text-black"
          >
            Generate Summary
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-3 py-2 border rounded bg-white text-black"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* TABLE */}
      <div className="mt-6 rounded-lg border overflow-x-auto bg-white text-black">
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
            {loading && (
              <tr>
                <td className="px-3 py-2" colSpan={5}>
                  Loading…
                </td>
              </tr>
            )}
            {!loading &&
              clinics.map((c, i) => (
                <tr key={c.id} className={i % 2 ? "bg-gray-50" : ""}>
                  <td className="px-3 py-2">{c.name}</td>
                  <td className="px-3 py-2">{c.address}</td>
                  <td className="px-3 py-2">
                    {(c.services || []).join(", ")}
                  </td>
                  <td className="px-3 py-2">{c.verified ? "✅" : ""}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="px-2 py-1 border rounded bg-white text-black"
                        onClick={() => loadForEdit(c)}
                      >
                        Edit
                      </button>
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 border rounded bg-white text-black"
                        >
                          Website
                        </a>
                      )}
                      <Link
                        href={`/finder/${encodeURIComponent(c.slug ?? c.id)}`}
                        className="px-2 py-1 border rounded bg-white text-black"
                      >
                        View
                      </Link>
                      <button
                        className="px-2 py-1 border rounded text-red-700 bg-white"
                        onClick={() => removeClinic(c.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && clinics.length === 0 && (
              <tr>
                <td className="px-3 py-2" colSpan={5}>
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

function buildSummary(args: {
  servicesInput: string;
  languagesInput: string;
  eligibilityInput: string;
}) {
  const parts: string[] = [];
  const svcs = csvToArray(args.servicesInput);
  const langs = csvToArray(args.languagesInput);
  const elig = csvToArray(args.eligibilityInput);
  if (svcs.length) parts.push(`Services: ${svcs.join(", ")}.`);
  if (langs.length) parts.push(`Languages: ${langs.join(", ")}.`);
  if (elig.length) parts.push(`Eligibility: ${elig.join(", ")}.`);
  parts.push(
    "Call ahead to confirm hours and bring ID/insurance if available."
  );
  return parts.join(" ");
}
