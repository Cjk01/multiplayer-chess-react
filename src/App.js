import { io } from "socket.io-client";
import React from "react";
import Chessboard from "chessboardjsx";
import Chess from "chess.js";
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
      userColor: "white",
      opponentColor: "black",
      turnToMove: "",
      currentPositionFen: "",
      userInfoMessage: "",
      chessGameObject: new Chess(),
      sourceSquare: "",
      targetSquare: "",
    };
    let socketTemp = io("http://localhost:8080");
    socketTemp.on("connect", () => {
      // when an opponent enters password and sends game request
      this.setState({ userSocket: socketTemp, userSocketId: socketTemp.id });
      console.log("HEY :" + this.state.userSocketId);
      socketTemp.on("gameSend", (joinObj) => {
        console.log("message received from" + joinObj.senderId);
        if (this.state.inGame === false && this.state.password !== "") {
          console.log("message success from" + joinObj.senderId);

          this.setState({ opponentSocketId: joinObj.senderId });
          let newObj = {
            usrId: this.state.userSocketId,
            ownerId: joinObj.senderId,
            recipientColor: this.state.opponentColor,
            opponentColor: this.state.userColor,
          };
          socketTemp.emit("finalShake", newObj); // final handshake sent
          this.setState({ inGame: true });
        }
      });
      socketTemp.on("NewCurrentPosition", (FENstring) => {
        //updates the new current chess position
        this.setState({ currentPositionFen: FENstring });
      });
      socketTemp.on(socketTemp.id, (oppObj) => {
        console.log("final shake ");
        this.setState({ opponentSocketId: oppObj.usrId }); // receives final handshake
        this.setState({ userColor: oppObj.recipientColor });
        this.setState({ opponentColor: oppObj.opponentColor });
        this.setState({ inGame: true });
        this.setState({ currentPositionFen: this.state.chessGameObject.fen() });
      });
      socketTemp.on("NewFenFromServer", (FENobj) => {
        console.log("outside scope");
        if (this.state.userSocketId === FENobj.RecipientSocketID) {
          console.log("inside scope");
          this.setState({
            currentPositionFen: FENobj.FEN,
          });
          this.state.chessGameObject.move(FENobj.move);
        }
      });
    });
    this.handleCreationInput = this.handleCreationInput.bind(this);
    this.handleJoinInput = this.handleJoinInput.bind(this);
    this.handleCreationInputChange = this.handleCreationInputChange.bind(this);
    this.handleJoinInputChange = this.handleJoinInputChange.bind(this);
    this.ValidateMove = this.ValidateMove.bind(this);
    this.SendNewFen = this.SendNewFen.bind(this);
    this.onSquareClick = this.onSquareClick.bind(this);
    this.onMouseOverSquare = this.onMouseOverSquare.bind(this);
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

    this.setState({ currentPositionFen: this.state.chessGameObject.fen() });
  }
  handleCreationInputChange(ev) {
    console.log(ev.target.value);
    this.setState({ passwordCreationInput: ev.target.value });
  }
  ValidateMove = ({ src, targ }) => {
    console.log("move being validated");
    this.state.chessGameObject.move({
      from: this.state.sourceSquare,
      to: this.state.targetSquare,
      promotion: "q",
    });
    console.log("Fen about to send off");
    this.setState({ currentPositionFen: this.state.chessGameObject.fen() });
    this.SendNewFen(this.state.chessGameObject.fen(), {
      from: this.state.sourceSquare,
      to: this.state.targetSquare,
      promotion: "q",
    });
  };
  SendNewFen(NewFEN, move) {
    this.state.userSocket.emit("PositionSend", {
      FEN: NewFEN,
      RecipientSocketID: this.state.opponentSocketId,
      move: move,
    });
  }
  onSquareClick = (sq) => {
    this.setState({ sourceSquare: sq });
    console.log("square clicked");
  };

  onMouseOverSquare = (sq) => {
    this.setState({ targetSquare: sq });
    console.log("Mouse over: " + sq);
  };
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
          <Chessboard
            position={this.state.currentPositionFen}
            orientation={this.state.userColor}
            onMouseOverSquare={this.onSquareClick}
            onDragOverSquare={this.onMouseOverSquare}
            onDrop={this.ValidateMove}
          />
        </div>
      );
    }
    return <div>{UserMenu}</div>;
  }
}

export default App;
