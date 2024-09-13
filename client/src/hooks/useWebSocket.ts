import { useEffect, useRef } from "react";

interface WebSocketOptions {
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  shouldReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

const useWebSocket = (
  url: string,
  options?: WebSocketOptions
): WebSocket | null => {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const cleanupRef = useRef<() => void>(() => {});

  useEffect(() => {
    const {
      onOpen,
      onMessage,
      onError,
      onClose,
      shouldReconnect = true,
      reconnectInterval = 3000,
      maxReconnectAttempts = 10,
    } = options || {};

    let ws: WebSocket;

    const connect = () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      ws = new WebSocket(url);
      socketRef.current = ws;

      const handleOpen = (event: Event) => {
        reconnectAttemptsRef.current = 0;
        onOpen?.(event);
      };

      const handleMessage = (event: MessageEvent) => {
        onMessage?.(event);
      };

      const handleError = (event: Event) => {
        onError?.(event);
      };

      const handleClose = (event: CloseEvent) => {
        onClose?.(event);

        if (
          shouldReconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.addEventListener("open", handleOpen);
      ws.addEventListener("message", handleMessage);
      ws.addEventListener("error", handleError);
      ws.addEventListener("close", handleClose);

      cleanupRef.current = () => {
        ws.removeEventListener("open", handleOpen);
        ws.removeEventListener("message", handleMessage);
        ws.removeEventListener("error", handleError);
        ws.removeEventListener("close", handleClose);
      };
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (socketRef.current) {
        cleanupRef.current();
        socketRef.current.close();
      }
    };
  }, [url, options]);

  return socketRef.current;
};

export default useWebSocket;
