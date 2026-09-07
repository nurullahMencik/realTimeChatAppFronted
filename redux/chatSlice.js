import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: "",
  room: "",
  // sessionStorage okunana kadar false kalır; yönlendirme kararları bunu bekler.
  hydrated: false,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setRoom: (state, action) => {
      state.room = action.payload;
    },
    // Sayfa yenilendiğinde sessionStorage'daki oturumu geri yükler.
    hydrate: (state, action) => {
      state.username = action.payload?.username ?? "";
      state.room = action.payload?.room ?? "";
      state.hydrated = true;
    },
    leaveRoom: (state) => {
      state.username = "";
      state.room = "";
    },
  },
});

export const { setUsername, setRoom, hydrate, leaveRoom } = chatSlice.actions;

export default chatSlice.reducer;
