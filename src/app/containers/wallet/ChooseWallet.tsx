"use client";

import { useMqtt } from "@/context/MqttContext";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react"; // Ikon untuk mempercantik

// Tipe data untuk setiap kartu E-Wallet
type EWalletOption = {
  displayName: string; // Nama yang ditampilkan di UI, cth: "RiNG Aja"
  value: string; // Nilai yang dikirim ke server, cth: "ringaja"
  logoColor: string; // Warna khas untuk logo
  gradient: string; // Gradient untuk background hover
};

// Daftar E-Wallet dengan data yang terpisah
const eWalletOptions: EWalletOption[] = [
  {
    displayName: "DoPay",
    value: "dopay",
    logoColor: "text-blue-500",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    displayName: "OWO",
    value: "owo",
    logoColor: "text-purple-500",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    displayName: "RiNG Aja",
    value: "ringaja", // Data yang benar untuk server
    logoColor: "text-red-500",
    gradient: "from-red-500 to-red-600",
  },
];

// Komponen untuk satu kartu E-Wallet
const WalletCard = ({
  wallet,
  onSelect,
}: {
  wallet: EWalletOption;
  onSelect: (value: string) => void;
}) => {
  return (
    <motion.div
      onClick={() => onSelect(wallet.value)}
      className="group relative w-full sm:w-60 h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg"
      whileHover={{ y: -10, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Background Gradient saat Hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${wallet.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Konten Kartu */}
      <div className="relative w-full h-full bg-white group-hover:bg-transparent transition-colors duration-300 flex flex-col justify-between items-center text-center p-8">
        <div className="flex flex-col items-center">
          <div
            className={`p-4 bg-gray-100 rounded-full mb-4 group-hover:bg-white/20 transition-colors`}
          >
            <Wallet
              className={`w-10 h-10 ${wallet.logoColor} group-hover:text-white transition-colors`}
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 group-hover:text-white transition-colors">
            {wallet.displayName}
          </h2>
          <p className="text-sm text-gray-500 group-hover:text-white/80 transition-colors">
            Digital Wallet
          </p>
        </div>

        <div className="text-xs text-gray-400 group-hover:text-white/70 transition-colors opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 -translate-y-4 duration-300">
          Pilih untuk melanjutkan
        </div>
      </div>
    </motion.div>
  );
};

export default function ChooseWallet() {
  const { selectWallet } = useMqtt();

  const handleSelect = (walletValue: string) => {
    // Fungsi ini sekarang menerima 'value' yang sudah bersih ('dopay', 'owo', 'ringaja')
    selectWallet(walletValue);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
          Pilih Dompet Digital Anda
        </h1>
        <p className="text-lg text-center text-slate-500 mt-3 w-full">
          Satu langkah lagi untuk mengakses semua layanan terintegrasi dari
          BankIT.
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col sm:flex-row gap-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {eWalletOptions.map((wallet) => (
          <WalletCard
            key={wallet.value}
            wallet={wallet}
            onSelect={handleSelect}
          />
        ))}
      </motion.div>
    </div>
  );
}
