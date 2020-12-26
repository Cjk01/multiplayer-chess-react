import { io } from "socket.io-client";
import React from "react";
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socket: "",
      UserID: "",
      OpponentID: "",
      input: "",
      sendTo: "",
      messages: [],
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputSubmit = this.handleInputSubmit.bind(this);
    this.handleSenderChange = this.handleSenderChange.bind(this);
  }
  componentDidMount() {
    this.connect();
  }
  connect() {
    let socketTemp = io("http://localhost:8080");

    // client-side socket handlers
    socketTemp.on("connect", () => {
      console.log(socketTemp.id); //Ex.  x8WIv7-mJelg7on_ALbx
      this.setState({ socket: socketTemp, UserID: socketTemp.id });
      console.log("UID: " + socketTemp.id);
      socketTemp.on("Hello", (msg) => {
        console.log(msg);
      });
      // reads out private message
      socketTemp.on(socketTemp.id, (receivedMsg) => {
        console.log(
          "message from" + receivedMsg.senderID + ": \n" + receivedMsg.message
        );
        let newmsg = receivedMsg.senderID + ": " + receivedMsg.message;
        console.log("Thanks for the message, " + receivedMsg.senderID + "!");
        this.setState({
          messages: [...this.state.messages, newmsg],
        });
      });
    });
  }

  handleInputChange(change) {
    console.log(change.target.value);
    this.setState({ input: change.target.value });
  }
  handleSenderChange(change) {
    console.log(change.target.value);
    this.setState({ sendTo: change.target.value });
  }
  handleInputSubmit() {
    let submission = this.state.input;
    //let sckt = this.state.socket;
    let Uid = this.state.UserID;
    let sendTo = this.state.sendTo;
    console.log("submission " + submission);
    let msgObj = {
      recipientID: sendTo,
      senderID: Uid,
      messageContent: submission,
    };
    console.log(msgObj);
    console.log(this.state.socket);
    this.state.socket.emit("PrivateMessage", msgObj);
    console.log("after private emit from client");
    let newMsg = Uid + ": " + submission;
    this.setState({
      messages: [...this.state.messages, newMsg],
      input: "",
      sendTo: "",
    });
    console.log(this.state.messages);
  }
  sendPrivateMessage(ev) {}
  render() {
    const messageList = this.state.messages.map((i) => (
      <li key={i + 1}>{i}</li>
    ));
    return (
      <div>
        <h1>User socket ID: {this.state.socket.id}</h1>

        <h1>enter sender ID</h1>
        <input value={this.state.sendTo} onChange={this.handleSenderChange} />
        <h1>enter message</h1>
        <input value={this.state.input} onChange={this.handleInputChange} />

        <button onClick={this.handleInputSubmit}>Send Message </button>

        <ul>{messageList}</ul>
      </div>
    );
  }
}

export default App;
