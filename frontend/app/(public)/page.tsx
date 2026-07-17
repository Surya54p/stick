import Hero from "@/components/Hero";
import About from "@/components/About";
import { 
  Users, 
  Bolt, 
  Zap, 
  HelpCircle,
  Check
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: <Users className="h-5 w-5 text-accent-orange" />,
      title: "Kolaborasi Tim Cepat",
      description: "Undang agen support Anda ke dalam workspace dalam hitungan klik. Delegasikan tiket secara otomatis berdasarkan prioritas."
    },
    {
      icon: <Bolt className="h-5 w-5 text-accent-orange" />,
      title: "Alur Kerja Presisi",
      description: "Ubah status tiket dari Open, In Progress, hingga Resolved secara instan. Filter dan cari tiket dalam sekejap mata."
    },
    {
      icon: <Zap className="h-5 w-5 text-accent-orange" />,
      title: "Desain Berkinerja Tinggi",
      description: "Kode frontend dioptimalkan sepenuhnya untuk meminimalkan latensi. Transisi antarmuka super mulus dan hemat kuota."
    }
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "0",
      description: "Untuk tim kecil atau pengujian awal.",
      features: [
        "1 Workspace Aktif",
        "Maksimal 3 Agen Support",
        "Tiket Tanpa Batas",
        "Riwayat Percakapan Komentar",
        "Akses API Standar"
      ],
      cta: "Mulai Gratis",
      popular: false
    },
    {
      name: "Pro",
      price: "299K",
      description: "Untuk tim support profesional berskala besar.",
      features: [
        "Workspace Tanpa Batas",
        "Agen Support Tanpa Batas",
        "Tiket Tanpa Batas",
        "Riwayat Percakapan Komentar",
        "Prioritas Support Pelanggan",
        "Analitik Dasbor & Laporan SLA",
        "Custom Domain Workspace (Segera Hadir)"
      ],
      cta: "Mulai Uji Coba Pro",
      popular: true
    }
  ];

  return (
    <div className="flex flex-col w-full bg-primary-base">
      
      {/* 1. Hero Section (Includes Live Ticket Mockup) */}
      <Hero />

      {/* 2. Feature Brief Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="flex flex-col gap-3 mb-16 items-center">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-orange">Fitur Unggulan</span>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 font-sans">
            Semua yang Anda Butuhkan untuk Sistem Dukungan
          </h2>
          <p className="text-sm text-secondary-text max-w-xl">
            Kami memangkas fitur-fitur kompleks yang tidak terpakai demi menghasilkan aplikasi ticketing yang paling cepat dan mudah dioperasikan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div key={idx} className="p-6 bg-secondary-panel rounded-lg border border-secondary-border flex flex-col items-center text-center gap-4">
              <div className="p-3 bg-primary-base rounded-full border border-secondary-border text-accent-orange">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-zinc-100">{feat.title}</h3>
              <p className="text-xs text-secondary-text leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. About Applications Section */}
      <About />

      {/* 4. Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        <div className="flex flex-col gap-3 mb-16 items-center">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-orange">Harga Transparan</span>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 font-sans">
            Mulai Sederhana, Bayar Sesuai Pertumbuhan
          </h2>
          <p className="text-sm text-secondary-text max-w-xl">
            Tanpa biaya tersembunyi. Skala workspace Anda sesuai dengan pertambahan agen pendukung.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingTiers.map((tier, idx) => (
            <div 
              key={idx} 
              className={`p-8 bg-secondary-panel rounded-lg border flex flex-col justify-between text-left relative transition-all duration-200 hover:border-zinc-700 ${tier.popular ? "border-accent-orange shadow-lg shadow-accent-orange/5" : "border-secondary-border"}`}
            >
              {tier.popular && (
                <span className="absolute top-0 right-8 -translate-y-1/2 bg-accent-orange text-primary-base text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full font-mono">
                  Terpopuler
                </span>
              )}
              
              <div>
                <h3 className="text-lg font-bold text-zinc-100">{tier.name}</h3>
                <p className="text-xs text-secondary-text mt-1">{tier.description}</p>
                
                <div className="flex items-baseline gap-1 mt-6 mb-6">
                  <span className="text-xs text-secondary-text font-medium">Rp</span>
                  <span className="text-4xl font-extrabold text-zinc-100 font-mono">{tier.price}</span>
                  {tier.price !== "0" && <span className="text-xs text-secondary-text font-medium">/bulan</span>}
                </div>

                <div className="border-t border-secondary-border/50 pt-6">
                  <ul className="flex flex-col gap-3.5 text-xs text-zinc-300">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-accent-orange shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/auth/register"
                  className={`w-full inline-flex items-center justify-center py-2.5 text-sm font-semibold rounded transition-all duration-200 active:scale-[0.98] ${tier.popular ? "bg-accent-orange hover:bg-accent-orange-hover text-primary-base font-bold shadow-lg shadow-accent-orange/10" : "bg-primary-base hover:bg-zinc-950 text-zinc-300 border border-secondary-border"}`}
                >
                  {tier.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full border-t border-secondary-border">
        <div className="flex flex-col gap-3 mb-12 text-center">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-orange">Pertanyaan Umum</span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 font-sans">
            Ada Pertanyaan? Kami Punya Jawaban.
          </h2>
        </div>

        <div className="space-y-6">
          <div className="p-5 bg-secondary-panel rounded-lg border border-secondary-border text-left">
            <h4 className="text-sm font-bold text-zinc-100 flex items-start gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-accent-orange shrink-0 mt-0.5" />
              Bagaimana cara kerja multi-tenancy workspace di stick?
            </h4>
            <p className="text-xs text-secondary-text mt-2.5 leading-relaxed pl-6.5">
              Setiap kali Anda membuat akun, Anda dapat membuat workspace baru. Setiap workspace memiliki database dan tabel relasional terpisah di PostgreSQL (melalui skema atau identifier aman) sehingga data tiket antar perusahaan tidak akan pernah saling bercampur atau bocor.
            </p>
          </div>

          <div className="p-5 bg-secondary-panel rounded-lg border border-secondary-border text-left">
            <h4 className="text-sm font-bold text-zinc-100 flex items-start gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-accent-orange shrink-0 mt-0.5" />
              Apakah saya bisa menggunakan domain sendiri untuk workspace saya?
            </h4>
            <p className="text-xs text-secondary-text mt-2.5 leading-relaxed pl-6.5">
              Fitur kustomisasi domain (Custom Domain) sedang dalam tahap pengembangan di versi Pro kami. Ke depannya, Anda dapat mengarahkan domain perusahaan Anda (misal `support.perusahaananda.com`) langsung ke sistem ticketing stick.
            </p>
          </div>

          <div className="p-5 bg-secondary-panel rounded-lg border border-secondary-border text-left">
            <h4 className="text-sm font-bold text-zinc-100 flex items-start gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-accent-orange shrink-0 mt-0.5" />
              Mengapa menggunakan FastAPI untuk backend?
            </h4>
            <p className="text-xs text-secondary-text mt-2.5 leading-relaxed pl-6.5">
              FastAPI adalah salah satu kerangka kerja Python tercepat saat ini. Karena bersifat asinkronus (*async/await*), FastAPI mampu menangani ribuan permintaan tiket secara simultan dengan memori yang sangat hemat, menjadikannya backend ideal untuk aplikasi web SaaS.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Bottom CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center bg-[radial-gradient(circle_at_bottom,rgba(255,107,0,0.05),transparent_40%)] border-t border-secondary-border relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 relative z-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-100 font-sans">
            Tingkatkan Kualitas Layanan Support Anda Hari Ini
          </h2>
          <p className="text-sm text-secondary-text max-w-xl leading-relaxed">
            Daftarkan tim Anda sekarang juga. Setup instan kurang dari 3 detik dan rasakan kenyamanan sistem ticketing yang sederhana dan tajam.
          </p>
          <div className="mt-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold text-primary-base bg-accent-orange hover:bg-accent-orange-hover rounded-md transition-all duration-200 shadow-xl shadow-accent-orange/10 hover:shadow-accent-orange/20 active:scale-[0.98]"
            >
              Mulai Uji Coba Gratis
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
