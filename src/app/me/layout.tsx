import Sidebar from "@/components/dashboard/Sidebar";
import { Toaster } from "react-hot-toast";

export default function MeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Toaster position="top-center" />
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
