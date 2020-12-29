import { io } from "socket.io-client";
import React from "react";
import Jumbotron from "react-bootstrap/Jumbotron";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

import Chessboard from "chessboardjsx"; // used for the chessboard React component
import Chess from "chess.js"; // used for chess logic validation (game rules) and to generate FENs

// Note, if you are unfamilliar with what a FEN is
// A FEN is a string of characters used to represent a chess position
// You can read more about it here : https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inGame: false, // controls rendering of the chessboard component
      passwordCreationInput: "", // input box for password creation
      gameJoinInput: "", // input box for game joining
      password: "", // when a socket event is received with this value, start the game
      userSocket: "", // the user's client socket object
      userSocketId: "", // the user's client socket ID
      opponentSocketId: "", // the opponent's socket ID
      userColor: "white",
      opponentColor: "black",
      turnToMove: "white", // used to determine if move events should trigger for the player
      currentPositionFen: "", // used to render the current chess position for the client
      userInfoMessage: "", // will be used to render info for the user
      chessGameObject: new Chess(), // the chess game object used to validate chess logic
      sourceSquare: "", // where the client's most recent mouse over event was (not holding down the mouse)
      targetSquare: "", // where the client's most recent drag over event was (holding down the mouse)
    };
    let socketTemp = io("http://localhost:8080");
    socketTemp.on("connect", () => {
      // initializing the client socket , and setting initial state
      this.setState({ userSocket: socketTemp, userSocketId: socketTemp.id });

      // when an opponent enters password and sends game request, and it is received by the host
      socketTemp.on("gameSend", (joinObj) => {
        console.log("message received from" + joinObj.senderId);

        // if the received password matches the host password -> start game
        if (this.state.inGame === false && this.state.password !== "") {
          console.log("message success from" + joinObj.senderId);

          this.setState({ opponentSocketId: joinObj.senderId });
          let newObj = {
            usrId: this.state.userSocketId,
            ownerId: joinObj.senderId,
            recipientColor: this.state.opponentColor,
            opponentColor: this.state.userColor,
          };
          // this sends a final handshake to the person joining the host's game via password

          socketTemp.emit("finalShake", newObj);
          this.setState({ inGame: true }); // renders the chessboard for the host
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

      // when a new fen is received, (that is validated by the sender) : update the recipient fen
      socketTemp.on("NewFenFromServer", (FENobj) => {
        // checks if the FEN is intended for the recipient
        if (this.state.userSocketId === FENobj.RecipientSocketID) {
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
    this.onMouseOverSquare = this.onMouseOverSquare.bind(this);
    this.onDragOverSquare = this.onDragOverSquare.bind(this);
  }

  // handles the submission of the 'join a game' submission button
  // emits a socket event to request to join the game
  handleJoinInput() {
    // sends the game join request

    let joinObject = {
      senderId: this.state.userSocketId,
      pw: this.state.gameJoinInput,
    };

    this.state.userSocket.emit("JoinGame", joinObject); // user asking to join another player's game
    this.setState({ gameJoinInput: "" });
  }

  // handles input changes on the 'join a game' input  section
  handleJoinInputChange(ev) {
    console.log(ev.target.value);
    this.setState({ gameJoinInput: ev.target.value });
  }

  // handles input submissions on the 'create a game' creation button
  handleCreationInput() {
    this.setState({ password: this.state.passwordCreationInput });
    this.setState({ passwordCreationInput: "" });

    this.setState({ currentPositionFen: this.state.chessGameObject.fen() });
  }

  // handles input changes on the 'create a game' section
  handleCreationInputChange(ev) {
    console.log(ev.target.value);
    this.setState({ passwordCreationInput: ev.target.value });
  }

  // the object {src , targ} is needed for ValidateMove to trigger properly, even though it isnt used
  // this has to do with how the chessboardjsx library triggers onDrop events
  ValidateMove = ({
    src = this.state.sourceSquare,
    targ = this.state.targetSquare,
  }) => {
    console.log("move being validated");
    if (src !== targ && this.state.chessGameObject.game_over() !== true) {
      this.state.chessGameObject.move({
        from: src,
        to: targ,
        promotion: "q",
      });
      if (this.state.chessGameObject.game_over() !== true) {
        console.log("Fen about to send off");
        this.setState({ currentPositionFen: this.state.chessGameObject.fen() });
        this.SendNewFen(this.state.chessGameObject.fen(), {
          from: this.state.sourceSquare,
          to: this.state.targetSquare,
          promotion: "q",
        });
      } else {
        // the move that was just made ended the game
        console.log("GAME OVER");
        this.setState({ currentPositionFen: this.state.chessGameObject.fen() });
        this.SendNewFen(this.state.chessGameObject.fen(), {
          from: this.state.sourceSquare,
          to: this.state.targetSquare,
          promotion: "q",
        });
      }
    }
  };

  // Chessboard component onDrop prop triggers ValidateMove() which triggers the SendNewFen function
  // sends a new FEN position to the opponent
  SendNewFen(NewFEN, move) {
    this.state.userSocket.emit("PositionSend", {
      FEN: NewFEN,
      RecipientSocketID: this.state.opponentSocketId,
      move: move,
    });
  }

  // triggered by the Chessboard component's onMouseOverSquare prop
  // sets the state of source sqare to the most recently moused over square
  // moused over meaning: currently hovered over but not clicking at all
  onMouseOverSquare = (sq) => {
    this.setState({ sourceSquare: sq });
    //console.log("Mouse Over: " + sq);
  };

  // triggered by the Chessboard component's onDragOverSquare prop
  // sets the state of target square to the currently dragged over square
  // dragged over meaning: currently hovered over while clicking
  onDragOverSquare = (sq) => {
    if (this.state.sourceSquare !== sq) {
      this.setState({ targetSquare: sq });
      //console.log("Drag over: " + sq);
    }
  };
  render() {
    const inGame = this.state.inGame;
    let UserMenu;
    // renders the chessboard component only if the user is in a game
    // if not, renders the menu , so that they can enter a game from it
    if (inGame === false) {
      UserMenu = (
        <Container className="p-3">
          <Jumbotron>
            <h1>Enter your game password</h1>
            <input
              value={this.state.passwordCreationInput}
              onChange={this.handleCreationInputChange}
            ></input>
            <Button onClick={this.handleCreationInput}>create game</Button>
            <h1>join with password</h1>
            <input
              value={this.state.gameJoinInput}
              onChange={this.handleJoinInputChange}
            ></input>

            <Button onClick={this.handleJoinInput}>join game</Button>
          </Jumbotron>
        </Container>
      );
    } else {
      UserMenu = (
        <div>
          <Chessboard
            position={this.state.currentPositionFen}
            orientation={this.state.userColor}
            onMouseOverSquare={this.onMouseOverSquare}
            onDragOverSquare={this.onDragOverSquare}
            onDrop={this.ValidateMove}
          />
        </div>
      );
    }
    return <div>{UserMenu}</div>;
  }
}

export default App;
