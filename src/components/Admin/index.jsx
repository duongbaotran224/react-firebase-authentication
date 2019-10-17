import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { compose } from 'recompose';

import { withFirebase } from '../Firebase';
import { withAuthorization, withEmailVerification } from '../Session';
import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes'

const AdminPage = () => (
  <div>
    <h1>Admin Page</h1>
    <p>The Admin Page is accessible by every signed in admin user.</p>

    <Switch>
      <Route exact path={ROUTES.ADMIN_DETAIL} component={UserItem}/>
      <Route exact path={ROUTES.ADMIN} component={UserList}/>
    </Switch>
  </div>
);


class UserListBase extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      loading: false,
      users: []
    }
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.users().on('value', snapshot => {
      const usersObject = snapshot.val() || {};
      const usersList = Object.keys(usersObject).map(key => ({
        ...usersObject[key],
        uid: key
      }));

      this.setState({
        loading: false,
        users: usersList
      })
    })
  }

  componentWillUnmount() {
    this.props.firebase.users().off()
  }
  

  render() {
    const {loading, users} = this.state

    return (
      <div>
        <h2>Users</h2>
        {loading && <div>Loading...</div>}

        <ul>
          {users.map(user => (
            <li key={user.uid}>
              <span>
                <strong>ID:</strong>{user.uid}
              </span>
              <span>
                <strong>E-mail:</strong>{user.email}
              </span>
              <span>
                <strong>Username:</strong>{user.username}
              </span>
              <span>
                <Link 
                  to={{
                    pathname: `${ROUTES.ADMIN}/${user.uid}`,
                    state: {user}
                  }}
                >
                  Details
                </Link>
              </span>
            </li> 
          ))}
        </ul>
      </div>
    )
  }
}


class UserItemBase extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      loading: false,
      user: null,
      ...props.location.state
    }
  };
  
  componentDidMount() {
    if (this.state.user) {
      return;
    }
    this.setState({loading: true})

    this.props.firebase
      .user(this.props.match.params.id)
      .on('value', snapshot => {
        this.setState({
          loading: false,
          user: snapshot.val()
        })
      })
  };

  componentWillUnmount() {
    this.props.firebase.user(this.props.match.params.id).off()
  };
  
  onSendPasswordResetEmail = () => {
    this.props.firebase.doPasswordReset(this.state.user.email)
  };

  render() {
    const {loading, user} = this.state;
    
    return (
      <div>
        <h2>User {this.props.match.params.id} </h2>
        {loading && <p>Loading...</p>} 

        {user && (
          <div>
            <span><strong>ID:</strong> {user.uid} </span>
            <span><strong>Email:</strong> {user.email} </span>
            <span><strong>Username:</strong> {user.username} </span>
            <span>
              <button type="button" onClick={this.onSendPasswordResetEmail}>
                Send Password Reset
              </button>
            </span>
          </div>
        )}
      </div>
    )
  }
}



const condition = authUser => {
  return authUser && !!authUser.roles[ROLES.ADMIN];
}
const UserList = withFirebase(UserListBase)
const UserItem = withFirebase(UserItemBase)

export default compose(
  withFirebase, 
  withEmailVerification,
  withAuthorization(condition)
)( AdminPage );