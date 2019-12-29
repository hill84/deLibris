import React, { forwardRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { app } from '../../config/shared';
import { funcType, locationType } from '../../config/types';
import LoginForm from '../forms/loginForm';

const Login = forwardRef((props, ref) => (
	<div className="card-container pad-v" id="loginComponent" ref={ref}>
    <Helmet>
      <title>{app.name} | Login</title>
      <link rel="canonical" href={app.url} />
    </Helmet>
		<h2>Login</h2>
		<div className="card light">
			<LoginForm location={props.location} openSnackbar={props.openSnackbar} />
		</div>
		<Link to="/password-reset" className="sub-footer">Non ricordi la password?</Link>
	</div>
));

export default Login;

Login.propTypes = {
  location: locationType.isRequired,
  openSnackbar: funcType.isRequired
}