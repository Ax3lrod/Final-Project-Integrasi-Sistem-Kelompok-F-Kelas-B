"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useMqtt } from "@/context/MqttContext";
import {
  ArrowLeft,
  Mail,
  DollarSign,
  Wallet,
  Send,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type TransferFormsProps = {
  onBack: () => void;
  initialType?: string | null;
};

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

const DashboardSkeleton = () => (
  <div className="flex h-full items-center justify-center">
    <div className="flex items-center gap-2 text-gray-500">
      <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-blue-500"></div>
      <p>Memuat data ringkasan...</p>
    </div>
  </div>
);

const TransferForms = ({onBack, initialType}: TransferFormsProps) => {
  const { user, wallet, transferBalance, isConnected } = useMqtt();
  const [ activeTab, setActiveTab ] = useState(initialType || null);
  const [formData, setFormData] = useState({
    receiverEmail: "",
    receiverPaymentMethod: "",
    amount: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  type Errors = {
    receiverEmail?: string;
    receiverPaymentMethod?: string;
    amount?: string;
  };
  const [errors, setErrors] = useState<Errors>({})
  const router = useRouter();
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

    const validateForm = () => {
    const newErrors: Errors = {};
    
    if (!formData.receiverEmail.trim()) {
      newErrors.receiverEmail = "Email penerima harus diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.receiverEmail)) {
      newErrors.receiverEmail = "Format email tidak valid";
    }

    if (activeTab === "inter" && !formData.receiverPaymentMethod) {
      newErrors.receiverPaymentMethod = "Pilih e-wallet tujuan";
    }

    if (!formData.amount.trim()) {
      newErrors.amount = "Jumlah transfer harus diisi";
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = "Jumlah harus berupa angka positif";
      } else if (amount > (wallet?.balance ?? 0)) {
        newErrors.amount = "Saldo tidak mencukupi";
      } else if (amount < 1000) {
        newErrors.amount = "Minimal transfer Rp 1.000";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };


const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!validateForm()) return;
  if (!isConnected) {
    toast.error("Koneksi MQTT terputus");
    return;
  }

  try {
    const targetPaymentMethod = activeTab === "same" 
      ? wallet?.payment_method 
      : formData.receiverPaymentMethod;

    const result = await transferBalance(
      formData.receiverEmail,
      targetPaymentMethod || "",
      parseFloat(formData.amount)
    ) ?? { success: false, message: "Transfer gagal." };

    if (!result.success) {
      toast.error(result.message || "Transfer gagal.");
      setIsLoading(false); 
      return;
    }

    setFormData({
      receiverEmail: "",
      receiverPaymentMethod: "",
      amount: "",
    });

    setTimeout(() => {
          onBack();
        }, 2000);
  } catch (error) {
      console.error("Transfer error:", error);
      toast.error("Transfer gagal. Silakan coba lagi.");
  }     
  };

  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!wallet) router.replace("/");
    }, 500);
    return () => clearTimeout(timer);
  }, [wallet, router]);

  if (!user || !isConnected || !wallet) {
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
          <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
              Transfer E-Wallet
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Saldo tersedia: {`Rp ${wallet.balance.toLocaleString("id-ID")}`}
            </p>
          </div>
        </div>
      </motion.header>
      <motion.div className="flex bg-slate-100 rounded-xl p-1 mb-6">
        <button onClick={() => setActiveTab("same")}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === "same"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          }`}>
          Sesama {activeWallet?.displayName}
        </button>
        <button onClick={() => setActiveTab("inter")}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
            activeTab === "inter"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          }`}>
          Antar E-Wallet
        </button>
      </motion.div>
      
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Penerima
            </label>
            <input
              type="email"
              value={formData.receiverEmail}
              onChange={(e) => setFormData({ ...formData, receiverEmail: e.target.value })}
              className={`w-full px-4 py-3 border rounded-xl text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.receiverEmail ? "border-red-300" : "border-slate-300"
              }`}
              placeholder="Masukkan email penerima"
            />
            {errors.receiverEmail && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.receiverEmail}
              </p>
            )}
          </div>
<AnimatePresence>
            {activeTab === "inter" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Wallet className="w-4 h-4 inline mr-2" />
                  E-Wallet Tujuan
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {eWalletOptions
                    .filter((option) => option.value !== wallet?.payment_method.toLowerCase())
                    .map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, receiverPaymentMethod: option.value })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                                  formData.receiverPaymentMethod === option.value
                                    ? option.value === 'owo'
                                      ? 'border-purple-500 bg-purple-50'
                                      : option.value === 'ringaja'
                                      ? 'border-red-500 bg-red-50'
                                      : 'border-blue-500 bg-blue-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}>
                      <div className={`w-8 h-8 mx-auto mb-2 p-1 rounded-lg bg-gradient-to-br ${option.gradient}`}>
                        <CreditCard className="w-full h-full text-white" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">{option.displayName}</p>
                    </button>
                  ))}
                </div>
                {errors.receiverPaymentMethod && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.receiverPaymentMethod}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Jumlah Transfer
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">
                Rp
              </span>
              <input
                type="number"
                onWheel={(e) => e.currentTarget.blur()}
                value={formData.amount}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setFormData({
                    ...formData,
                    amount: isNaN(value) ? "" : value.toString(),
                  });
                }}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.amount ? "border-red-300" : "border-slate-300"
                }`}
                placeholder="0"
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.amount}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-1">Minimal transfer Rp 1.000</p>
          </div>

          {/* Summary */}
          {formData.amount && !errors.amount && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 rounded-xl p-4"
            >
              <h3 className="font-medium text-slate-800 mb-2">Ringkasan Transfer</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Dari:</span>
                  <span className="font-medium text-slate-700">{activeWallet?.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ke:</span>
                  <span className="font-medium text-slate-700">
                    {activeTab === "same" 
                      ? activeWallet?.displayName 
                      : eWalletOptions.find(w => w.value === formData.receiverPaymentMethod)?.displayName || "Pilih e-wallet"
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Jumlah:</span>
                  <span className="font-medium text-lg text-slate-700">{formatCurrency(parseFloat(formData.amount))}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isConnected}
            className={`w-full px-6 py-4 rounded-xl font-medium transition-all ${
              activeTab === "same"
                ? activeWallet?.value === 'owo'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                  : activeWallet?.value === 'ringaja'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
            } text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
          >
            <div className="flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Kirim Transfer</span>
                </>
              )}
            </div>
          </button>

          {!isConnected && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>Koneksi MQTT terputus. Silakan tunggu hingga terhubung kembali.</span>
            </div>
          )}
        </form>
      </motion.div>

      {/* Quick Amount Buttons */}
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-700 mb-3">Jumlah cepat:</p>
        <div className="flex flex-wrap gap-2">
          {[10000, 25000, 50000, 100000, 250000, 500000].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setFormData({ ...formData, amount: amount.toString() })}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm transition-colors"
            >
              {formatCurrency(amount)}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TransferForms;