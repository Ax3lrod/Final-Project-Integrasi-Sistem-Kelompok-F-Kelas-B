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

// Varian animasi untuk framer-motion
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
      staggerChildren: 0.08, // Menu akan muncul satu per satu
      delayChildren: 0.2,
    },
  },
};

// Komponen untuk setiap item menu dengan animasi
const SidebarItem = ({
  icon: Icon,
  text,
  active,
  href,
}: {
  icon: React.ElementType;
  text: string;
  active: boolean;
  href: string;
}) => (
  <motion.li variants={itemVariants}>
    <Link href={href}>
      <div
        className={`
        flex items-center gap-3.5 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 relative
        ${
          active
            ? "bg-blue-600 text-white shadow-md"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
        }
      `}
      >
        <Icon className="w-5 h-5" />
        <span className="font-semibold text-sm">{text}</span>
        {active && (
          <motion.div
            className="absolute -left-2 top-0 h-full w-1.5 bg-blue-600 rounded-r-full"
            layoutId="active-indicator" // Animasi magic move!
          />
        )}
      </div>
    </Link>
  </motion.li>
);

export default function Sidebar() {
  const { user, selectWallet } = useMqtt();
  const pathname = usePathname();

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
      {/* Logo Section */}
      <motion.div
        className="flex items-center gap-3 p-6 border-b border-slate-200/80"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
      >
        <div className="p-2 bg-blue-600 text-white rounded-lg">
          <Banknote className="w-6 h-6" />
        </div>
        <h1 className="font-bold text-xl text-slate-800">BankIT</h1>
      </motion.div>

      {/* Profil Section */}
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

      {/* Navigation Menu */}
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
          />
          <SidebarItem
            icon={Send}
            text="Transfer"
            active={pathname === "/me/transfer"}
            href="/me/transfer"
          />
          <SidebarItem
            icon={ShoppingCart}
            text="Toko"
            active={pathname === "/shop"}
            href="/shop"
          />
        </ul>
      </motion.nav>

      {/* Logout/Switch Wallet Section */}
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
