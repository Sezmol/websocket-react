import useWebSocket from "../hooks/useWebSocket";

const Header = () => {
  const onSocketMessage = (e: MessageEvent) => {
    console.log(e.data);
  };

  useWebSocket("ws://localhost:8080", { onMessage: onSocketMessage });

  return <div>Header</div>;
};

export default Header;
