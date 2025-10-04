import Link from "next/link";
import {
  FaIdCard,
  FaNotesMedical,
  FaRegFileAlt,
  FaMoneyCheckAlt,
  FaHome,
  FaRegAddressCard,
  FaListAlt,
} from "react-icons/fa";

const prepSections = [
  {
    icon: FaIdCard,
    title: "Identification",
    body: "Bring a photo ID if you have one. Clinics accept state IDs, passports, school IDs, or work badges—anything that confirms who you are.",
  },
  {
    icon: FaNotesMedical,
    title: "Medication list",
    body: "Write down every medication and supplement you take, plus dosage and timing. Snap a photo of the bottles if that’s easier.",
  },
  {
    icon: FaRegFileAlt,
    title: "Medical history",
    body: "Any lab work, referral notes, imaging, or discharge instructions help providers understand your story faster.",
  },
  {
    icon: FaMoneyCheckAlt,
    title: "Proof of income",
    body: "Sliding-scale clinics may ask for a recent pay stub, W-2, or letter from an employer. Some will accept a self-written note.",
  },
  {
    icon: FaHome,
    title: "Proof of residence",
    body: "A lease, utility bill, or shelter letter with your name and current address keeps enrollment smooth.",
  },
  {
    icon: FaRegAddressCard,
    title: "Insurance card",
    body: "If you have insurance, bring the card. If not, note your last coverage so navigators can discuss options.",
  },
  {
    icon: FaListAlt,
    title: "Question list",
    body: "Arrive with the concerns you want to address. It keeps the visit focused, especially if nerves kick in.",
  },
];

const reminders = [
  "Confirm hours the morning of your visit—many clinics adjust schedules weekly.",
  "Pack a snack and water bottle, especially if you manage blood sugar or blood pressure.",
  "If transportation is a barrier, call to ask about bus vouchers or ride support before your visit.",
  "Need child care while you are in the appointment? Some clinics can help arrange it if you call ahead.",
];

export default function PreparePage() {
  return (
    <main className="relative min-h-screen px-4 pb-24 pt-24 text-white">
      <section className="mx-auto flex max-w-5xl flex-col gap-8 text-center">
        <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
          Visit preparation
        </div>
        <h1 className="text-4xl font-semibold leading-tight">
          Show up confident. Leave with answers.
        </h1>
        <p className="mx-auto max-w-2xl text-base text-white/75">
          Use this guide to feel ready for any free or low-cost clinic appointment. Preparing a few essentials protects your time and makes it easier for staff to care for you.
        </p>
        <div className="mx-auto flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/finder"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:from-emerald-200 hover:to-cyan-200"
          >
            Find your clinic
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/what-to-bring"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Checklist: what to bring
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {prepSections.map(({ icon: Icon, title, body }) => (
            <div key={title} className="app-surface flex h-full flex-col gap-4 p-6 text-slate-900">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-200 to-cyan-200 text-slate-900 shadow-lg shadow-cyan-500/20">
                <Icon className="text-xl" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-700">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl">
        <div className="app-surface flex flex-col gap-6 p-8 text-slate-900">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Day-of reminders</h2>
            <p className="mt-2 text-sm text-slate-600">
              A little planning goes a long way. Share these with anyone joining you so you all feel at ease.
            </p>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            {reminders.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-700">
            Unsure about documentation? Call the clinic a day ahead or contact our navigators at <span className="font-semibold">hello@bibifoundation.org</span>. We will confirm what they need.
          </div>
        </div>
      </section>
    </main>
  );
}
