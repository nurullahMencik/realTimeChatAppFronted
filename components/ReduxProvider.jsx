"use client";

import { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { readStoredSession, store } from "@/redux/store";
import { hydrate } from "@/redux/chatSlice";

/**
 * İlk render'dan sonra sessionStorage'daki oturumu store'a yazar.
 * Sayfa içeriği beklemeden render edilir; oturum gerektiren ekranlar
 * state.chat.hydrated bayrağına bakar.
 */
const SessionLoader = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrate(readStoredSession() ?? {}));
  }, [dispatch]);

  return children;
};

export const ReduxProvider = ({ children }) => {
  return (
    <Provider store={store}>
      <SessionLoader>{children}</SessionLoader>
    </Provider>
  );
};
