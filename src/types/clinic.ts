// src/types/clinic.ts
export type Coords = [number, number];

export interface ClinicDoc {
  /** Firestore document id you actually write to */
  id: string;              // also used as slug
  name: string;
  address: string;
  url: string;
  services: string[];
  coords: Coords;
  summary?: string;
  slug?: string;
  nameLower?: string;
}

/** Firestore snapshot shape when reading (doc id is separate) */
export interface ClinicRow extends ClinicDoc {
  /** The Firestore document id (may equal `id`, but can differ if created earlier) */
  docId: string;
}
