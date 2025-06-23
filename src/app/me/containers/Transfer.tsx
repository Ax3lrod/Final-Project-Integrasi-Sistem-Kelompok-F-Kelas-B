"use client";

import React, { useState } from 'react'
import { motion } from "framer-motion";
import { useMqtt } from "@/context/MqttContext";
import {
  Banknote,
  Wifi,
  WifiOff,
  ArrowRight,
  Users,
  Shuffle,
} from "lucide-react";
import TransferForms from './TransferForms';

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
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const cardHoverVariants = {
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.2,
    },
  },
};

export default function Transfer() {
  const { user, wallet, isConnected } = useMqtt();
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferType, setTransferType] = useState<null | string>(null);

  const eWalletOptions = [
    {
      displayName: "DoPay",
      value: "dopay",
      logoColor: "text-blue-500",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
    },
    {
      displayName: "OWO",
      value: "owo",
      logoColor: "text-purple-500",
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
    },
    {
      displayName: "RiNG Aja",
      value: "ringaja",
      logoColor: "text-red-500",
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
    },
  ];

  const activeWallet = eWalletOptions.find(
    (w) => w.value === wallet?.payment_method.toLowerCase()
  );

  if (showTransferForm && (transferType === "same" || transferType === "inter")) {
    return (
      <TransferForms
        onBack={() => {
          setShowTransferForm(false);
          setTransferType(null);
        }}
        initialType={transferType}
      />
    );
  }

  if (!user) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      {/* Header Dashboard */}
      <motion.header
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        variants={itemVariants}
      >
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
              Transfer E-Wallet
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Selamat datang,{" "}
              <span className="font-semibold text-slate-600">{user.name}</span>!
            </p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          {/* Connection Status */}
          <div
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              isConnected
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {isConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span>{isConnected ? "MQTT Terhubung" : "MQTT Terputus"}</span>
          </div>
        </div>
      </motion.header>

      {/* Transfer Options */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={itemVariants}
      >
        {/* Same E-Wallet Transfer */}
        <motion.div
          className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          variants={cardHoverVariants}
          whileHover="hover"
        >
          {/* Background Pattern */}
          <div className={`absolute inset-0 bg-gradient-to-br ${
            activeWallet?.bgGradient || "from-gray-50 to-gray-100"
          } opacity-50`}></div>
          
          <div className="relative p-6 z-10">
            {/* Icon */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 bg-gradient-to-br ${
                  activeWallet?.gradient || "from-gray-400 to-gray-500"
                } text-white rounded-xl shadow-lg`}
              >
                <Users className="w-6 h-6" />
              </div>
              <div className="p-2 bg-white/80 rounded-lg">
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </div>
            </div>

            {/* Content */}
            <div className="mb-6 flex flex-col h-20">
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Sesama {activeWallet?.displayName || "E-Wallet"}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transfer saldo kepada sesama pengguna {activeWallet?.displayName} dengan mudah dan cepat
              </p>
            </div>

            {/* Button */}
            <button onClick={() => {
                setTransferType('same');
                setShowTransferForm(true);
              }}
            className={`items-end w-full px-6 py-3 bg-gradient-to-r ${
              activeWallet?.value === 'owo' 
                ? 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                : activeWallet?.value === 'ringaja'
                ? 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                : 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            } text-white font-medium rounded-xl transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl`}>
              <div className="flex items-center justify-center gap-2">
                <span>Mulai Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </motion.div>

        {/* Inter E-Wallet Transfer */}
        <motion.div
          className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          variants={cardHoverVariants}
          whileHover="hover"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100 opacity-50"></div>
          
          <div className="relative p-6 z-10">
            {/* Icon */}
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg">
                <Shuffle className="w-6 h-6" />
              </div>
              <div className="p-2 bg-white/80 rounded-lg">
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </div>
            </div>

            {/* Content */}
            <div className="mb-6 flex flex-col h-20">
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Transfer Antar E-Wallet
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pindahkan saldo antar berbagai platform e-wallet dengan aman
              </p>
            </div>

            {/* Button */}
            <button onClick={() => {
                setTransferType('inter');
                setShowTransferForm(true);
              }}
            className="items-end w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-emerald-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-center gap-2">
                <span>Mulai Transfer</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Additional Info Section */}
      <motion.div
        className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200"
        variants={itemVariants}
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Banknote className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Tips Transfer Aman</h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Pastikan nomor tujuan sudah benar sebelum konfirmasi</li>
              <li>• Simpan bukti transfer untuk keperluan dokumentasi</li>
              <li>• Gunakan jaringan yang aman saat melakukan transaksi</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}