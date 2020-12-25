import { io } from 'socket.io-client';
function App() {
  
  const socket = io('http://localhost:8080');
  // client-side socket handlers
  socket.on("connect", () => {
  console.log(socket.id); //Ex.  x8WIv7-mJelg7on_ALbx
  console.log(socket.connected);
});

socket.on("disconnect", () => {
  console.log(socket.id); // undefined
  console.log(socket.connected);
});
  return (
    "Hello people"
  );
}

export default App;
