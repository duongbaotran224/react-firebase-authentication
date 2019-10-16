import React from 'react';
import {compose} from 'recompose';

import { withAuthorization, withEmailVerification } from "../Session";

const HomePage = () => (
  <div>
    <h1>Home</h1>
    <p>The Home Page is accessible by every signed in user.</p>
  </div>
);

const condition = authUser => !!authUser;

export default compose(
  withEmailVerification, // kiem tra xem user da confirm email chua roi moi show home's comp
  withAuthorization(condition)
)( HomePage );