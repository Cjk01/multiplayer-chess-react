import { io } from "socket.io-client";
function App() {
  const socket = io("http://localhost:8080");

  // client-side socket handlers
  socket.on("connect", () => {
    console.log(socket.id); //Ex.  x8WIv7-mJelg7on_ALbx
  });
  socket.on("Hello", (msg) => {
    console.log("message from server: \n" + msg);
    console.log("Thanks for the message, server!");
  });
  socket.on("disconnect", () => {
    console.log(socket.id); // undefined
    console.log(socket.connected);
  });
  return (
    <div>
      <input id="inputty" type="text" />

      <h1> is connected to server</h1>
    </div>
  );
}

export default App;
