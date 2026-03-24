import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink px-6 lg:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
      <Link
        href="/"
        className="font-[family-name:var(--font-display)] text-lg text-white"
      >
        RankerIQ<span className="text-saffron">.</span>
      </Link>
      <ul className="flex gap-8 list-none">
        {["Privacy", "Terms", "Contact", "Blog"].map((link) => (
          <li key={link}>
            <a
              href="#"
              className="text-[13px] text-white/40 hover:text-white/70 transition-colors"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
      <div className="text-[12px] text-white/30">
        © 2025 RankerIQ Education Pvt. Ltd.
      </div>
    </footer>
  );
}
