// src/lib/clinics.ts
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

export type Clinic = {
  id: string;
  name: string;
  address: string;
  url: string;
  services: string[];
  coords: [number, number];
  summary?: string;
  slug?: string;
};

export async function getClinicByIdOrSlug(idOrSlug: string): Promise<Clinic> {
  // 1) Try by document ID
  const byId = await getDoc(doc(db, "clinics", idOrSlug));
  if (byId.exists()) {
    return { ...(byId.data() as Omit<Clinic, 'id'>), id: byId.id } as Clinic;
  }

  // 2) Try by slug
  const q = query(
    collection(db, "clinics"),
    where("slug", "==", idOrSlug),
    limit(1)
  );
  const qs = await getDocs(q);
  if (!qs.empty) {
    const d = qs.docs[0];
    return { ...(d.data() as Omit<Clinic, 'id'>), id: d.id } as Clinic;
  }

  throw new Error("Clinic not found");
}
