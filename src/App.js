import { ThemeProvider } from '@material-ui/styles';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import PasswordResetForm from './components/forms/passwordResetForm';
import Layout from './components/layout';
import NewFeature from './components/newFeature';
import AboutPage from './components/pages/aboutPage';
import AddBook from './components/pages/addBook';
import Admin from './components/pages/admin/admin';
import AuthorPage from './components/pages/authorPage';
import AuthorsPage from './components/pages/authorsPage';
import BookContainer from './components/pages/bookContainer';
import Challenge from './components/pages/challenge';
import Collection from './components/pages/collection';
import CookiePage from './components/pages/cookiePage';
import Dashboard from './components/pages/dashboard';
import DonationsPage from './components/pages/donationsPage';
import Genre from './components/pages/genre';
import genresPage from './components/pages/genresPage';
import HelpPage from './components/pages/helpPage';
import Home from './components/pages/home';
import IconsPage from './components/pages/iconsPage';
import Login from './components/pages/login';
import NewBook from './components/pages/newBook';
import NoMatchPage from './components/pages/noMatchPage';
import PrivacyPage from './components/pages/privacyPage';
import Profile from './components/pages/profile';
import Signup from './components/pages/signup';
import TermsPage from './components/pages/termsPage';
import VerifyEmailPage from './components/pages/verifyEmailPage';
// import Challenges from './components/pages/challenges';
import { auth, isAuthenticated, storageKey_uid, userRef } from './config/firebase';
import { handleFirestoreError } from './config/shared';
import { defaultTheme } from './config/themes';
import { SharedSnackbarConsumer, SharedSnackbarProvider } from './context/sharedSnackbar';

export const UserContext = React.createContext();

export default class App extends React.Component {
	state = {
    error: null,
    lang: 'ita',
		user: null
	}

	componentDidMount() {
    this._isMounted = true;
		auth.onAuthStateChanged(user => {
			if (user && user.emailVerified) {
				window.localStorage.setItem(storageKey_uid, user.uid);
				this.unsubUserFetch = userRef(user.uid).onSnapshot(snap => {
          // console.log(snap);
					if (snap.exists) {
						this.setState({ user: snap.data(), error: null });
					} else console.warn(`User not found in database`);
        }, err => {
          if (this._isMounted) {
            this.setState({ error: handleFirestoreError(err) });
          }
        });
			} else {
				window.localStorage.removeItem(storageKey_uid);
				if (this._isMounted) {
          this.setState({ user: null });
        }
			}
		});
  }
  
  componentWillUnmount() {
    this._isMounted = false;
    this.unsubUserFetch && this.unsubUserFetch();
  }

	render() {
		const { error, user } = this.state;

		return (
			<ThemeProvider theme={defaultTheme}>
				<UserContext.Provider value={user}>
          <SharedSnackbarProvider>
            <SharedSnackbarConsumer>
              {({ openSnackbar }) => (
                <Layout user={user} error={error} openSnackbar={openSnackbar}>
                  <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="/login" component={Login} />
                    <Route path="/about" component={AboutPage} />
                    <Route path="/cookie" component={CookiePage} />
                    <Route path="/donations" component={DonationsPage} />
                    <Route path="/help" component={HelpPage} />
                    <Route path="/privacy" component={PrivacyPage} />
                    <Route path="/terms" component={TermsPage} />
                    <Route path="/verify-email" component={VerifyEmailPage} />
                    <RouteWithProps path="/password-reset" component={PasswordResetForm} openSnackbar={openSnackbar} />
                    <RouteWithProps path="/signup" component={Signup} openSnackbar={openSnackbar} />
                    <RouteWithProps path="/author/:aid" component={AuthorPage} user={user} />
                    <RouteWithProps path="/genres" component={genresPage} openSnackbar={openSnackbar} />
                    <RouteWithProps path="/authors" component={AuthorsPage} user={user} openSnackbar={openSnackbar} />
                    <RouteWithProps path="/collection/:cid" component={Collection} user={user} openSnackbar={openSnackbar} />
                    <RouteWithProps path="/genre/:gid" component={Genre} user={user} openSnackbar={openSnackbar} />
                    <RouteWithProps path="/book/:bid" component={BookContainer} user={user} openSnackbar={openSnackbar} />
                    <RouteWithProps path="/dashboard/:uid" exact component={Dashboard} user={user} openSnackbar={openSnackbar} />
                    <RouteWithProps path="/dashboard/:uid/:tab" component={Dashboard} user={user} openSnackbar={openSnackbar} />
                    <RouteWithProps path="/icons" component={IconsPage} openSnackbar={openSnackbar} />
                    <PrivateRoute path="/books/add" component={AddBook} user={user} openSnackbar={openSnackbar} />
                    <PrivateRoute path="/new-book" component={NewBook} user={user} openSnackbar={openSnackbar} />
                    <PrivateRoute path="/notifications" component={NewFeature} /* user={user} openSnackbar={openSnackbar} */ />
                    <PrivateRoute path="/profile" exact component={Profile} openSnackbar={openSnackbar}/>
                    <PrivateRoute path="/admin" exact component={Admin} user={user} openSnackbar={openSnackbar} />
                    <PrivateRoute path="/admin/:tab" component={Admin} user={user} openSnackbar={openSnackbar} />
                    <PrivateRoute path="/challenge" component={Challenge} user={user} openSnackbar={openSnackbar} />
                    <PrivateRoute path="/challenges" component={NewFeature} user={user} openSnackbar={openSnackbar} />
                    <Redirect from="/home" to="/" />
                    <Route component={NoMatchPage} />
                  </Switch>
                </Layout>
              )}
            </SharedSnackbarConsumer>
          </SharedSnackbarProvider>
				</UserContext.Provider>
			</ThemeProvider>
		);
	}
}

const PrivateRoute = ({component: Component, ...rest}) => (
	<Route {...rest} render={props => (
		isAuthenticated() ?
			<Component {...props} {...rest} />
		:
			<Redirect to={{ pathname: '/login', state: {from: props.location} }} />
	)} />
)

const RouteWithProps = ({ path, exact, strict, component:Component, location, ...rest }) => (
  <Route
    path={path}
    exact={exact}
    strict={strict}
    location={location}
    render={(props) => <Component {...props} {...rest} />} 
	/>
)