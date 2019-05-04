import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { ThemeProvider } from '@material-ui/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import NavigationClose from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { version } from '../../package.json';
import { authid, noteRef, notesRef, signOut } from '../config/firebase';
import { icon } from '../config/icons';
import { roles } from '../config/lists';
import { appName, getInitials, hasRole, timeSince } from '../config/shared';
import { darkTheme } from '../config/themes';
import { funcType, stringType, userType } from '../config/types';
import CookieBanner from 'react-cookie-banner';
import Footer from './footer';

export default class Layout extends React.Component {
  state = {
    drawerIsOpen: false,
    moreAnchorEl: null,
    notes: null,
    notesAnchorEl: null
  }

  static propTypes = {
    error: stringType,
    openSnackbar: funcType.isRequired,
    user: userType
  }
  
  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.timer && clearTimeout(this.timer);
    this.unsubNotesFetch && this.unsubNotesFetch();
  }

  componentDidUpdate(prevProps) {
    const { error, openSnackbar, user } = this.props;
    if (this._isMounted) {
      if (user !== prevProps.user){
        this.timer = setTimeout(() => {
          this.fetchNotes()
        }, 1000);
      }
      if (error !== prevProps.error) {
        openSnackbar(error, 'error', 9000);
      }
    }
  }

  fetchNotes = () => {
    const { user } = this.props;

    if (user) {
      const notes = [];
      roles.forEach(role => {
        if (hasRole(user, role)) {
          this.unsubNotesFetch = notesRef(`__${role}`).orderBy('created_num', 'desc').limit(5).onSnapshot(snap => {
            if (!snap.empty) {
              snap.forEach(note => {
                notes.push({ ...note.data(), role })
              });
            }
          });
        }
      });
      notesRef(user.uid).orderBy('created_num', 'desc').limit(10).get().then(snap => {
        if (!snap.empty) {
          snap.forEach(note => {
            notes.push(note.data());
          });
          if (this._isMounted) this.setState({ notes });
        }
      }).catch(error => console.warn(error));
    } else {
      if (this._isMounted) this.setState({ notes: null });
    }
  }
  
  onToggleDrawer = () => this.setState(prevState => ({ drawerIsOpen: !prevState.drawerIsOpen }));
  onCloseDrawer = () => this.setState({ drawerIsOpen: false });

  onOpenMore = e => this.setState({ moreAnchorEl: e.currentTarget });
  onCloseMore = () => this.setState({ moreAnchorEl: null });

  onOpenNotes = e => {
    const { notes } = this.state;
    const { user } = this.props;

    if (this._isMounted) this.setState({ notesAnchorEl: e.currentTarget });
    notes && notes.filter(note => note.read !== true && !note.role).forEach(note => {
      /* if (this._isMounted) {
        this.setState({
          notes: { ...notes, [notes.find(obj => obj.nid === note.nid )]: { ...note, read: true } }
        }); 
      } */
      noteRef(user.uid, note.nid).update({ read: true }).then().catch(error => console.warn(error));
    });
  }
  onCloseNotes = () => this.setState({ notesAnchorEl: null });

  onOpenDialog = () => this.setState({ dialogIsOpen: true });
  onCloseDialog = () => this.setState({ dialogIsOpen: false });
  
  render() {
    const { drawerIsOpen, moreAnchorEl, notes, notesAnchorEl } = this.state;
    const { children, user } = this.props;
    const toRead = notes => notes && notes.filter(note => !note.read || note.role);

    return (
      <div id="layoutComponent">
        <AppBar id="appBarComponent" className="dark" position="static">
          <Toolbar className="toolbar">
            <IconButton className="drawer-btn" aria-label="Menu" onClick={this.onToggleDrawer}> 
              {drawerIsOpen ? <NavigationClose /> : <MenuIcon />}
            </IconButton>
            <Typography className="title" variant="h6" color="inherit">
              <Link to="/">{appName}<sup>Beta</sup></Link>
            </Typography>
            {user ? 
              <React.Fragment>
                {user.roles.admin && 
                  <IconButton
                  className="search-btn popIn reveal delay6 hide-xs"
                  component={Link} 
                  to="/new-book"
                  aria-label="New book">
                    {icon.plus()}
                  </IconButton>
                }
                <IconButton
                  className="search-btn popIn reveal delay4"
                  component={Link} 
                  to="/books/add"
                  aria-label="Search">
                  {icon.magnify()}
                </IconButton>
                <IconButton
                  className="notes-btn popIn reveal delay2"
                  aria-label="Notifications"
                  aria-owns={notesAnchorEl ? 'notes-menu' : null}
                  aria-haspopup="true"
                  onClick={this.onOpenNotes}
                  title={`${notes ? toRead(notes).length : 0} notifiche`}>
                  {icon.bell()}
                  {notes && toRead(notes).length ? <div className="badge dot">{toRead(notes).length}</div> : null}
                </IconButton>
                <Menu
                  id="notes-menu"
                  className="dropdown-menu notes"
                  anchorEl={notesAnchorEl}
                  onClick={this.onCloseNotes}
                  open={Boolean(notesAnchorEl)}
                  onClose={this.onCloseNotes}>
                  {notes && toRead(notes).length ?
                    toRead(notes).map((note, i) => (
                      <MenuItem key={note.nid} style={{animationDelay: `${(i + 1) / 10  }s`}}> 
                        <div className="row">
                          {note.photoURL && <div className="col-auto image"><img src={note.photoURL} className="avatar" alt="avatar" /></div>}
                          <div className="col text">
                            <div dangerouslySetInnerHTML={{__html: note.text}} />
                          </div>
                          <div className="col-auto date">{timeSince(note.created_num)}</div>
                        </div>
                      </MenuItem>
                    ))
                    : 
                    <MenuItem className="text"><span className="icon">{icon.bellOff()}</span> Non ci sono nuove notifiche</MenuItem>
                  }
                  <Link to="/notifications"><MenuItem className="footer">Mostra tutte</MenuItem></Link> 
                </Menu>

                <IconButton
                  className="more-btn"
                  aria-label="More"
                  aria-owns={moreAnchorEl ? 'more-menu' : null}
                  aria-haspopup="true"
                  onClick={this.onOpenMore}>
                  <Avatar className="avatar popIn reveal" src={user.photoURL} alt={user.displayName}>
                    {!user.photoURL && getInitials(user.displayName)}
                  </Avatar>
                  {!user.roles.editor && <div className="badge dot red" title="Modifiche disabilitate">{icon.lock()}</div>}
                </IconButton>
                <Menu
                  id="more-menu"
                  className="dropdown-menu"
                  anchorEl={moreAnchorEl}
                  onClick={this.onCloseMore}
                  open={Boolean(moreAnchorEl)}
                  onClose={this.onCloseMore}>
                  <MenuItem component={NavLink} to="/profile">Profilo</MenuItem>
                  <MenuItem component={NavLink} to={`/dashboard/${authid}`}>Dashboard</MenuItem>
                  <MenuItem onClick={signOut}>Esci</MenuItem>
                </Menu>
              </React.Fragment>
            : 
              <React.Fragment>
                <NavLink to="/login" className="btn flat">Accedi</NavLink>
                <NavLink to="/signup" className="btn primary">Registrati</NavLink>
              </React.Fragment>
            }
          </Toolbar>
        </AppBar>
        
        <ThemeProvider theme={darkTheme}>
          <Drawer
            className="drawer"
            open={drawerIsOpen}
            onClick={this.onCloseDrawer}>
            <nav className="list">
              {user && authid ? 
                <React.Fragment>
                  <NavLink to="/profile" className="auth-header">
                    <div className="background" style={{backgroundImage: `url(${user.photoURL})`}} />
                    <div className="user">
                      <Avatar className="avatar" src={user.photoURL} alt={user.displayName}>{!user.photoURL && getInitials(user.displayName)}</Avatar>
                      <div className="user-info">
                        <div className="user-name">{user.displayName}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </NavLink>
                  {user.roles.admin && 
                    <NavLink to={`/admin`}>
                      <MenuItem>
                        <ListItemIcon>{icon.gauge()}</ListItemIcon>
                        <ListItemText inset primary="Amministrazione" />
                      </MenuItem>
                    </NavLink>
                  }
                  <NavLink to={`/dashboard/${authid}`}>
                    <MenuItem>
                      <ListItemIcon>{icon.homeAccount()}</ListItemIcon>
                      <ListItemText inset primary="Dashboard" />
                    </MenuItem>
                  </NavLink>
                </React.Fragment>
              :
              <div className="auth-header-buttons">
                  <NavLink to="/login">
                    <MenuItem>
                      <ListItemIcon>{icon.loginVariant()}</ListItemIcon>
                      <ListItemText inset primary="Accedi" />
                    </MenuItem>
                  </NavLink>
                  <NavLink to="/signup">
                    <MenuItem>
                      <ListItemIcon>{icon.accountPlus()}</ListItemIcon>
                      <ListItemText inset primary="Registrati" />
                    </MenuItem>
                  </NavLink>
                </div>
              }
              <NavLink to="/" exact>
                <MenuItem>
                  <ListItemIcon>{icon.home()}</ListItemIcon>
                  <ListItemText inset primary="Home" />
                </MenuItem>
              </NavLink>

              <MenuItem disableRipple className="bottom-item">
                <div className="version">v {version}</div>
              </MenuItem>
              
            </nav>
          </Drawer>
        </ThemeProvider>
        
        <main>
          {children}
        </main>

        <Footer />

        <CookieBanner
          disableStyle
          message="Questo sito utilizza i cookie per monitorare e personalizzare l'esperienza di navigazione degli utenti. Per saperne di più o modificare le tue preferenze "
          buttonMessage="Accetto"
          link={<Link to="/cookie">clicca qui</Link>}
          dismissOnScrollThreshold={100}
          onAccept={() => {}}
          cookie="user-has-accepted-cookies" 
        />
      </div> 
    );
  }
}