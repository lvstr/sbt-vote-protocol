"use client";

import React from "react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Hubungkan Wallet",
      description: "Gunakan ekstensi browser Freighter untuk masuk ke jaringan Stellar Soroban.",
    },
    {
      num: "02",
      title: "Klaim Identitas SBT",
      description: "Klaim token identitas Soulbound (SBT) gratis dalam 1 klik untuk memverifikasi hak suara Anda.",
    },
    {
      num: "03",
      title: "Buat / Pilih Voting",
      description: "Luncurkan proposal Anda sendiri dengan opsi pilihan kustom atau pilih voting komunitas yang sedang berjalan.",
    },
    {
      num: "04",
      title: "Vote & Verifikasi",
      description: "Tanda tangani transaksi dengan Freighter. Suara Anda tercatat permanen di blockchain Stellar.",
    },
  ];

  return (
    <section className="py-16 border-b border-slate-800 bg-slate-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="badge badge-emerald">Alur Kerja</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cara Kerja Protokol
          </h2>
          <p className="text-sm text-slate-400">
            Hanya 4 langkah mudah untuk berpartisipasi dalam tata kelola terdesentralisasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {steps.map((step, idx) => (
            <div key={idx} className="app-card p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                {step.num}
              </div>
              <h3 className="text-base font-bold text-white">
                {step.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
