"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

/*
  SE Michigan city → county mapping.
  Add entries here as clinics expand to new cities.
*/
const CITY_COUNTY: Record<string, string> = {
  // Wayne County
  detroit: "Wayne", dearborn: "Wayne", "dearborn heights": "Wayne",
  livonia: "Wayne", westland: "Wayne", inkster: "Wayne",
  hamtramck: "Wayne", "highland park": "Wayne", romulus: "Wayne",
  taylor: "Wayne", "allen park": "Wayne", wayne: "Wayne",
  "garden city": "Wayne", "lincoln park": "Wayne", southgate: "Wayne",
  wyandotte: "Wayne", "river rouge": "Wayne", ecorse: "Wayne",
  melvindale: "Wayne", canton: "Wayne", plymouth: "Wayne",
  redford: "Wayne", woodhaven: "Wayne", brownstown: "Wayne",
  "flat rock": "Wayne", belleville: "Wayne", trenton: "Wayne",
  riverview: "Wayne", "grosse pointe": "Wayne",
  // Oakland County
  pontiac: "Oakland", troy: "Oakland", southfield: "Oakland",
  "farmington hills": "Oakland", farmington: "Oakland",
  "royal oak": "Oakland", "oak park": "Oakland", ferndale: "Oakland",
  berkley: "Oakland", birmingham: "Oakland", "bloomfield hills": "Oakland",
  "west bloomfield": "Oakland", novi: "Oakland",
  "rochester hills": "Oakland", rochester: "Oakland",
  clawson: "Oakland", "madison heights": "Oakland", "hazel park": "Oakland",
  // Macomb County
  warren: "Macomb", "sterling heights": "Macomb",
  "clinton township": "Macomb", roseville: "Macomb",
  eastpointe: "Macomb", "st. clair shores": "Macomb",
  "mount clemens": "Macomb", "mt. clemens": "Macomb",
  // Washtenaw County
  "ann arbor": "Washtenaw", ypsilanti: "Washtenaw",
  // Monroe County
  monroe: "Monroe",
  // Livingston County
  brighton: "Livingston", howell: "Livingston",
};

function extractCity(address: string): string {
  // "123 Main St, Detroit, MI 48201" → "detroit"
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 3) return parts[parts.length - 2].toLowerCase();
  if (parts.length === 2) return parts[0].toLowerCase();
  return "";
}

function countCounties(addresses: string[]): number {
  const counties = new Set<string>();
  for (const addr of addresses) {
    const city = extractCity(addr);
    if (!city) continue;
    const county = CITY_COUNTY[city];
    if (county) counties.add(county);
    // Skip cities not in the mapping rather than over-counting
  }
  return counties.size;
}

export default function LiveMetrics() {
  const [clinicCount, setClinicCount] = useState<number | null>(null);
  const [countyCount, setCountyCount] = useState<number | null>(null);

  useEffect(() => {
    const ref = collection(db, "clinics");
    const unsub = onSnapshot(ref, (snap) => {
      setClinicCount(snap.size);
      const addresses = snap.docs.map((d) => (d.data().address as string) || "");
      setCountyCount(countCounties(addresses));
    });
    return () => unsub();
  }, []);

  const metrics = [
    { label: "Mapped clinics", value: clinicCount ?? "—" },
    { label: "Counties served", value: countyCount ?? "—" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 shadow-inner shadow-white/5"
        >
          <div className="text-2xl font-semibold text-white">{metric.value}</div>
          <div className="text-xs uppercase tracking-wide text-white/60">
            {metric.label}
          </div>
        </div>
      ))}
    </div>
  );
}
