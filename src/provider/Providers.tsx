'use client';

import { MqttProvider } from "@/context/MqttContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MqttProvider>
      {children}
    </MqttProvider>
  );
}