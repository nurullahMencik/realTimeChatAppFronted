import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";

export const STORAGE_KEY = "chat-session";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
});

// Kullanıcı adı ve oda bilgisi sekme boyunca saklanır; böylece
// /chat sayfası yenilendiğinde oturum kaybolmaz.
if (typeof window !== "undefined") {
  store.subscribe(() => {
    const { username, room } = store.getState().chat;
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ username, room })
      );
    } catch {
      // Özel sekme / kapalı depolama: yok sayılır.
    }
  });
}

export const readStoredSession = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
