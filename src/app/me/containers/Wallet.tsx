"use client";

import { useMqtt } from "@/context/MqttContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  User,
  Mail,
  Wifi,
  WifiOff,
} from "lucide-react";

// --- Komponen-komponen UI yang Diperbarui ---

// 1. Kartu Info dengan Font Adaptif
const InfoCard = ({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
}) => (
  <motion.div
    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200/80 flex items-center gap-4"
    variants={{
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 },
    }}
  >
    <div className="bg-blue-50 p-3.5 rounded-full flex-shrink-0">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <div className="overflow-hidden">
      <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
      {/* Menggunakan 'break-words' dan ukuran font yang bisa mengecil (lg:text-2xl) */}
      <p className="mt-1 text-xl lg:text-2xl font-semibold text-gray-800 tracking-tight break-words">
        {value}
      </p>
    </div>
  </motion.div>
);

// 2. Loading Skeleton yang tidak berubah
const DashboardSkeleton = () => (
  <div className="flex h-full items-center justify-center">
    <div className="flex items-center gap-2 text-gray-500">
      <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-blue-500"></div>
      <p>Memuat data ringkasan...</p>
    </div>
  </div>
);

// --- Varian Animasi untuk Framer Motion ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Setiap anak akan muncul dengan delay 0.1s
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

// --- Komponen Utama Dashboard ---

export default function WalletInfo() {
 const { user, wallet, transactionHistory, isConnected, refetchWalletHistory } = useMqtt();

  useEffect(() => {
    if (isConnected && wallet) {
      refetchWalletHistory(); 
    }
  }, [isConnected, wallet, refetchWalletHistory]);

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!wallet) router.replace("/");
    }, 500);
    return () => clearTimeout(timer);
  }, [wallet, router]);

  if (!wallet || !user) {
    return <DashboardSkeleton />;
  }

  return (
    // Kita hapus bg-slate-50 dan min-h-screen karena sudah ada di layout
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      {/* Header Dashboard */}
      <motion.header
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
            Ringkasan Wallet
          </h1>
          <p className="text-md text-slate-500 mt-1">
            Selamat datang,{" "}
            <span className="font-semibold text-slate-600">{user.name}</span>!
          </p>
        </div>
        <div
          className={`mt-4 md:mt-0 flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full ${
            isConnected
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isConnected ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
          <span>MQTT: {isConnected ? "Terhubung" : "Terputus"}</span>
        </div>
      </motion.header>

      {/* Grid Info Utama dengan Animasi */}
      <motion.section
        className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8"
        variants={containerVariants} // Kartu-kartu di dalam juga akan dianimasikan
      >
        <InfoCard
          icon={Wallet}
          title="Saldo Saat Ini"
          value={`Rp ${wallet.balance.toLocaleString("id-ID")}`}
        />
        <InfoCard
          icon={User}
          title="E-Wallet Aktif"
          value={wallet.wallet_name}
        />
        <InfoCard icon={Mail} title="Email Akun" value={user.email} />
      </motion.section>

      {/* Tabel Riwayat Transaksi dengan Animasi */}
      <motion.section
        className="bg-white shadow-sm rounded-2xl border border-gray-200/80 overflow-hidden"
        variants={itemVariants}
      >
        <header className="p-5 border-b border-gray-200/80">
          <h2 className="text-lg font-semibold text-slate-800">
            Riwayat Transaksi
          </h2>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Detail Transaksi
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Jumlah
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/80">
              {transactionHistory.length > 0 ? (
                transactionHistory.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-full ${
                            tx.type === "credit" ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {tx.type === "credit" ? (
                            <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-800 truncate max-w-xs">
                            {tx.description}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(tx.created_at).toLocaleString("id-ID", {
                              dateStyle: "long",
                              timeStyle: "short",
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div
                        className={`text-sm font-semibold ${
                          tx.type === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type === "credit" ? "+" : "-"} Rp{" "}
                        {tx.amount.toLocaleString("id-ID")}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-10 text-center text-slate-500"
                  >
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>
    </motion.div>
  );
}
