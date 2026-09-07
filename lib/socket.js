"use client";

import { io } from "socket.io-client";

/**
 * Socket sunucusunun adresi. Vercel/Render üzerinde farklı bir sunucu
 * kullanmak için `.env.local` dosyasına NEXT_PUBLIC_SOCKET_URL değişkenini ekleyin.
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
      // Render'ın ücretsiz planı uykuya geçtiği için sunucunun uyanması
      // yarım dakikayı bulabiliyor. Bu sürede Render isteği yanıtlamadan
      // bekletir; kısa aralıklarla yeniden denemek tarayıcının aynı sunucuya
      // açabileceği bağlantı sayısını askıda kalan isteklerle doldurup
      // bağlantıyı büsbütün engelliyor. Bu yüzden tek bir isteğin soğuk
      // başlangıcı boydan boya beklemesine izin veriyoruz.
      timeout: 60000,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }

  return socket;
};

/**
 * Uyuyan sunucuyu erkenden uyandırmak için sağlık ucuna istek atar.
 * Sonucu önemli değildir; amaç Render'ın servisi ayağa kaldırmaya
 * başlamasıdır.
 */
export const wakeServer = () => {
  if (typeof window === "undefined") return;
  fetch(`${SOCKET_URL}/`, { mode: "no-cors", cache: "no-store" }).catch(() => {});
};
