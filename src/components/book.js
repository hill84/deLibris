import React from 'react';
import { bookRef, collectionsRef, isAuthenticated, reviewRef, uid, userBookRef, userRef } from '../config/firebase';
import { bookType, stringType, userBookType, userType } from '../config/types';
import NoMatch from './noMatch';
import BookForm from './forms/bookForm';
import BookProfile from './pages/bookProfile';

export default class Book extends React.Component {
  state = {
    book: this.props.book,
    user: this.props.user,
    userBook: {
      authors: (this.props.book && this.props.book.authors) || [],
      covers: (this.props.book && !!this.props.book.covers[0] && Array(this.props.book.covers[0])) || [],
      publisher: (this.props.book && this.props.book.publisher) || '',
      title: (this.props.book && this.props.book.title) || '',
      subtitle: (this.props.book && this.props.book.subtitle) || '',
      review: {},
      readingState: {
        state_num: 1
      },
      rating_num: 0,
      bookInShelf: false,
      bookInWishlist: false 
    },
    isEditing: this.props.isEditing || false,
    loading: false
  }
	
  static propTypes = {
    bid: stringType,
    book: bookType,
    user: userType,
    userBook: userBookType
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.user !== prevState.user) { return { user: nextProps.user }; }
    if (nextProps.book !== prevState.book) { 
      return { 
        book: nextProps.book,
        userBook: {
          ...prevState.userBook,
          authors: nextProps.book.authors || [],
          covers: (!!nextProps.book.covers[0] && Array(nextProps.book.covers[0])) || [],
          publisher: nextProps.book.publisher || '',
          title: nextProps.book.title || '',
          subtitle: nextProps.book.subtitle || ''
        }
      }; 
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this._isMounted) {
      if(this.props.bid !== prevProps.bid){
        this.setState({ loading: true });
        bookRef(this.props.bid).onSnapshot(snap => {
          if (snap.exists) {
            //console.log(snap.data());
            this.setState({
              book: {
                ...this.state.book,
                ...snap.data()
              },
              userBook: {
                ...this.state.userBook,
                authors: snap.data().authors || [],
                covers: (!!snap.data().covers[0] && Array(snap.data().covers[0])) || [],
                publisher: snap.data().publisher || '',
                title: snap.data().title || '',
                subtitle: snap.data().subtitle || ''
              }
            });
          } else console.warn(`No book with bid ${this.props.bid}`);
          this.setState({ loading: false });
        });
        this.fetchUserBook(this.props.bid);
      }
      if (this.props.book !== prevProps.book) {
        this.fetchUserBook(this.props.book.bid);
      }
    }
  }

  componentDidMount(props) {
    this._isMounted = true;
    if (this.props.bid) {
      this.setState({ loading: true });
      bookRef(this.props.bid).onSnapshot(snap => {
        if (snap.exists) {
          //console.log(snap.data());
          this.setState({
            book: {
              ...this.state.book,
              ...snap.data()
            },
            userBook: {
              ...this.state.userBook,
              authors: snap.data().authors,
              covers: (!!snap.data().covers[0] && Array(snap.data().covers[0])) || [],
              publisher: snap.data().publisher,
              title: snap.data().title,
              subtitle: snap.data().subtitle,
            }
          });
        } else console.warn(`No book with bid ${this.props.bid}`);
        this.setState({ loading: false });
      });
    }
    if (uid && (this.props.bid || this.state.book.bid)) {
      this.fetchUserBook(this.props.bid || this.state.book.bid);
    }
  }

  componentWillUnmount () {
    this._isMounted = false;
  }
  
  fetchUserBook = bid => {
    if (isAuthenticated()) {
      userBookRef(uid, bid).onSnapshot(snap => {
        if (snap.exists) {
          this.setState({ userBook: snap.data() });
          //console.log(`Update userBook ${bid}`);
        }
      });
    } else console.warn(`Cannot fetchUserBook. User not authenticated`);
  }
  
  addBookToShelf = bid => {
    if (isAuthenticated()) {
      let userWishlist_num = this.props.user.stats.wishlist_num;
      const bookReaders_num = this.state.book.readers_num + 1;

      if (this.state.userBook.bookInWishlist) {
        userWishlist_num -= 1;
      }
      
      userBookRef(uid, bid).set({
        ...this.state.userBook,
        added_num: Number(new Date().getTime()),
        bookInShelf: true,
        bookInWishlist: false
      }).then(() => {
        /* this.setState({ 
          userBook: { 
            ...this.state.userBook, 
            bookInShelf: true, 
            bookInWishlist: false 
          }
        }); */
        //console.log('Book added to user shelf');
      }).catch(error => console.warn(error));

      bookRef(bid).update({
        readers_num: bookReaders_num
      }).then(() => {
        /* this.setState({ 
          book: { 
            ...this.state.book, 
            readers_num: bookReaders_num 
          }
        }); */
        //console.log('Readers number increased');
      }).catch(error => console.warn(error));

      userRef(uid).update({
        'stats.shelf_num': this.props.user.stats.shelf_num + 1,
        'stats.wishlist_num': userWishlist_num
      }).then(() => {
        //console.log('User shelf number increased');
      }).catch(error => console.warn(error));
    } else console.warn(`Cannot addBookToShelf. User not authenticated`);
	}

	addBookToWishlist = bid => {
    if (isAuthenticated()) {
      const userWishlist_num = this.props.user.stats.wishlist_num + 1;
      /* let userShelf_num = this.props.user.stats.shelf_num;
      let bookReaders_num = this.state.book.readers_num;
      let bookRating_num = this.state.book.rating_num;
      let bookRatings_num = this.state.book.ratings_num;
      let userRatings_num = this.props.user.stats.ratings_num;
      let userBookRating_num = this.state.userBook.rating_num;
      let userReviews_num = this.props.user.stats.reviews_num;
      let bookReviews_num = this.state.book.reviews_num;
      let userBookReview = this.state.userBook.review; 
      
      if (this.state.userBook.bookInShelf) {
        userShelf_num -= 1;
        bookReaders_num -= 1;
      }

      if (this.state.book.rating_num !== 0) {
        bookRating_num -= userBookRating_num;
        bookRatings_num -= 1;
        userRatings_num -= 1;
      }

      if (this.state.userBook.review !== {}) {
        userReviews_num -= 1;
        bookReviews_num -= 1;
        userBookReview = {};
      } */
      userBookRef(uid, bid).set({
        ...this.state.userBook,
        /* rating_num: userBookRating_num,
        review: userBookReview, */
        added_num: Number(new Date().getTime()),
        bookInShelf: false,
        bookInWishlist: true
      }).then(() => {
        /* this.setState({ 
          userBook: { 
            ...this.state.userBook, 
            rating_num: userBookRating_num,
            review: userBookReview,
            bookInShelf: false,
            bookInWishlist: true 
          }
        }); */
        //console.log('Book added to user wishlist');
      }).catch(error => console.warn(error));

      userRef(uid).update({
        /* 'stats.shelf_num': userShelf_num, */
        'stats.wishlist_num': userWishlist_num,
        /* 'stats.ratings_num': userRatings_num,
        'stats.reviews_num': userReviews_num */
      }).then(() => {
        //console.log('User wishlist number increased');
      }).catch(error => console.warn(error));

      /* bookRef(bid).update({
        rating_num: bookRating_num,
        ratings_num: bookRatings_num,
        readers_num: bookReaders_num,
        reviews_num: bookReviews_num
      }).then(() => {
        this.setState({ 
          book: { 
            ...this.state.book,
            ratings_num: bookRatings_num,
            readers_num: bookReaders_num
          },
          userBook: { 
            ...this.state.userBook, 
            rating_num: userBookRating_num 
          }
        });
        //console.log('Rating and reader removed');
      }).catch(error => console.warn(error)); */
    } else console.warn(`Cannot addBookToWishlist. User not authenticated`);
  }

	removeBookFromShelf = bid => this.removeBookFromUserBooks(bid, 'shelf');

  removeBookFromWishlist = bid => this.removeBookFromUserBooks(bid, 'wishlist');
  
  removeBookFromUserBooks = (bid, bookshelf) => {
    if (isAuthenticated()) {
      let userShelf_num = this.props.user.stats.shelf_num;
      let userWishlist_num = this.props.user.stats.wishlist_num;
      let bookRating_num = this.state.book.rating_num;
      let bookRatings_num = this.state.book.ratings_num;
      let bookReaders_num = this.state.book.readers_num;
      let bookReviews_num = this.state.book.reviews_num;
      let userReviews_num = this.props.user.stats.reviews_num;
      let userRatings_num = this.props.user.stats.ratings_num;
      let userBookRating_num = this.state.userBook.rating_num;
      let review = this.state.userBook.review;
  
      if (this.state.userBook.bookInShelf) {
        userShelf_num -= 1;
        bookReaders_num -= 1;
      } else {
        userWishlist_num -= 1;
      }
  
      if (this.state.book.rating_num !== 0) {
        bookRating_num -= userBookRating_num;
        bookRatings_num -= 1;
        userRatings_num -= 1;
        userBookRating_num = 0;
      }
  
      if (this.state.book.reviews_num !== 0) {
        bookReviews_num -= 1;
        userReviews_num -= 1;
      }

      if (this.state.userBook.review.created_num) {
        review = {};
      }
      
      userBookRef(uid, bid).delete().then(() => {
        this.setState({ 
          userBook: { 
            ...this.state.userBook, 
            bookInShelf: false, 
            bookInWishlist: false,
            rating_num: userBookRating_num,
            readingState: { state_num: 1 },
            review: review
          }
        });
        //console.log(`Book removed from user ${bookshelf}`);
      }).catch(error => console.warn(error));
  
      bookRef(bid).update({
        rating_num: bookRating_num,
        ratings_num: bookRatings_num,
        review: review,
        reviews_num: bookReviews_num,
        readers_num: bookReaders_num
      }).then(() => {
        this.setState({ 
          book: { 
            ...this.state.book, 
            rating_num: bookRating_num, 
            ratings_num: bookRatings_num,
            review: review,
            reviews_num: bookReviews_num,
            readers_num: bookReaders_num
          }
        });
        //console.log('Rating and reader removed');
      }).catch(error => console.warn(error));
  
      if (bookshelf === 'shelf') {
        //console.log('will remove book and rating from user shelf stats');
        userRef(uid).update({
          ...this.props.user,
          stats: {
            ...this.props.user.stats,
            shelf_num: userShelf_num,
            reviews_num: userReviews_num,
            ratings_num: userRatings_num
          }
        }).then(() => {
          //console.log('Book and rating removed from user shelf stats');
        }).catch(error => console.warn(error));

        if (!!this.state.userBook.review.created_num) {
          reviewRef(bid, uid).delete().then(() => {
            this.setState({ 
              userBook: { 
                ...this.state.userBook, 
                review: review
              }
            });
            //console.log(`Review removed from book`);
          }).catch(error => console.warn(error));
        }

        if (this.state.book.collections) {
          this.state.book.collections.forEach(cid => {
            collectionsRef(cid).doc(this.state.book.bid).update({
              rating_num: bookRating_num, 
              ratings_num: bookRatings_num
            }).then(() => {
              //console.log(`updated book rating in "${cid}" collection`)
            }).catch(error => console.warn(error));
          });
        };
      } else if (bookshelf === 'wishlist') {
        //console.log('will remove book from user wishlist stats');
        userRef(uid).update({
          ...this.props.user,
          stats: {
            ...this.props.user.stats,
            wishlist_num: userWishlist_num
          }
        }).then(() => {
          //console.log('Book removed from user wishlist stats');
        }).catch(error => console.warn(error));
      } else console.warn(`no bookshelf named "${bookshelf}"`);
    } else console.warn(`Cannot removeBookFromUserBooks. User not authenticated`);
  }

	rateBook = (bid, rate) => {
    if (isAuthenticated()) {
      let bookRating_num = this.state.book.rating_num;
      let userBookRating_num = this.state.userBook.rating_num;
      let bookRatings_num = this.state.book.ratings_num; 
      let userRatings_num = this.props.user.stats.ratings_num; 
      
      /* console.log({
        'bookRating_num': bookRating_num,
        'bookRatings_num': bookRatings_num,
        'rate': rate,
        'userRatings_num': userRatings_num,
        'userBookRating_num': userBookRating_num
      }); */

      if (userBookRating_num === 0) { 
        bookRating_num = (bookRating_num === 0) ? rate : (bookRating_num + rate) / bookRatings_num;
        bookRatings_num += 1; 
        userRatings_num += 1; 
      } else {
        bookRating_num = bookRating_num - userBookRating_num + rate;
      }

      bookRef(bid).update({
        rating_num: bookRating_num,
        ratings_num: bookRatings_num
      }).then(() => {
        this.setState({ 
          book: { 
            ...this.state.book, 
            rating_num: bookRating_num, 
            ratings_num: bookRatings_num
          }
        });
        //console.log('Book rated with ' + rate + ' stars');
      }).catch(error => console.warn(error));

      if (this.state.book.collections) {
        this.state.book.collections.forEach(cid => {
          //console.log(cid);
          collectionsRef(cid).doc(this.state.book.bid).update({
            rating_num: bookRating_num, 
            ratings_num: bookRatings_num
          }).then(() => {
            //console.log(`updated book rating in "${cid}" collection`)
          }).catch(error => console.warn(error));
        });
      };

      userBookRef(uid, bid).update({
        rating_num: rate
      }).then(() => {
        this.setState({ 
          userBook: { 
            ...this.state.userBook, 
            rating_num: rate 
          }
        });
        //console.log('User book rated with ' + rate + ' stars');
      }).catch(error => console.warn(error));

      userRef(uid).update({
        'stats.ratings_num': userRatings_num
      }).then(() => {
        //console.log('User ratings number increased');
      }).catch(error => console.warn(error));
    } else console.warn(`Cannot rateBook. User not authenticated`);
	}

  isEditing = () => this.setState(prevState => ({ isEditing: !prevState.isEditing }));
	
	render(props) {
    const { book, isEditing, loading, user, userBook } = this.state;

    if (!book) {
      if (loading) {
        return null;
      } else {
        return <NoMatch title="Libro non trovato" location={this.props.location} />
      }
    }

		return (
			<div ref="BookComponent">
        {isEditing && isAuthenticated() ?
          <BookForm 
            isEditing={this.isEditing} 
            book={book} 
            user={user}
          />
        :
          <BookProfile 
            addBookToShelf={this.addBookToShelf} 
            addBookToWishlist={this.addBookToWishlist} 
            removeBookFromShelf={this.removeBookFromShelf} 
            removeBookFromWishlist={this.removeBookFromWishlist} 
            rateBook={this.rateBook}
            isEditing={this.isEditing}
            book={book}
            userBook={userBook}
            user={user}
          />
        }
			</div>
		);
	}
}