import React from 'react';
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Form from "react-bootstrap/Form";


class ChessMenu extends React.Component {
    render(){
        return (
        <div>
          <div class="form-container">
            <Form id="mainForm">
              <Form.Group controlId="formCreateGame">
                <Form.Label>Enter your game password</Form.Label>
                <Form.Control
                  type="text"
                  value={this.props.passwordCreationInput}
                  onChange={this.props.handleCreationInputChange}
                />
                <Button variant="primary" onClick={this.props.handleCreationInput}>
                  Create Game
                </Button>
                <div onChange={this.props.setColor}>
                  <Form.Check
                    name="colorSelect"
                    type="radio"
                    inline
                    label="white"
                    value="white"
                  ></Form.Check>
                  <Form.Check
                    name="colorSelect"
                    type="radio"
                    inline
                    label="black"
                    value="black"
                  ></Form.Check>
                </div>
                <Alert
                  variant="info"
                  show={this.props.userInfoMessage === "" ? false : true}
                >
                  {this.props.userInfoMessage}
                </Alert>
              </Form.Group>

              <Form.Group>
                <Form.Label>Join with password</Form.Label>
                <Form.Control
                  value={this.props.gameJoinInput}
                  onChange={this.props.handleJoinInputChange}
                />

                <Button variant="primary" onClick={this.props.handleJoinInput}>
                  Join Game
                </Button>
              </Form.Group>
            </Form>
          </div>
        </div>
      );
    } 
}
export default ChessMenu;

