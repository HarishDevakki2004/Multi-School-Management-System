// // src/hooks/useWebSocket.js

// import { useEffect, useRef, useCallback } from "react";

// export function useWebSocket(onMessage) {
//   const ws     = useRef(null);
//   const token  = localStorage.getItem("access_token");
//   const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

//   useEffect(() => {
//     if (!token) return;
//     ws.current = new WebSocket(`${WS_URL}/ws/notifications/${token}/`);

//     ws.current.onopen    = () => console.log("WS connected");
//     ws.current.onmessage = (e) => onMessage(JSON.parse(e.data));
//     ws.current.onclose   = () => console.log("WS closed");

//     return () => ws.current?.close();
//   }, [token]);

//   const send = useCallback((data) => {
//     if (ws.current?.readyState === WebSocket.OPEN)
//       ws.current.send(JSON.stringify(data));
//   }, []);

//   return { send };
// }