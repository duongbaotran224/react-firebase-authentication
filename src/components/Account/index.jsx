import React, {Component} from 'react';
import {compose} from 'recompose'

import {PasswordChangeForm} from '../PasswordChange'
import {PasswordForgetForm} from '../PasswordForget'
import {withAuthorization, AuthUserContext, withEmailVerification} from '../Session';
import {withFirebase} from '../Firebase';

const SIGN_IN_METHODS = [
  {
    id: 'password',
    provider: null,
  },
  {
    id: 'google.com',
    provider: 'googleProvider',
  },
  {
    id: 'facebook.com',
    provider: 'facebookProvider',
  },
  {
    id: 'twitter.com',
    provider: 'twitterProvider',
  },
];

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <div>
        <h1>Account: {authUser.email}</h1>
        <PasswordChangeForm/>
        <PasswordForgetForm/>
        <LoginManagement authUser={authUser} />
      </div>
    )}
  </AuthUserContext.Consumer>
);


class LoginManagementBase extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
      activeSignInMethods: [],
      error: null,
    }
  }

  componentDidMount() {
    this.fetchSignInMethods()
  }
  

  fetchSignInMethods = () => {
    this.props.firebase.auth
      .fetchSignInMethodsForEmail(this.props.authUser.email)
      .then(activeSignInMethods => {
        this.setState({
          activeSignInMethods,
          error: null
        })
      })
      .catch(error => {
        this.setState({error})
      })
  };

  onSocialLoginLink = provider => {
    // console.log(this.props.firebase)
    this.props.firebase.auth.currentUser
      .linkWithPopup(this.props.firebase[provider])
      .then(this.fetchSignInMethods)
      .catch(error => {
        this.setState({error})
      })

  };

  onUnLink = providerId => {
    this.props.firebase.auth.currentUser
      .unlink(providerId)
      .then(this.fetchSignInMethods)
      .catch(error => {
        this.setState({error})
      })

  }

  onDefaultLoginLink = (password) => {
    const credential = this.props.firebase.emailAuthProvider.credential(
      this.props.authUser.email,
      password
    )
    
    this.props.firebase.auth.currentUser
      .linkAndRetrieveDataWithCredential(credential)
      .then(this.fetchSignInMethods)
      .catch(error => {
        this.setState({error})
      })
  };
  
  render() {
    const { activeSignInMethods, error } = this.state;

    return (
      <div>
        Sign In Methods: 
        <ul>
          {SIGN_IN_METHODS.map(signInMethod => {

            const onlyOneLeft = activeSignInMethods.length === 1;            
            const isEnabled = activeSignInMethods.includes(
              signInMethod.id
            );

            return (
              <li key={signInMethod.id}>

                {
                  signInMethod.id === 'password' ? (
                    <DefaultLoginToggle
                      onlyOneLeft={onlyOneLeft}
                      isEnabled={isEnabled}
                      signInMethod={signInMethod}
                      onLink={this.onDefaultLoginLink}
                    />
                  ) : (
                    <SocialLoginToggle
                      onlyOneLeft={onlyOneLeft}
                      isEnabled={isEnabled}
                      signInMethod={signInMethod}
                      onLink={this.onSocialLoginLink}
                      onUnLink={this.onUnLink}
                    />
                  )
                }
                
              </li>
            ) 
          })}
        </ul>
        {error && error.message}
      </div>
    )
  }
}


class DefaultLoginToggle extends Component {
  constructor(props) {
    super(props)

    this.state = {
      passwordOne: "",
      passwordTwo: "",
    }
  }

  onChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  onSubmit = event => {
    this.setState({
      passwordOne: "" ,
      passwordTwo: "" ,
    })
    this.props.onLink(this.state.passwordOne)
    event.preventDefault()
  }

  render() {
    const {isEnabled, signInMethod, onUnLink, onlyOneLeft} = this.props
    const {passwordOne, passwordTwo} = this.state
    const isInvalid = passwordOne !== passwordTwo || passwordOne === "" ;

    return isEnabled ? (
      <button
        type="button"
        onClick={() => onUnLink(signInMethod.id)}
        disabled={onlyOneLeft}
      >
        Deactivate {signInMethod.id}
      </button>
    ) : (
      <form onSubmit={this.onSubmit}>
        <input
          name="passwordOne"
          value={passwordOne}
          onChange={this.onChange}
          type="password"
          placeholder="New Password"
        />
        <input
          name="passwordTwo"
          value={passwordTwo}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm New Password"
        />
        <button disabled={isInvalid} type="submit">
          Link {signInMethod.id}
        </button>
      </form>
    )
  }
};


const SocialLoginToggle = ({isEnabled, signInMethod,onLink, onUnLink, onlyOneLeft}) => (
  isEnabled ? ( 
    <button type="button" 
            onClick={() => onUnLink(signInMethod.id)}
            disabled={onlyOneLeft}
    >
      Deactive {signInMethod.id}
    </button>
  ) : (
    <button type="button" 
            onClick={() => onLink(signInMethod.provider)}
    >
      Link {signInMethod.id}
    </button>
  )
);

const LoginManagement = withFirebase(LoginManagementBase);

const condition = authUser => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
)(AccountPage) 