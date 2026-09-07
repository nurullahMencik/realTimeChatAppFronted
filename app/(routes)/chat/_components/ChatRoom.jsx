"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { IoSend } from "react-icons/io5";
import { MdOutlineArrowBackIos } from "react-icons/md";
import { useSocket } from "@/hooks/useSocket";
import { leaveRoom } from "@/redux/chatSlice";
import MessageBubble from "./MessageBubble";

const formatTime = (date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

// Eski sürümler mesajı {message, date} olarak gönderiyordu; ikisini de destekle.
const normalize = (data) => ({
  id: data.id ?? createId(),
  username: data.username ?? "Bilinmeyen",
  text: data.text ?? data.message ?? "",
  time: data.time ?? data.date ?? "",
});

const STATUS_LABEL = {
  connected: "Çevrimiçi",
  connecting: "Bağlanılıyor...",
  disconnected: "Bağlantı koptu",
};

const ChatRoom = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { socket, status } = useSocket();
  const { username, room, hydrated } = useSelector((state) => state.chat);

  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  // Oturum bilgisi yoksa (doğrudan /chat adresine gelinmişse) giriş ekranına dön.
  // sessionStorage okunmadan karar vermemek için `hydrated` beklenir.
  useEffect(() => {
    if (hydrated && (!username || !room)) router.replace("/");
  }, [hydrated, username, room, router]);

  // Odaya katıl. Bağlantı koparsa status değişir ve bu effect yeniden çalışır,
  // böylece yeniden bağlandığında odaya otomatik geri girilir.
  useEffect(() => {
    if (!socket || status !== "connected" || !room) return;
    socket.emit("room", { room });
  }, [socket, status, room]);

  useEffect(() => {
    if (!socket) return;

    const onMessage = (data) => {
      setMessages((prev) => [...prev, normalize(data)]);
    };

    const onSystemMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        { id: createId(), system: true, text: data?.text ?? "" },
      ]);
    };

    socket.on("messageReturn", onMessage);
    socket.on("systemMessage", onSystemMessage);

    return () => {
      socket.off("messageReturn", onMessage);
      socket.off("systemMessage", onSystemMessage);
    };
  }, [socket]);

  // Yeni mesaj geldiğinde en alta kaydır.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(
    (event) => {
      event?.preventDefault();

      const text = draft.trim();
      if (text === "" || !socket || status !== "connected") return;

      const payload = {
        id: createId(),
        username,
        text,
        room,
        time: formatTime(new Date()),
      };

      socket.emit("message", payload);
      setMessages((prev) => [...prev, normalize(payload)]);
      setDraft("");
    },
    [draft, socket, status, username, room]
  );

  const handleLeave = () => {
    if (socket && room) socket.emit("leave", { room });
    dispatch(leaveRoom());
  };

  if (!hydrated || !username || !room) return null;

  return (
    <main className="bg-slate-950 min-h-screen flex justify-center items-center p-0 sm:p-4">
      <div className="w-full max-w-md h-screen sm:h-[90vh] bg-slate-100 flex flex-col sm:rounded-2xl overflow-hidden shadow-xl">
        <header className="bg-slate-800 px-3 py-3 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleLeave}
            aria-label="Odadan çık"
            className="text-white cursor-pointer p-1"
          >
            <MdOutlineArrowBackIos className="size-6" />
          </button>

          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold uppercase shrink-0">
            {room.charAt(0)}
          </div>

          <div className="min-w-0">
            <h1 className="text-white font-semibold truncate">{room}</h1>
            <p
              className={`text-xs ${
                status === "connected" ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {STATUS_LABEL[status]} &middot; {username}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {messages.length === 0 && (
            <p className="text-center text-sm text-slate-500 mt-8">
              Henüz mesaj yok. İlk mesajı siz yazın.
            </p>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.username === username && !message.system}
            />
          ))}

          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={sendMessage}
          className="flex gap-2 p-3 border-t border-slate-300 bg-white shrink-0"
        >
          <input
            className="flex-1 px-4 py-3 text-slate-900 bg-slate-100 rounded-full outline-none placeholder-slate-400"
            type="text"
            autoComplete="off"
            placeholder="Mesaj yazın..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            type="submit"
            disabled={draft.trim() === "" || status !== "connected"}
            aria-label="Gönder"
            className="w-12 h-12 shrink-0 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-full flex justify-center items-center transition-colors cursor-pointer"
          >
            <IoSend className="text-white text-xl" />
          </button>
        </form>
      </div>
    </main>
  );
};

export default ChatRoom;
