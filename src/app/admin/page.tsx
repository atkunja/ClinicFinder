"use client";

import AdminGate from "@/components/AdminGate";
import AdminPageInner from "./ui/AdminPageInner";


export default function AdminPage() {
  return (
    <AdminGate>
      <AdminPageInner />
    </AdminGate>
  );
}
