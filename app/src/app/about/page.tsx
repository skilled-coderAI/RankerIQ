import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const TEAM = [
  {
    name: "Sai Prasad",
    role: "Founder & CEO",
    bio: "Visionary behind RankerIQ. Passionate about making quality education accessible to every Indian student through AI.",
    initials: "SP",
    gradient: "from-saffron to-saffron-light",
  },
  {
    name: "Ananya Sharma",
    role: "Lead Frontend Engineer",
    bio: "Crafts the delightful interfaces students love. React & Next.js specialist with a keen eye for accessible design.",
    initials: "AS",
    gradient: "from-forest-mid to-green-light",
  },
  {
    name: "Ravi Kumar",
    role: "Backend & AI Engineer",
    bio: "Architects the Rust backend and multi-agent AI pipeline. Makes sure RankerIQ thinks fast and teaches well.",
    initials: "RK",
    gradient: "from-blue-mid to-[#4a8fe7]",
  },
  {
    name: "Priya Nair",
    role: "Curriculum & Pedagogy Lead",
    bio: "Former CBSE teacher turned ed-tech researcher. Designs the Socratic teaching strategies powering every session.",
    initials: "PN",
    gradient: "from-amber to-saffron-light",
  },
  {
    name: "Deepak Verma",
    role: "Full-Stack Engineer",
    bio: "Bridges frontend and backend. Builds the real-time voice pipeline and session persistence layer.",
    initials: "DV",
    gradient: "from-forest to-forest-mid",
  },
  {
    name: "Meera Iyer",
    role: "Product Designer",
    bio: "Turns complex learning flows into intuitive experiences. Champions the saffron-ink-cream design system.",
    initials: "MI",
    gradient: "from-[#8e44ad] to-[#c39bd3]",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-ink min-h-screen pt-16">
        <section className="px-6 lg:px-16 py-20 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-[family-name:var(--font-display)] text-4xl lg:text-5xl font-bold text-white mb-4">
              Meet the team behind{" "}
              <span className="text-saffron">RankerIQ</span>
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
              We&apos;re a small, passionate team of engineers, educators, and designers
              building India&apos;s most personal AI tutor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/10 group-hover:ring-white/20 transition-all`}
                  >
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-[15px]">
                      {member.name}
                    </h3>
                    <p className="text-saffron-light text-[12px] font-medium">
                      {member.role}
                    </p>
                  </div>
                </div>
                <p className="text-white/50 text-[13px] leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 lg:px-16 pb-20 max-w-4xl mx-auto">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="font-[family-name:var(--font-display)] text-2xl lg:text-3xl font-bold text-white mb-4">
              Our Mission
            </h2>
            <p className="text-white/50 text-[15px] leading-relaxed max-w-2xl mx-auto mb-6">
              Every child in India deserves a patient, knowledgeable tutor who speaks their language
              and adapts to their pace. RankerIQ combines voice-first AI with proven Socratic
              teaching methods to make that a reality — from Grade 5 to Grade 12, in Hindi, English,
              and Hinglish.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-saffron text-white px-6 py-2.5 rounded-lg font-medium text-[14px] hover:bg-saffron-light transition-colors"
            >
              Join us — try RankerIQ free →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
