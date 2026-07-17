import { Shield, FastForward, CheckSquare, Layers } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: <Layers className="h-6 w-6 text-accent-orange" />,
      title: "Isolasi Workspace Instan (SaaS)",
      description: "Buat lingkungan support internal Anda secara instan. Tiap workspace memiliki akses database, anggota, dan log yang terpisah demi kepatuhan keamanan data tingkat tinggi."
    },
    {
      icon: <FastForward className="h-6 w-6 text-accent-orange" />,
      title: "FastAPI & Next.js Engine",
      description: "Dengan Next.js di sisi frontend dan FastAPI di backend, stick menghantarkan performa yang andal, pemuatan halaman instan, serta pemrosesan API berskala milidetik."
    },
    {
      icon: <Shield className="h-6 w-6 text-accent-orange" />,
      title: "Desain Kontras Tinggi 6:3:1",
      description: "Dirancang secara spesifik dengan 3 tingkat kontras warna demi kenyamanan mata agen customer service Anda. Kurangi kelelahan visual saat bekerja dengan antarmuka yang presisi."
    },
    {
      icon: <CheckSquare className="h-6 w-6 text-accent-orange" />,
      title: "Simpel dan Fokus",
      description: "Kami menghilangkan kompleksitas yang membingungkan. stick berfokus penuh pada penyelesaian masalah pelanggan secara langsung: buat tiket, delegasikan, komunikasikan, selesai."
    }
  ];

  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary-panel/20 border-t border-b border-secondary-border relative">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-3 max-w-xl text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-orange">Tentang stick.</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 font-sans">
              Membangun Sistem Layanan Pelanggan Tanpa Hambatan
            </h2>
          </div>
          <p className="text-sm sm:text-base text-secondary-text max-w-md text-left leading-relaxed">
            stick lahir dari rasa frustrasi terhadap perangkat lunak ticketing modern yang terlampau kompleks, mahal, dan lambat. Kami mendesain stick agar Anda dapat berfokus 100% pada apa yang paling penting: melayani pelanggan.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((item, index) => (
            <div 
              key={index}
              className="p-6 bg-secondary-panel rounded-lg border border-secondary-border hover:border-accent-orange/40 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 text-left"
            >
              <div className="p-2.5 w-fit rounded-md bg-primary-base border border-secondary-border">
                {item.icon}
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-bold text-zinc-100">{item.title}</h4>
                <p className="text-xs text-secondary-text leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-secondary-panel p-8 rounded-lg border border-secondary-border divide-y md:divide-y-0 md:divide-x divide-secondary-border">
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-3xl font-extrabold text-accent-orange font-mono">100ms</span>
            <span className="text-[10px] text-secondary-text mt-1 uppercase tracking-wider font-bold">Rerata Respon API</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-3xl font-extrabold text-zinc-100 font-mono">99.9%</span>
            <span className="text-[10px] text-secondary-text mt-1 uppercase tracking-wider font-bold">Jaminan Uptime</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-3xl font-extrabold text-zinc-100 font-mono">&lt; 3 Detik</span>
            <span className="text-[10px] text-secondary-text mt-1 uppercase tracking-wider font-bold">Waktu Setup SaaS</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4">
            <span className="text-3xl font-extrabold text-zinc-100 font-mono">100%</span>
            <span className="text-[10px] text-secondary-text mt-1 uppercase tracking-wider font-bold">Isolasi Database</span>
          </div>
        </div>

      </div>
    </section>
  );
}
