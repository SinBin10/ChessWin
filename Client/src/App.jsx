import { useEffect } from "react";
import { io } from "socket.io-client";

const App = () => {
  useEffect(() => {
    const socket = io("http://localhost:3000");
    return () => {
      socket.disconnect();
    };
  }, []);
  return <h1>Socket connected</h1>;
};

export default App;
