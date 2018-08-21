import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import { Link } from 'react-router-dom';
import { userBooksRef } from '../config/firebase';
import { icon } from '../config/icons';
import { booksPerRow } from '../config/shared';
import { numberType, stringType } from '../config/types';
import Cover from './cover';
import { skltn_shelfRow, skltn_shelfStack } from './skeletons';

export default class Shelf extends React.Component {
  state = {
    luid: this.props.luid,
    uid: this.props.uid,
    isOwner: this.props.luid === this.props.uid,
    shelf: this.props.shelf || 'bookInShelf',
    orderMenuAnchorEl: null,
    booksPerRow: this.props.booksPerRow || 4,
    limit: booksPerRow() * 2 - 1,
    orderBy: [ 
      { type: 'added_num', label: 'Data aggiunta'}, 
      { type: 'title', label: 'Titolo'}, 
      { type: 'rating_num', label: 'Valutazione'}, 
      { type: 'authors', label: 'Autore'}
    ],
    orderByIndex: 0,
    coverview: true,
    desc: true,
    loading: true,
    userBooks: [],
    userBooksCount : 0,
    pagination: true,
    page: 1,
    lastVisible: null
  }

  static propTypes = {
    booksPerRow: numberType,
    limit: numberType,
    shelf: stringType,
    luid: stringType,
    uid: stringType.isRequired
  }

  static getDerivedStateFromProps(props, state) {
    if (props.uid !== state.uid) { return { uid: props.uid }; }
    if (props.luid !== state.luid) { return { luid: props.luid }; }
    return null;
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchUserBooks();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    const { /* coverview,  */desc, luid, orderByIndex, uid } = this.state;
    if (this._isMounted) {
      if (/* coverview !== prevState.coverview ||  */desc !== prevState.desc || orderByIndex !== prevState.orderByIndex || (luid && (luid !== prevState.luid)) || uid !== prevState.uid) {
        this.fetchUserBooks();
      } else if (!luid && (luid !== prevState.luid)) {
        this.setState({ isOwner: false });
      }
    }
  }

  fetchUserBooks = direction => {
    const { desc, limit, luid, orderBy, orderByIndex, page, shelf, uid } = this.state;
    if (uid) {
      const prev = direction === 'prev';
      const startAt = direction ? prev ? ((page - 1) * limit) - limit : page * limit : 0;
      const shelfRef = userBooksRef(uid).where(shelf, '==', true).orderBy(orderBy[orderByIndex].type, desc ? 'desc' : 'asc');
      const empty = { 
        isOwner: luid === uid,
        userBooksCount: 0, 
        userBooks: [],
        loading: false,
        page: 1
      };
  
      shelfRef.onSnapshot(fullSnap => {
        if (!fullSnap.empty) { 
          this.setState({ userBooksCount: fullSnap.docs.length });
          let lastVisible = fullSnap.docs[startAt];
          const ref = direction ? shelfRef.startAt(lastVisible) : shelfRef;
          ref.limit(limit).onSnapshot(snap => {
            this.setState({ loading: true });
            if (!snap.empty) {
              const userBooks = [];
              snap.forEach(userBook => userBooks.push({ ...userBook.data(), bid: userBook.id }));
              this.setState(prevState => ({ 
                isOwner: luid === uid,
                userBooks,
                loading: false,
                page: direction ? prev ? prevState.page > 1 ? prevState.page - 1 : 1 : (prevState.page * prevState.limit) > prevState.userBooksCount ? prevState.page : prevState.page + 1 : 1
              }));
            } else this.setState(empty);
          });
        } else this.setState(empty);
      });
    } else console.warn(`No uid: ${uid}`);
  }

  onChangeOrderBy = (e, i) => {
    this.setState({ orderByIndex: i, orderMenuAnchorEl: null, page: 1 });
  }

  onChangeSelect = key => e => {
		this.setState({ 
      success: false, changes: true, 
      user: { ...this.state.user, [key]: e.target.value },
      errors: { ...this.state.errors, [key]: null } 
    });
	};

  onToggleDesc = () => this.setState(prevState => ({ desc: !prevState.desc }));

  onToggleView = () => this.setState(prevState => ({ coverview: !prevState.coverview/* , limit: !prevState.coverview ? booksPerRow() * 2 - 1 : 10 */ }));

  onOpenOrderMenu = e => this.setState({ orderMenuAnchorEl: e.currentTarget });

  onCloseOrderMenu = () => this.setState({ orderMenuAnchorEl: null });

  render() {
    const { booksPerRow, coverview, desc, isOwner, limit, loading, orderBy, orderByIndex, orderMenuAnchorEl, page, pagination, shelf, userBooks, userBooksCount } = this.state;
    const covers = userBooks && userBooks.map((book, i) => <Link key={book.bid} to={`/book/${book.bid}`}><Cover book={book} index={i} rating={shelf === 'bookInShelf'} /></Link>);
    const orderByOptions = orderBy.map((option, i) => (
      <MenuItem
        key={option.type}
        className={shelf !== 'bookInShelf' && option.type === 'rating_num' ? 'hide-always' : ''}
        disabled={i === -1}
        selected={i === orderByIndex}
        onClick={e => this.onChangeOrderBy(e, i)}>
        {option.label}
      </MenuItem>
    ));

    return (
      <React.Fragment>
        <div className="shelf">
          <div className="collection hoverable-items">
            <div className="head nav">
              <div className="row">
                <div className="col">
                  <button 
                    className={`btn sm flat counter`} 
                    title={coverview ? 'Stack view' : 'Cover view'} 
                    onClick={this.onToggleView}>
                    {coverview ? icon.viewSequential() : icon.viewGrid()}
                  </button>
                  <span className="counter hide-sm">{userBooksCount !== userBooks.length ? `${userBooks.length} di ` : ''}{userBooksCount} libri</span>
                </div>
                <div className="col-auto">
                  <button className="btn sm flat counter" onClick={this.onOpenOrderMenu}><span className="hide-xs">Ordina per</span> {orderBy[orderByIndex].label}</button>
                  <button className={`btn sm flat counter icon ${desc ? 'desc' : 'asc'}`} title={desc ? 'Ascendente' : 'Discendente'} onClick={this.onToggleDesc}>{icon.arrowDown()}</button>
                  <Menu 
                    anchorEl={orderMenuAnchorEl} 
                    open={Boolean(orderMenuAnchorEl)} 
                    onClose={this.onCloseOrderMenu}>
                    {orderByOptions}
                  </Menu>
                </div>
              </div>
            </div>
            {loading ? !coverview ? skltn_shelfStack : skltn_shelfRow :
              <div className={`shelf-row books-per-row-${booksPerRow} ${coverview ? 'coverview' : 'stacked'}`}>
                {isOwner &&
                  <Link to="/books/add">
                    <div className="book empty">
                      <div className="cover"><div className="add">+</div></div>
                      <div className="info"><b className="title">Aggiungi libro</b></div>
                    </div>
                  </Link>
                }
                {covers}
              </div>
            }
            {pagination && userBooksCount > limit &&
              <div className="info-row footer centered pagination">
                <button 
                  disabled={page === 1 && 'disabled'} 
                  className="btn flat" 
                  onClick={() => this.fetchUserBooks('prev')} title="precedente">
                  {icon.chevronLeft()}
                </button>
                <span className="page">{page}</span>
                <button 
                  disabled={page > (userBooksCount / limit) && 'disabled'} 
                  className="btn flat" 
                  onClick={() => this.fetchUserBooks('next')} title="successivo">
                  {icon.chevronRight()}
                </button>
              </div>
            }
          </div>
        </div>
      </React.Fragment>
    );
  }
}