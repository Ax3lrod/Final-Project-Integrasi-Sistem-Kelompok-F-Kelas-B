"use client";
import { useMqtt } from "@/context/MqttContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ChooseWallet from "@/app/containers/wallet/ChooseWallet";

export default function Home() {
  const { wallet } = useMqtt();
  const router = useRouter();

  useEffect(() => {
    if (wallet) {
      router.replace("/me");
    }
  }, [wallet, router]);

  if (!wallet) {
    return <ChooseWallet />;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <p className="text-lg text-gray-600 animate-pulse">
        Mengarahkan ke dashboard...
      </p>
    </div>
  );
}
