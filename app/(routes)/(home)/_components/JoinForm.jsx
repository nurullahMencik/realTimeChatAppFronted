"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setRoom, setUsername } from "@/redux/chatSlice";
import { useSocket } from "@/hooks/useSocket";
import { wakeServer } from "@/lib/socket";

// Odaya katılma onayı için beklenecek süre.
const JOIN_TIMEOUT_MS = 15000;
// Sunucunun uyanması için tanınan toplam süre; bu süre aşılırsa hata gösterilir.
const WAKE_TIMEOUT_MS = 150000;

const JoinForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { socket, status } = useSocket();
  const { username, room } = useSelector((state) => state.chat);

  // idle: bekleyen işlem yok | waiting: sunucunun uyanması bekleniyor | joining: odaya giriliyor
  const [phase, setPhase] = useState("idle");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const startedAt = useRef(0);

  const isConnected = status === "connected";
  const isBusy = phase !== "idle";
  const canSubmit = !isBusy && username.trim() !== "" && room.trim() !== "";

  // Sayfa açılır açılmaz sunucuyu uyandırmaya başla; kullanıcı formu
  // doldururken sunucu ayağa kalkmış olur.
  useEffect(() => {
    wakeServer();
  }, []);

  // Bekleme sırasında geçen süreyi göster: ekran donmuş gibi görünmesin.
  useEffect(() => {
    if (!isBusy) return;

    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(seconds);

      if (phase === "waiting" && Date.now() - startedAt.current > WAKE_TIMEOUT_MS) {
        setPhase("idle");
        setError(
          "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin."
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isBusy, phase]);

  const joinRoom = useCallback(() => {
    if (!socket) return;

    setPhase("joining");

    // socket.timeout: sunucudan onay gelmezse callback hata ile çağrılır.
    // Eski sürümdeki sorun buydu: onay gelmeyince sayfa hiç açılmıyordu.
    socket
      .timeout(JOIN_TIMEOUT_MS)
      .emit("room", { room: room.trim() }, (timeoutError, response) => {
        if (timeoutError || response?.status !== "ok") {
          setPhase("idle");
          setError("Odaya bağlanılamadı, lütfen tekrar deneyin.");
          return;
        }

        dispatch(setUsername(username.trim()));
        dispatch(setRoom(room.trim()));
        router.push("/chat");
      });
  }, [socket, room, username, dispatch, router]);

  // Kullanıcı butona bastığında sunucu henüz uyanmadıysa bekleriz;
  // bağlantı kurulur kurulmaz odaya giriş kendiliğinden yapılır.
  useEffect(() => {
    if (phase === "waiting" && isConnected) joinRoom();
  }, [phase, isConnected, joinRoom]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (username.trim() === "" || room.trim() === "") {
      setError("Adınızı ve oda adını yazmanız gerekiyor.");
      return;
    }

    startedAt.current = Date.now();
    setElapsed(0);

    if (isConnected) {
      joinRoom();
    } else {
      wakeServer();
      setPhase("waiting");
    }
  };

  const buttonLabel = () => {
    if (phase === "waiting") return `Sunucu uyandırılıyor... ${elapsed}sn`;
    if (phase === "joining") return "Odaya giriliyor...";
    return "Sohbete Başla";
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl"
      >
        <header className="text-center">
          <h1 className="text-2xl font-bold text-white">Anlık Sohbet</h1>
          <p className="text-sm text-slate-400 mt-2">
            Adınızı yazın, bir oda adı belirleyin ve sohbete katılın.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-200">Adınız</span>
            <input
              className="bg-slate-800 border border-slate-700 focus:border-emerald-500 p-3 rounded-lg outline-none text-white placeholder-slate-500 transition-colors"
              type="text"
              autoComplete="off"
              maxLength={24}
              placeholder="örn. Nurullah"
              value={username}
              onChange={(e) => dispatch(setUsername(e.target.value))}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-200">Oda adı</span>
            <input
              className="bg-slate-800 border border-slate-700 focus:border-emerald-500 p-3 rounded-lg outline-none text-white placeholder-slate-500 transition-colors"
              type="text"
              autoComplete="off"
              maxLength={24}
              placeholder="örn. arkadaşlar"
              value={room}
              onChange={(e) => dispatch(setRoom(e.target.value))}
            />
            <span className="text-xs text-slate-500">
              Aynı odada sohbet etmek isteyen herkes buraya aynı ismi yazmalı.
            </span>
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            {error}
          </p>
        )}

        {phase === "waiting" && (
          <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            Sunucu ücretsiz planda çalıştığı için bir süre kullanılmayınca
            uykuya geçiyor. Uyanması yarım dakikayı bulabilir; bağlantı kurulur
            kurulmaz odaya otomatik gireceksiniz.
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed p-3 rounded-lg text-white font-semibold transition-colors cursor-pointer"
        >
          {buttonLabel()}
        </button>
      </form>
    </main>
  );
};

export default JoinForm;
