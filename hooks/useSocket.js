"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

/**
 * Socket bağlantısını ve anlık bağlantı durumunu döner.
 * Durumlar: "connecting" | "connected" | "disconnected"
 */
export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("connecting");

  useEffect(() => {
    const instance = getSocket();
    setSocket(instance);
    setStatus(instance.connected ? "connected" : "connecting");

    const onConnect = () => setStatus("connected");
    const onDisconnect = () => setStatus("disconnected");
    const onError = () => setStatus("connecting");

    instance.on("connect", onConnect);
    instance.on("disconnect", onDisconnect);
    instance.on("connect_error", onError);

    return () => {
      instance.off("connect", onConnect);
      instance.off("disconnect", onDisconnect);
      instance.off("connect_error", onError);
    };
  }, []);

  return { socket, status };
};
