import { io } from "socket.io-client";
import React from "react";
import Chessboard from "chessboardjsx";
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inGame: false,
      passwordCreationInput: "",
      gameJoinInput: "",
      password: "",
      userSocket: "",
      userSocketId: "",
      opponentSocketId: "",
      userColor: "",
      opponentColor: "",
      currentPositionFen: "",
      userInfoMessage: "",
    };

    this.handleCreationInput = this.handleCreationInput.bind(this);
    this.handleJoinInput = this.handleJoinInput.bind(this);
    this.handleCreationInputChange = this.handleCreationInputChange.bind(this);
    this.handleJoinInputChange = this.handleJoinInputChange.bind(this);
  }

  componentDidMount() {
    this.connect();
  }
  connect() {
    let socketTemp = io("http://localhost:8080");
    socketTemp.on("connect", () => {
      // when an opponent enters password and sends game request
      this.setState({ userSocket: socketTemp, userSocketId: socketTemp.id });
      socketTemp.on("gameSend", (joinObj) => {
        console.log("message received from" + joinObj.senderId);
        if (this.state.inGame === false && this.state.password !== "") {
          console.log("message success from" + joinObj.senderId);
          this.setState({ opponentSocketId: joinObj.senderId });
          let newObj = {
            usrId: this.state.userSocketId,
            ownerId: joinObj.senderId,
          };
          socketTemp.emit("finalShake", newObj); // final handshake sent
          this.setState({ inGame: true });
        }
      });
      socketTemp.on("NewCurrentPosition", (FENstring) => {
        //updates the new current chess position
        this.setState({ currentPositionFen: FENstring });
      });
      socketTemp.on(socketTemp.id, (oppID) => {
        console.log("final shake ");
        this.setState({ opponentSocketId: oppID }); // receives final handshake

        this.setState({ inGame: true });
      });
    });
  }
  handleJoinInput() {
    // sends the game join request
    let joinObject = {
      senderId: this.state.userSocketId,
      pw: this.state.gameJoinInput,
    };
    this.state.userSocket.emit("JoinGame", joinObject);
    this.setState({ gameJoinInput: "" });
  }
  handleJoinInputChange(ev) {
    console.log(ev.target.value);
    this.setState({ gameJoinInput: ev.target.value });
  }
  handleCreationInput() {
    this.setState({ password: this.state.passwordCreationInput });
    this.setState({ passwordCreationInput: "" });
  }
  handleCreationInputChange(ev) {
    console.log(ev.target.value);
    this.setState({ passwordCreationInput: ev.target.value });
  }

  render() {
    const inGame = this.state.inGame;
    let UserMenu;
    if (inGame === false) {
      UserMenu = (
        <div>
          <h1>Enter your game password</h1>
          <input
            value={this.state.passwordCreationInput}
            onChange={this.handleCreationInputChange}
          ></input>
          <button onClick={this.handleCreationInput}>create game</button>
          <h1>join with password</h1>
          <input
            value={this.state.gameJoinInput}
            onChange={this.handleJoinInputChange}
          ></input>

          <button onClick={this.handleJoinInput}>join game</button>
        </div>
      );
    } else {
      UserMenu = (
        <div>
          <Chessboard position={this.state.currentPositionFen} />
        </div>
      );
    }
    return <div>{UserMenu}</div>;
  }
}

export default App;
