import React, { Component } from 'react'
import {compose} from 'recompose';

import { withAuthorization, withEmailVerification } from "../Session";
import { withFirebase } from '../Firebase';

const HomePage = () => (
  <div>
    <h1>Home</h1>
    <p>The Home Page is accessible by every signed in user.</p>

    <Messages/>
  </div>
);


class MessagesBase extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
       loading: false,
       messages: []
    }
  }
  
  componentDidMount() {
    this.setState({loading: true})

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
  

  render() {
    const {loading, messages} = this.state
    return (
      <div>
        {loading && <p>Loading...</p>}

        {messages ? (
          <MessagesList messages={messages}/>
        ) : (
          <div>There are no messages ...</div>
        )}

      </div>
    )
  }
}

const MessagesList = ({messages}) => {
  return (
    <ul>
      {messages.map(message => (
        <MessageItem key={message.uid} message={message}/>
      ))}
    </ul>
  )
}

const MessageItem = ({message}) => (
  <li>
    <strong>{message.userId}</strong>{message.text}
  </li>
)

const Messages = withFirebase(MessagesBase)

const condition = authUser => !!authUser;

export default compose(
  withEmailVerification, // kiem tra xem user da confirm email chua roi moi show home's comp
  withAuthorization(condition)
)( HomePage );