export type Coords = [number, number];

export type ClinicDoc = {
  id: string;
  name: string;
  address: string;
  url: string;
  services: string[];
  coords: Coords;
  summary?: string;
  summary_es?: string;
  slug?: string;
  nameLower?: string;
};

export type ClinicRow = ClinicDoc & {
  docId: string; // Firestore doc id
};
