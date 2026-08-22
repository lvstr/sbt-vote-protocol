"use client";

import React from "react";

export const FeatureHighlights: React.FC = () => {
  const features = [
    {
      badge: "Integritas Suara",
      title: "Soulbound Token (SBT)",
      description:
        "Identitas pemilih terikat permanen pada wallet Stellar Anda (non-transferable). Mencegah bot, multi-account, dan vote-buying.",
    },
    {
      badge: "Bebas Gatekeeping",
      title: "Permissionless Creation",
      description:
        "Siapa pun dapat membuat voting publik, proposal tata kelola, atau survei komunitas dengan opsi dan durasi kustom.",
    },
    {
      badge: "Soroban Smart Contract",
      title: "Cepat & Biaya Nyaris Nol",
      description:
        "Eksekusi kontrak pintar Rust di Stellar dengan finalitas sub-detik dan biaya transaksi sangat murah.",
    },
    {
      badge: "Transparan",
      title: "Audit Kriptografis On-Chain",
      description:
        "Setiap suara dan pendaftaran identitas tercatat langsung di ledger Stellar dan dapat diverifikasi siapa saja secara terbuka.",
    },
  ];

  return (
    <section className="py-16 border-b border-slate-800 bg-[#0B0F17]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="badge badge-blue">Arsitektur Protokol</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Keunggulan SBT Vote Protocol
          </h2>
          <p className="text-sm text-slate-400">
            Menggabungkan kebebasan membuat proposal dengan kepastian 1-person-1-vote berbasis Soulbound Token.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((item, idx) => (
            <div key={idx} className="app-card app-card-hover p-5 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
                  {item.badge}
                </span>
                <h3 className="text-base font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
