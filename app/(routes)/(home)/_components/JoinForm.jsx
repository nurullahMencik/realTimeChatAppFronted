"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setRoom, setUsername } from "@/redux/chatSlice";
import { useSocket } from "@/hooks/useSocket";

// Sunucu uykudaysa (Render ücretsiz plan) uyanması zaman alır.
// Bu süreyi aşan denemelerde kullanıcıya açık bir hata gösteririz.
const JOIN_TIMEOUT_MS = 15000;

const JoinForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { socket, status } = useSocket();
  const { username, room } = useSelector((state) => state.chat);

  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [slowConnection, setSlowConnection] = useState(false);

  // Bağlantı 4 saniyeden uzun sürerse sunucunun uyandığını kullanıcıya söyle.
  useEffect(() => {
    if (status === "connected") {
      setSlowConnection(false);
      return;
    }
    const timer = setTimeout(() => setSlowConnection(true), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  const isReady = status === "connected";
  const canSubmit =
    isReady && !joining && username.trim() !== "" && room.trim() !== "";

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!socket || !isReady) {
      setError("Sunucuya henüz bağlanılamadı, lütfen birkaç saniye bekleyin.");
      return;
    }
    if (username.trim() === "" || room.trim() === "") {
      setError("Adınızı ve oda adını yazmanız gerekiyor.");
      return;
    }

    setJoining(true);

    // socket.timeout: sunucudan onay gelmezse callback hata ile çağrılır.
    // Eski sürümdeki sorun buydu: onay gelmeyince sayfa hiç açılmıyordu.
    socket
      .timeout(JOIN_TIMEOUT_MS)
      .emit("room", { room: room.trim() }, (timeoutError, response) => {
        setJoining(false);

        if (timeoutError || response?.status !== "ok") {
          setError(
            "Odaya bağlanılamadı. Sunucu uyanıyor olabilir, birkaç saniye sonra tekrar deneyin."
          );
          return;
        }

        dispatch(setUsername(username.trim()));
        dispatch(setRoom(room.trim()));
        router.push("/chat");
      });
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

        {!isReady && slowConnection && !error && (
          <p className="text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            Sunucu uyandırılıyor. Ücretsiz sunucu bir süre kullanılmayınca
            uykuya geçtiği için ilk bağlantı bir dakikayı bulabilir.
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed p-3 rounded-lg text-white font-semibold transition-colors cursor-pointer"
        >
          {!isReady
            ? "Sunucuya bağlanılıyor..."
            : joining
            ? "Odaya giriliyor..."
            : "Sohbete Başla"}
        </button>
      </form>
    </main>
  );
};

export default JoinForm;
