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

export default function WhatToBringPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
        <h1 className="text-4xl font-extrabold text-emerald-700 mb-4 text-center">
          What to Bring to Your Appointment
        </h1>

        <p className="text-lg text-black mb-8 text-center">
          Be prepared! Most free or low‑cost clinics recommend you bring the following:
        </p>

        <ul className="space-y-5 mb-8">
          <li className="flex items-start gap-4">
            <FaIdCard className="mt-1 text-2xl text-emerald-500" />
            <span className="text-lg text-black">
              <b>Valid photo ID</b> (if available).
            </span>
          </li>

          <li className="flex items-start gap-4">
            <FaNotesMedical className="mt-1 text-2xl text-emerald-500" />
            <span className="text-lg text-black">
              <b>List of current medications</b>, including doses and how often you take them.
            </span>
          </li>

          <li className="flex items-start gap-4">
            <FaRegFileAlt className="mt-1 text-2xl text-emerald-500" />
            <span className="text-lg text-black">
              Any <b>medical history, referral notes, or test results</b> (if you have them).
            </span>
          </li>

          <li className="flex items-start gap-4">
            <FaMoneyCheckAlt className="mt-1 text-2xl text-emerald-500" />
            <span className="text-lg text-black">
              <b>Proof of income</b> — recent W‑2, recent pay stubs, or a signed letter from your employer.
            </span>
          </li>

          <li className="flex items-start gap-4">
            <FaHome className="mt-1 text-2xl text-emerald-500" />
            <span className="text-lg text-black">
              <b>Proof of residence</b> — a recent utility bill or a lease agreement with your name and address.
            </span>
          </li>

          <li className="flex items-start gap-4">
            <FaRegAddressCard className="mt-1 text-2xl text-emerald-500" />
            <span className="text-lg text-black">
              <b>Insurance card</b> (if you have one). Many clinics will see you without insurance, but bring it if available.
            </span>
          </li>

          <li className="flex items-start gap-4">
            <FaListAlt className="mt-1 text-2xl text-emerald-500" />
            <span className="text-lg text-black">
              A <b>written list of questions or concerns</b> you want to discuss with the provider.
            </span>
          </li>
        </ul>

        <div className="text-center mb-6">
          <span className="inline-block bg-emerald-100 text-emerald-700 text-base font-medium px-5 py-2 rounded-full">
            Not sure what documents your clinic needs? Call ahead to confirm.
          </span>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-emerald-700 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
