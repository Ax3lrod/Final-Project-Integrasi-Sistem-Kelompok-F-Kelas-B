"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import mqtt, { MqttClient } from "mqtt";

// --- Tipe Data Sesuai Spesifikasi API Anda ---
interface UserIdentity {
  id: string;
  name: string;
  email: string;
}

interface WalletIdentity {
  id: string;
  wallet_name: string;
  payment_method: string;
  balance: number;
}

interface Transaction {
  id: string;
  transaction_type: "TRANSFER" | "PURCHASE" | string;
  description: string;
  balance_change: number;
  created_at: string;
  amount: number;
  type: "credit" | "debit";
}

interface Product {
  id: string;
  name: string;
  image_url: string;
  price: number;
  quantity: number;
}

// --- Tipe untuk Context ---
interface MqttContextType {
  // Status & Data
  client: MqttClient | null;
  isConnected: boolean;
  user: UserIdentity | null;
  wallet: WalletIdentity | null;
  products: Product[];
  transactionHistory: Transaction[];

  // Aksi yang bisa dipanggil dari komponen
  selectWallet: (wallet: string) => void;
  refetchWallet: () => void;
  refetchWalletHistory: () => void;
  transferBalance: (
    receiverEmail: string,
    receiverPaymentMethod: string,
    amount: number
  ) => void;
  purchaseProduct: (productId: string, quantity: number) => void;
}

const MqttContext = createContext<MqttContextType | undefined>(undefined);

//const serverIp = process.env.SERVER_IP;

// --- Konfigurasi Kelompok F Kelas B ---
const MQTT_BROKER_URL = `ws://147.182.226.225:9001`;
const MQTT_USERNAME = "Kelompok_F_Kelas_B";
const MQTT_PASSWORD = "Insys#BF#201";
const MY_EMAIL = "insys-B-F@bankit.com";
const TOPIC_PREFIX = "B/F";

export const MqttProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // State Aplikasi
  const [user, setUser] = useState<UserIdentity | null>(null);
  const [wallet, setWallet] = useState<WalletIdentity | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<Transaction[]>(
    []
  );

  // === FUNGSI AKSI (PUBLISH) ===

  const selectWallet = useCallback(
    (paymentMethod: string) => {
      const lowerCaseMethod = paymentMethod.toLowerCase();
      console.log(`Selecting wallet: ${lowerCaseMethod}`);
      
      // 1. Simpan ke Local Storage
      localStorage.setItem("selectedWallet", lowerCaseMethod);

      // 2. Update state dan reset data lama
      setWallet(null);
      setTransactionHistory([]);

      // 3. Trigger request untuk data wallet baru
      if (client && isConnected) {
        const topic = `${TOPIC_PREFIX}/bankit/wallet-identity/request`;
        const payload = JSON.stringify({
          email: MY_EMAIL,
          payment_method: lowerCaseMethod,
        });
        console.log(`Publishing to ${topic}:`, payload);
        client.publish(topic, payload);
      }
    },
    [client, isConnected]
  );

  const refetchWallet = useCallback(() => {
    if (client && isConnected && wallet) {
      selectWallet(wallet.payment_method);
    }
  }, [client, isConnected, wallet, selectWallet]);

  const refetchWalletHistory = useCallback(() => {
    if (client && isConnected && wallet) {
      const topic = `${TOPIC_PREFIX}/bankit/wallet-history/request`;
      const payload = JSON.stringify({
        email: MY_EMAIL,
        payment_method: wallet.payment_method,
      });
      console.log(`Requesting wallet history on ${topic}:`, payload);
      client.publish(topic, payload);
    }
  }, [client, isConnected, wallet]);

  const transferBalance = useCallback(
  (receiverEmail: string, receiverPaymentMethod: string, amount: number): Promise<{ success: boolean; message?: string }> => {
    return new Promise((resolve) => {
      if (!client || !isConnected || !wallet) {
        return resolve({ success: false, message: "MQTT belum siap" });
      }

      const requestTopic = `${TOPIC_PREFIX}/bankit/${wallet.payment_method}/transfer/send/request`;
      const responseTopic = `${TOPIC_PREFIX}/bankit/${wallet.payment_method}/transfer/send/response`;

      const requestPayload = {
        sender_email: MY_EMAIL,
        receiver_payment_method: receiverPaymentMethod.toLowerCase(),
        receiver_email: receiverEmail,
        amount,
      };

      const payload = JSON.stringify(requestPayload);

      const onResponse = (topic: string, message: Buffer) => {
        if (topic !== responseTopic) return;

        try {
          const res = JSON.parse(message.toString());

          // Hanya proses jika sender_email sesuai (hindari konflik antar user)
          if (res.sender_email !== MY_EMAIL) return;

          clearTimeout(timeout); // Hentikan timeout
          client?.removeListener("message", onResponse);
          client?.unsubscribe(responseTopic);

          resolve({
            success: res.status === "success",
            message: res.message || undefined,
          });
        } catch {
          clearTimeout(timeout);
          client?.removeListener("message", onResponse);
          client?.unsubscribe(responseTopic);

          resolve({ success: false, message: "Format respons tidak valid" });
        }
      };

      client.subscribe(responseTopic, () => {
        client?.on("message", onResponse);
        client.publish(requestTopic, payload);
      });

      const timeout = setTimeout(() => {
        client?.removeListener("message", onResponse);
        client?.unsubscribe(responseTopic);
      }, 5000);
    });
  },
  [client, isConnected, wallet]
);

  const purchaseProduct = useCallback(
    (productId: string, quantity: number) => {
      if (client && isConnected && wallet) {
        const topic = `${TOPIC_PREFIX}/shopit/buy/request`;
        const payload = JSON.stringify({
          buyer_email: MY_EMAIL,
          payment_method: wallet.payment_method,
          product_id: productId,
          quantity,
        });
        client.publish(topic, payload);
      }
    },
    [client, isConnected, wallet]
  );

  // === EFEK UTAMA: KONEKSI DAN LISTENER ===

  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
    });

    setClient(mqttClient);

    mqttClient.on("connect", () => {
      setIsConnected(true);
      console.log("✅ MQTT Terhubung!");

      // Topik yang selalu didengarkan
      const baseTopics = [
        `${TOPIC_PREFIX}/bankit/account-identity/response`,
        `${TOPIC_PREFIX}/bankit/wallet-identity/response`,
        `${TOPIC_PREFIX}/bankit/wallet-history/response`,
        `${TOPIC_PREFIX}/shopit/product-catalog/response`,
        `${TOPIC_PREFIX}/shopit/buy/response`,
      ];
      // Topik dinamis berdasarkan E-Wallet
      const ewallets = ["dopay", "owo", "ringaja"];
      const dynamicTopics = ewallets.flatMap((ew) => [
        `${TOPIC_PREFIX}/bankit/${ew}/transfer/send/response`,
        `${TOPIC_PREFIX}/bankit/${ew}/transfer/receive`,
        `${TOPIC_PREFIX}/bankit/${ew}/live-history`,
      ]);

      mqttClient.subscribe([...baseTopics, ...dynamicTopics], (err) => {
        if (!err) {
          console.log("🚀 Berhasil subscribe ke semua topik");
          // Minta data awal setelah terhubung
          mqttClient.publish(
            `${TOPIC_PREFIX}/bankit/account-identity/request`,
            JSON.stringify({ email: MY_EMAIL })
          );
          
          mqttClient.publish(
            `${TOPIC_PREFIX}/shopit/product-catalog/request`,
            "{}"
          );

          // Load wallet dari localStorage jika ada
          const storedWallet = localStorage.getItem("selectedWallet");
          if (storedWallet) {
            // Gunakan timeout untuk memastikan subscription sudah aktif
            setTimeout(() => {
              selectWallet(storedWallet);
            }, 1000);
          }
        }
      });
    });

    // === MESSAGE HANDLER ===
    mqttClient.on("message", (topic, payload) => {
      const message = JSON.parse(payload.toString());
      console.log(`[MESSAGE] from [${topic}]:`, message);

      if (!message.status) {
        console.error(`API Error on topic ${topic}:`, message.message);
        return;
      }

      const topicParts = topic.split("/");
      const mainTopic = topicParts.slice(2).join("/");

      switch (mainTopic) {
        case "bankit/account-identity/response":
          setUser(message.data);
          break;

        case "bankit/wallet-identity/response":
          console.log("Wallet identity received:", message.data);
          setWallet(message.data);
          // Pastikan payment_method ada sebelum request history
          if (message.data && message.data.payment_method) {
            console.log(
              "Requesting wallet history for:",
              message.data.payment_method
            );
            mqttClient.publish(
              `${TOPIC_PREFIX}/bankit/wallet-history/request`,
              JSON.stringify({
                email: MY_EMAIL,
                payment_method: message.data.payment_method,
              })
            );
          } else {
            console.error("No payment_method in wallet identity response");
          }
          break;

        case "bankit/wallet-history/response":
          console.log("Wallet history received:", message.data);
          setTransactionHistory(message.data.transactions || []);
          // Update saldo dari history juga untuk sinkronisasi
          setWallet((prev) =>
            prev ? { ...prev, balance: message.data.current_balance } : null
          );
          break;

        case "shopit/product-catalog/response":
          setProducts(message.data);
          break;

        case `shopit/buy/response`:
          console.log("Purchase response:", message);
          // Refresh wallet data setelah purchase
          if (wallet && wallet.payment_method) {
            console.log("Refreshing wallet after purchase...");
            mqttClient.publish(
              `${TOPIC_PREFIX}/bankit/wallet-identity/request`,
              JSON.stringify({
                email: MY_EMAIL,
                payment_method: wallet.payment_method,
              })
            );
          }
          break;

        // Transfer responses
        default:
          if (mainTopic.includes("transfer/send/response")) {
            console.log("Transfer response:", message);
            // Refresh wallet setelah transfer
            if (wallet && wallet.payment_method) {
              mqttClient.publish(
                `${TOPIC_PREFIX}/bankit/wallet-identity/request`,
                JSON.stringify({
                  email: MY_EMAIL,
                  payment_method: wallet.payment_method,
                })
              );
            }
          } else if (
            mainTopic.includes("transfer/receive") ||
            mainTopic.includes("live-history")
          ) {
            console.log("Live update:", message);
            // Update saldo real-time
            if (message.data && message.data.current_balance !== undefined) {
              setWallet((prev) =>
                prev ? { ...prev, balance: message.data.current_balance } : null
              );
            }

            // Tambahkan toast untuk live updates
            toast.success(message.message || "Transaksi baru diterima!");
          }
          break;
      }
    });
    return () => {
      if (mqttClient) mqttClient.end();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Deliberately empty deps to run only once. `selectWallet` handles client-dependent logic.

  return (
    <MqttContext.Provider
      value={{
        client,
        isConnected,
        user,
        wallet,
        products,
        transactionHistory,
        selectWallet,
        refetchWallet,
        refetchWalletHistory,
        transferBalance,
        purchaseProduct,
      }}
    >
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => {
  const context = useContext(MqttContext);
  if (context === undefined) {
    throw new Error("useMqtt harus digunakan di dalam MqttProvider");
  }
  return context;
};
