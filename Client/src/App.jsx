// client/src/App.js

import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to the Socket.io server
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    // Handle connection event
    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    // Handle disconnection event
    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    // Cleanup on component unmount
    return () => newSocket.close();
  }, []);

  return (
    <div className="App">
      <h1>Socket.io Client</h1>
      {/* Additional React app content */}
    </div>
  );
}

export default App;
