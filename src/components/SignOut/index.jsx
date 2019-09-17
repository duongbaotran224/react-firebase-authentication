import React from 'react';
import {withFirebase} from '../Firebase';

const SignOutButton = ({firebase}) => {
  return (
    <button type="button" onClick={firebase.doSignOut}>
      SignOut
    </button>
  )
}

export default withFirebase(SignOutButton)