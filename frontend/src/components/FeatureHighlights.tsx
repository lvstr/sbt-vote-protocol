"use client";

export function FeatureHighlights() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      badge: "Integritas Suara",
      title: "Soulbound Token (SBT) Voter ID",
      description:
        "Identitas pemilih terikat permanen pada wallet Stellar Anda (non-transferable). Mencegah manipulasi bot, akun ganda (Sybil attacks), dan jual-beli suara.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      badge: "Permissionless",
      title: "Siapa Saja Bisa Bikin Voting",
      description:
        "Platform terbuka tanpa gatekeeping. Siapa pun dapat membuat voting publik, proposal DAO, jajak pendapat komunitas, atau pemilihan dengan opsi kustom.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
      badge: "Soroban Engine",
      title: "Cepat, Murah, & Terdesentralisasi",
      description:
        "Didukung mesin smart contract Rust Soroban di Stellar Network. Eksekusi voting dalam hitungan detik dengan biaya gas hanya sebagian kecil dari 1 sen.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      badge: "Transparansi Penuh",
      title: "Verifikasi & Audit Real-Time",
      description:
        "Setiap suara dan perubahan status terbit sebagai event kriptografis on-chain. Siapa pun dapat memverifikasi keaslian hasil tanpa perantara pihak ketiga.",
    },
  ];

  return (
    <section className="py-16 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-brand-400">
            Keunggulan Protokol
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Standar Baru Voting On-Chain di Stellar
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Menggabungkan kemudahan pembuatan proposal bebas dengan keamanan kriptografi Soulbound Token untuk ekosistem tata kelola yang adil.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="glass-card glass-card-hover p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-inner">
                  {item.icon}
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider">
                    {item.badge}
                  </span>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
