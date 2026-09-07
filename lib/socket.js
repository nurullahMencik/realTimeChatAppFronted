"use client";

import { io } from "socket.io-client";

/**
 * Socket sunucusunun adresi. Vercel/Render üzerinde farklı bir sunucu
 * kullanmak icin `.env.local` dosyasina NEXT_PUBLIC_SOCKET_URL degiskenini ekleyin.
 */
export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "https://realtimechatappb.onrender.com";

let socket = null;

/**
 * Uygulama boyunca tek bir socket bağlantısı kullanılır.
 * Sunucu tarafında (SSR) çalışırken null döner; bu yüzden sadece
 * useEffect / olay işleyicileri içinde çağırın.
 */
export const getSocket = () => {
  if (typeof window === "undefined") return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      // Render'ın ücretsiz planı bir süre sonra uykuya geçtiği için
      // ilk bağlantı uzun sürebilir; ısrarla yeniden deneriz.
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
  }

  return socket;
};
