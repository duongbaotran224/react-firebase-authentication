import React, { Component } from 'react'
import { compose } from 'recompose';

import { AuthUserContext, withAuthorization, withEmailVerification } from "../Session";
import { withFirebase } from '../Firebase';

const HomePage = () => (
  <div>
    <h1>Home</h1>
    <p>The Home Page is accessible by every signed in user.</p>

    <Messages />
  </div>
);


class MessagesBase extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      messages: [],
      text: ''
    }
  }

  componentDidMount() {
    this.setState({ loading: true })

    this.props.firebase.messages().on('value', snapshot => {
      const messageObject = snapshot.val();
      if (messageObject) {
        const messageList = Object.keys(messageObject).map(key => ({
          ...messageObject[key],
          uid: key
        }))

        this.setState({
          loading: false,
          messages: messageList
        })
      } else {
        this.setState({
          loading: false,
          messages: null
        })
      }
    })
  }

  componentWillUnmount() {
    this.props.firebase.messages().off()
  }

  onChangeText = event => {
    this.setState({ text: event.target.value })
    event.preventDefault()
  }

  onCreateMessage = (event, authUser) => {
    this.props.firebase.messages().push({
      text: this.state.text,
      userId: authUser.uid,
      creatAt: this.props.firebase.serverValue.TIMESTAMP
    })

    this.setState({ text: '' })
    event.preventDefault()
  }

  onRemoveMessage = uid => {
    this.props.firebase.message(uid).remove();
  }

  onEditMessage = (message, text) => {
    const { uid, ...messageSnapshot } = message
    this.props.firebase.message(uid).set({
      ...messageSnapshot,
      text,
      editedAt: this.props.firebase.serverValue.TIMESTAMP
    })
    // console.log(messageSnapshot)
  }

  render() {
    const { loading, messages, text } = this.state
    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <div>
            {loading && <p>Loading...</p>}

            {messages ? (
              <MessagesList
                messages={messages}
                onRemoveMessage={this.onRemoveMessage}
                onEditMessage={this.onEditMessage}
              />
            ) : (
                <div>There are no messages ...</div>
              )}

            <form onSubmit={event => this.onCreateMessage(event, authUser)}>
              <input
                type="text"
                value={text}
                onChange={this.onChangeText}
              />
              <button type="submit">Send</button>
            </form>

          </div>
        )}
      </AuthUserContext.Consumer>
    )
  }
}

const MessagesList = ({ messages, onRemoveMessage, onEditMessage }) => {
  return (
    <ul>
      {messages.map(message => (
        <MessageItem
          key={message.uid}
          message={message}
          onRemoveMessage={onRemoveMessage}
          onEditMessage={onEditMessage}
        />
      ))}
    </ul>
  )
}


class MessageItem extends Component {
  constructor(props) {
    super(props)

    this.state = {
      editMode: false,
      editText: this.props.message.text
    }
  }

  onToggleEditMode = () => {
    this.setState(state => ({
      editMode: !state.editMode,
      editText: this.props.message.text
    }))
  }

  onChangeEditText = event => {
    this.setState({
      editText: event.target.value
    })
  }

  onSaveEditText = () => {
    this.props.onEditMessage(this.props.message, this.state.editText)
    this.setState({ editMode: false })
  }

  render() {
    const { message, onRemoveMessage } = this.props
    const { editText, editMode } = this.state

    return (
      <li>
        {editMode ? (
          <input
            type="text"
            value={editText}
            onChange={this.onChangeEditText}
          />
        ) : (
            <span>
              <strong>{message.userId}</strong>{message.text}
              {message.editedAt && <span>(Edited)</span>}
            </span >

          )
        }

        {
          editMode ? (
            <div>
              <button onClick={this.onSaveEditText}>Save</button>
              <button onClick={this.onToggleEditMode}>Reset</button>
            </div>
          ) : (
              <button onClick={this.onToggleEditMode}>Edit</button>
            )
        }
        <button onClick={() => onRemoveMessage(message.uid)}>Delete</button>
      </li >
    )
  }
}


const Messages = withFirebase(MessagesBase)

const condition = authUser => !!authUser;

export default compose(
  withEmailVerification, // kiem tra xem user da confirm email chua roi moi show home's comp
  withAuthorization(condition)
)(HomePage); 