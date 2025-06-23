"use client";

import { useMqtt } from "@/context/MqttContext";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Send,
  ShoppingCart,
  LogOut,
  Banknote,
} from "lucide-react";

// Animasi untuk framer-motion
const sidebarVariants = {
  hidden: { x: -300, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
};

const navContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

// Komponen item menu
const SidebarItem = ({
  icon: Icon,
  text,
  active,
  href,
  colorClass,
}: {
  icon: React.ElementType;
  text: string;
  active: boolean;
  href: string;
  colorClass: string;
}) => (
  <motion.li variants={itemVariants}>
    <Link href={href}>
      <div
        className={`
          flex items-center gap-3.5 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 relative
          ${
            active
              ? `${colorClass} text-white shadow-md`
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
          }
        `}
      >
        <Icon className="w-5 h-5" />
        <span className="font-semibold text-sm">{text}</span>
        {active && (
          <motion.div
            className={`absolute -left-2 top-0 h-full w-1.5 ${colorClass} rounded-r-full`}
            layoutId="active-indicator"
          />
        )}
      </div>
    </Link>
  </motion.li>
);

export default function Sidebar() {
  const { user, wallet, selectWallet } = useMqtt();
  const pathname = usePathname();

  const eWalletOptions = [
    {
      displayName: "DoPay",
      value: "dopay",
      logoColor: "text-blue-500",
      gradient: "from-blue-500 to-blue-600",
      colorClass: "bg-blue-600",
    },
    {
      displayName: "OWO",
      value: "owo",
      logoColor: "text-purple-500",
      gradient: "from-purple-500 to-purple-600",
      colorClass: "bg-purple-600",
    },
    {
      displayName: "RiNG Aja",
      value: "ringaja",
      logoColor: "text-red-500",
      gradient: "from-red-500 to-red-600",
      colorClass: "bg-red-600",
    },
  ];

  const activeWallet = eWalletOptions.find(
    (w) => w.value === wallet?.payment_method.toLowerCase()
  );

  const getActiveColor = () => {
    return activeWallet?.colorClass || "bg-blue-600";
  };

  const handleLogout = () => {
    localStorage.removeItem("selectedWallet");
    selectWallet("");
    window.location.href = "/";
  };

  return (
    <motion.aside
      className="w-64 bg-white flex flex-col border-r border-slate-200/80 shrink-0"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Logo */}
      <motion.div
        className="flex items-center gap-3 p-6 border-b border-slate-200/80"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
      >
        <div
          className={`p-2 bg-gradient-to-br ${
            activeWallet?.gradient || "from-gray-400 to-gray-500"
          } text-white rounded-lg`}
        >
          <Banknote className="w-6 h-6" />
        </div>
        <h1 className="font-bold text-xl text-slate-800">
          {activeWallet?.displayName || "E-Wallet"}
        </h1>
      </motion.div>

      {/* Profil */}
      <motion.div
        className="p-6 text-left"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.2 } }}
      >
        <p className="text-xs text-slate-500 mb-1">Akun Aktif</p>
        <h2 className="font-semibold text-md text-slate-800 truncate">
          {user?.name || "Loading..."}
        </h2>
        <p className="text-xs text-slate-400 truncate">
          {user?.email || "..."}
        </p>
      </motion.div>

      {/* Navigasi */}
      <motion.nav
        className="flex-1 px-4"
        variants={navContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <ul className="space-y-2">
          <SidebarItem
            icon={LayoutDashboard}
            text="Dashboard"
            active={pathname === "/me"}
            href="/me"
            colorClass={getActiveColor()}
          />
          <SidebarItem
            icon={Send}
            text="Transfer"
            active={pathname === "/me/transfer"}
            href="/me/transfer"
            colorClass={getActiveColor()}
          />
          <SidebarItem
            icon={ShoppingCart}
            text="Toko"
            active={pathname === "/shop"}
            href="/shop"
            colorClass={getActiveColor()}
          />
        </ul>
      </motion.nav>

      {/* Logout */}
      <motion.div
        className="p-4 mt-auto border-t border-slate-200/80"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
      >
        <div
          onClick={handleLogout}
          className="flex items-center gap-3.5 px-4 py-3 rounded-lg cursor-pointer text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold text-sm">Ganti Wallet</span>
        </div>
      </motion.div>
    </motion.aside>
  );
}
