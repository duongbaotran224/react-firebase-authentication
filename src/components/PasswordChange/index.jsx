import React, { Component } from 'react'
import {withFirebase} from '../Firebase'

const PasswordChangePage = () => (
  <div>
    <h1>PasswordChange</h1>
    <PasswordChangeForm/>
  </div>
)

const INITIAL_STATE = {
  passwordOne: "",
  passwordTwo: "",
  error: null 
}
class PasswordChangeFormBase extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
       ...INITIAL_STATE
    };
  };
  

  onChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  onSubmit = event => {
    const {passwordOne} = this.state;

    this.props.firebase
    .doPasswordUpdate(passwordOne)
    .then(() => {
      this.setState({...INITIAL_STATE})
    })
    .catch(error => {
      this.setState({error})
    });

    event.preventDefault();
  }
  
  render() {
    const {passwordOne, passwordTwo, error} = this.state;
    const isInvalid = passwordOne !== passwordTwo || passwordOne === '';

    return (
      <form onSubmit={this.onSubmit}>

        <input name="passwordOne"
               value={passwordOne} 
               placeholder="New Password"
               type="password" 
               onChange={this.onChange} 
        />
        <input name="passwordTwo"
               value={passwordTwo} 
               placeholder="Confirm New Password"
               type="password" 
               onChange={this.onChange} 
        />

        <button disabled={isInvalid} type="submit">
          Reset My Password
        </button>

        {error && <p>{error.message}</p>}

      </form>
        
    )
  }
}

const PasswordChangeForm = withFirebase(PasswordChangeFormBase);

export default PasswordChangeFormBase;
export {PasswordChangeForm, PasswordChangePage};