import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { syncClock } from "../utils/timeSync";

/**
 * Custom React hook for managing Socket.io connection
 * Handles connection, clock synchronization, and cleanup
 *
 * @param {string} serverUrl - Server URL (e.g. http://localhost:4000)
 * @returns {object} { socket, connected, clockSynced }
 */
export function useSocket(serverUrl) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [clockSynced, setClockSynced] = useState(false);

  useEffect(() => {
    socketRef.current = io(serverUrl);

    socketRef.current.on("connect", async () => {
      console.log("✅ Connected to server");
      setConnected(true);
      await syncClock(socketRef.current); // sync clock on connect
      setClockSynced(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected from server");
      setConnected(false);
      setClockSynced(false);
    });

    return () => socketRef.current.disconnect();
  }, [serverUrl]);

  return { socket: socketRef.current, connected, clockSynced };
}
