import React from 'react';
import { withRouter } from 'react-router-dom';
import {compose} from 'recompose';

import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';
import AuthUserContext from './context';

const withAuthorization = condition => Component => {
  
  class withAuthorization extends React.Component {

    componentDidMount() {
      this.listener = this.props.firebase.onAuthUserListener(
        authUser => {
          if (!condition(authUser)) {
            this.props.history.push(ROUTES.SIGN_IN);
          }
        }, 
        () => this.props.history.push(ROUTES.SIGN_IN),
      );
    } 

    componentWillUnmount() {
      this.listener()
    }

    render() {
      return (
        <AuthUserContext.Consumer>
          {authUser => 
            condition(authUser) ? <Component {...this.props}/> : null
          }
        </AuthUserContext.Consumer>
      )
    }
  };

  return compose(
    withFirebase,
    withRouter,
  )(withAuthorization);
  
};

export default withAuthorization;
