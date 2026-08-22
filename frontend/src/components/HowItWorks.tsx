"use client";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Hubungkan Wallet",
      description: "Gunakan Freighter Wallet browser extension untuk masuk ke jaringan Stellar Soroban.",
    },
    {
      num: "02",
      title: "Klaim SBT Voter ID",
      description: "Klaim token identitas Soulbound gratis dalam 1 klik untuk memverifikasi hak suara Anda seumur hidup.",
    },
    {
      num: "03",
      title: "Buat / Pilih Voting",
      description: "Luncurkan voting Anda sendiri dengan opsi kustom atau pilih proposal komunitas yang sedang aktif.",
    },
    {
      num: "04",
      title: "Vote & Verifikasi",
      description: "Tanda tangani transaksi, suara Anda tercatat permanen di ledger Stellar dengan transparansi 100%.",
    },
  ];

  return (
    <section className="py-16 border-t border-slate-800/80 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-teal-400">
            Alur Kerja Sederhana
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Cara Kerja SBT Vote Protocol
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Mulai berpartisipasi dalam tata kelola terdesentralisasi hanya dalam 4 langkah mudah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="glass-card p-6 relative overflow-hidden flex flex-col justify-between"
            >
              {/* Step number watermark */}
              <div className="absolute -top-3 -right-2 text-6xl font-black text-slate-800/40 select-none pointer-events-none">
                {step.num}
              </div>

              <div className="space-y-3 relative z-10">
                <div className="w-9 h-9 rounded-lg bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-300">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
