import React from 'react';
import { withRouter } from 'react-router-dom';
import {compose} from 'recompose';

import * as ROUTES from '../../constants/routes';
import { withFirebase } from '../Firebase';
import AuthUserContext from './context';

const withAuthorization = condition => Component => {
  
  class withAuthorization extends React.Component {

    componentDidMount() {
      this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
        if(authUser){
          this.props.firebase.user(authUser.uid)
          .once('value')
          .then(snapshot => {
            const dbUser = snapshot.val();

            // default empty roles
            if (!dbUser.roles) {
              dbUser.roles = {}
            };

            // merge auth and db user 
            authUser = {
              uid: dbUser.uid,
              email: dbUser.email,
              ...dbUser,
            }; 

            if (!condition(authUser)) {
              this.props.history.push(ROUTES.SIGN_IN);
            }
          })

        } 
        else this.props.history.push(ROUTES.SIGN_IN);
      })
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
