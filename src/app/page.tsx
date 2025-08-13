import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-emerald-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <Image
            src="/logo.png"
            width={56}
            height={56}
            alt="Healthcare for All"
            className="mx-auto mb-6"
            priority
          />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Healthcare is a Right, Not a Privilege
          </h1>
          <p className="max-w-2xl mx-auto opacity-90 mb-6">
            Connecting uninsured and underinsured individuals with accessible,
            compassionate, and free healthcare clinics in their communities.
          </p>
          <Link
            href="/finder"
            className="inline-block bg-white text-emerald-700 font-bold px-6 py-3 rounded shadow hover:bg-gray-100"
          >
            Find a Clinic
          </Link>
        </div>
      </section>

      {/* How we help */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-black">
            How We Can Help You
          </h2>

          <div className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl">
            {/* Clinic Finder */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col">
              <h3 className="text-lg font-bold text-black mb-2">Clinic Finder</h3>
              <p className="text-black/80 mb-4">
                Search for nearby free or low‑cost clinics based on your location
                and type of care needed.
              </p>
              <div className="mt-auto">
                <Link
                  href="/finder"
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  Search Now →
                </Link>
              </div>
            </div>

            {/* What to Bring */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col">
              <h3 className="text-lg font-bold text-black mb-2">What to Bring</h3>
              <p className="text-black/80 mb-4">
                Be prepared with a checklist of items and documents most clinics
                require.
              </p>
              <div className="mt-auto">
                <Link
                  href="/prepare"
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  View Checklist →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-black">Our Mission</h2>
          <p className="text-lg leading-relaxed text-black">
            We believe everyone deserves the dignity of quality care — regardless
            of income, status, or background. This platform helps individuals
            discover nearby medical, dental, and pediatric clinics, learn what to
            bring to their appointments, and take that first step toward better
            health. We are here to guide, support, and empower those who need
            care the most.
          </p>
        </div>
      </section>
    </div>
  );
}
