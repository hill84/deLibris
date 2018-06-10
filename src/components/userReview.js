import TextField from 'material-ui/TextField';
import React from 'react';
import { bookRef, reviewRef, uid, userBookRef, userRef } from '../config/firebase';
import { icon } from '../config/icons';
import { timeSince } from '../config/shared';
import { stringType, userBookType } from '../config/types';
import Avatar from './avatar';
import Rating from './rating';

export default class UserReview extends React.Component {
	state = {
    bid: this.props.bid || '',
    bookReviews_num: this.props.bookReviews_num || 0,
    user: this.props.user || {},
    userBook: this.props.userBook || {},
    review: {
      createdByUid: '',
      created_num: 0,
      displayName: '',
      likes: [],
      photoURL: '',
      rating_num: 0,
      text: '',
      title: ''
    },
    changes: false,
    text_minChars: 50,
    text_maxChars: 1500,
    title_maxChars: 255,
    loading: false,
    serverError: '',
    errors: {},
    isEditing: false
  }

  static propTypes = {
    bid: stringType.isRequired,
    userBook: userBookType
  }

  static getDerivedStateFromProps(props, state) {
    if (props.bid !== state.bid) { return { bid: props.bid }}
    if (props.bookReviews_num !== state.bookReviews_num) { return { bookReviews_num: props.bookReviews_num }}
    if (props.user !== state.user) { return { user: props.user }}
    if (props.userBook !== state.userBook) { return { userBook: props.userBook }}
    return null;
  }

  componentDidMount(prevState) {
    this.fetchUserReview();
  }

  componentDidUpdate(prevProps, prevState) {
    const { bid, changes, isEditing, user } = this.state;
    if(bid !== prevState.bid || user !== prevState.user || (changes && !isEditing && isEditing !== prevState.isEditing)){
      this.fetchUserReview();
    }
  }

  fetchUserReview = () => {
    //console.log('Fetching user review');
    reviewRef(this.state.bid, uid).onSnapshot(snap => {
      this.setState({ loading: true });
      if (snap.exists) {
        //console.log(snap.data());
        this.setState({ review: snap.data() });
      } else {
        this.setState({ review: {
          ...this.state.review,
          created_num: 0,
          likes: [],
          rating_num: 0,
          text: '',
          title: ''
        }});
      };
      this.setState({ loading: false, changes: false });
    });
  }

  onEditing = () => this.setState({ isEditing: true });

  onSubmit = e => {
    e.preventDefault();
    if (this.state.changes) {
      const errors = this.validate(this.state.review);
      this.setState({ errors });
      if (Object.keys(errors).length === 0) {
        this.setState({ loading: true });
        if (this.state.bid) {
          reviewRef(this.state.bid, uid).set({
            ...this.state.review,
            createdByUid: this.state.user.uid,
            created_num: Number((new Date()).getTime()),
            displayName: this.state.user.displayName,
            photoURL: this.state.user.photoURL,
            rating_num: this.state.userBook.rating_num
          }).then(() => {
            //console.log(`Book review created`);
          }).catch(error => this.setState({ serverError: error.message }));

          userBookRef(uid, this.state.bid).update({
            ...this.state.userBook,
            review: {
              ...this.state.review,
              created_num: (new Date()).getTime()
            }
          }).then(() => {
            //console.log(`User review posted`);
          }).catch(error => this.setState({ serverError: error.message }));

          let bookReviews_num = this.state.bookReviews_num;
          let userReviews_num = this.state.user.stats.reviews_num;

          if (!this.state.review.created_num) {
            bookReviews_num += 1;
            userReviews_num += 1;
          }

          bookRef(this.state.bid).update({
            reviews_num: bookReviews_num
          }).then(() => {
            this.setState({ bookReviews_num: bookReviews_num });
            //console.log(`Book reviews increased to ${bookReviews_num}`);
          }).catch(error => this.setState({ serverError: error.message }));

          userRef(uid).update({
            'stats.reviews_num': userReviews_num
          }).then(() => {
            //console.log(`User reviews increased to ${userReviews_num}`);
          }).catch(error => this.setState({ serverError: error.message }));

          this.setState({ 
            changes: false,
            serverError: '',
            isEditing: false, 
            loading: false 
          });

        } else console.warn(`No bid`);
      }
    } else this.setState({ isEditing: false });
  }

  onDelete = () => {
    //DELETE USER REVIEW AND DECREMENT REVIEWS COUNTERS
    if (this.state.bid) {
          
      reviewRef(this.state.bid, uid).delete().then(() => {
        //console.log(`Book review deleted`);
      }).catch(error => this.setState({ serverError: error.message }));

      userBookRef(uid, this.state.bid).update({
        ...this.state.userBook,
        review: {}
      }).then(() => {
        //console.log(`User review deleted`);
      }).catch(error => this.setState({ serverError: error.message }));

      const bookReviews_num = this.state.bookReviews_num - 1;
      const userReviews_num = this.state.user.stats.reviews_num - 1;

      bookRef(this.state.bid).update({
        reviews_num: bookReviews_num
      }).then(() => {
        this.setState({ bookReviews_num: bookReviews_num });
        console.log(`Book reviews decreased to ${bookReviews_num}`);
      }).catch(error => this.setState({ serverError: error.message }));

      userRef(uid).update({
        'stats.reviews_num': userReviews_num
      }).then(() => {
        console.log(`User reviews decreased to ${userReviews_num}`);
      }).catch(error => this.setState({ serverError: error.message }));

      this.setState({ serverError: '' });

    } else console.warn(`No bid`);
  }

  onExitEditing = () => {
    if (!this.state.review.created_num) {
      this.setState({ 
        review: {
          ...this.state.review,
          created_num: 0,
          likes: [],
          rating_num: 0,
          text: '',
          title: ''
        } 
      });
    }
    this.setState({ isEditing: false });
  }

  onChangeMaxChars = e => {
    let leftChars = `${e.target.name}_leftChars`;
    let maxChars = `${e.target.name}_maxChars`;
    this.setState({
      ...this.state, 
      review: { 
        ...this.state.review, 
        [e.target.name]: e.target.value 
      }, 
      [leftChars]: this.state[maxChars] - e.target.value.length, 
      changes: true
    });
  };

  validate = review => {
    const errors = {};
    if (review.title && review.title.length > this.state.title_maxChars) {
      errors.title = `Lunghezza massima ${this.state.title_maxChars} caratteri`;
    }
    if (!review.text) {
      errors.text = "Aggiungi una recensione";
    } else if (review.text.length > this.state.text_maxChars) {
      errors.text = `Lunghezza massima ${this.state.text_maxChars} caratteri`;
    } else if (review.text.length < this.state.text_minChars) {
      errors.text = `Lunghezza minima ${this.state.text_minChars} caratteri`;
    }
    return errors;
  }
  
  render() {
    const { errors, isEditing, loading, review, serverError, text_leftChars, text_maxChars, title_leftChars, title_maxChars, user, userBook } = this.state;

    if (!user || !userBook) return null;

    return (
      <React.Fragment>
        <div className={`card user-review ${isEditing ? 'edit-review' : 'primary'}`}>
          {!loading &&        
            !isEditing ? (
              !review.text ? 
                <button className="btn flat centered" onClick={this.onEditing}>Aggiungi una recensione</button>
              :
                <div className="review">
                  <div className="row">
                    <div className="col-auto left">
                      <Avatar src={user.photoURL} alt={user.displayName} />
                    </div>
                    <div className="col right">
                      <div className="head row">
                        <div className="col-auto author">
                          <h3>{user.displayName}</h3>
                        </div>
                        <div className="col text-align-right rating">
                          <Rating ratings={{rating_num: userBook.rating_num}} labels={true} />
                        </div>
                      </div>
                      <h4 className="title">{review.title}</h4>
                      <p className="text">{review.text}</p>
                      <div className="foot row">
                        <div className="col-auto likes">
                          <div className="counter">
                            <button className="btn sm flat thumb up" disabled title={`Piace a ${review.likes.length}`}>{icon.thumbUp()} {review.likes.length}</button>
                          </div>
                          <div className="counter">
                            <button className="btn sm flat" disabled>{icon.comment()} 0</button>
                          </div>
                          <div className="counter">
                            <button className="btn sm flat" onClick={this.onEditing}>{icon.pencil()} <span className="hide-sm">Modifica</span></button>
                          </div>
                          <div className="counter">
                            <button className="btn sm flat" onClick={this.onDelete}>{icon.delete()} <span className="hide-sm">Elimina</span></button>
                          </div>
                        </div>
                        <div className="col text-align-right date">{timeSince(review.created_num)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            : (
              <form onSubmit={this.onSubmit}>
                <div className="form-group">
                  <TextField
                    name="text"
                    type="text"
                    hintText={`Scrivi una recensione (max ${text_maxChars} caratteri)...`}
                    errorText={errors.text}
                    floatingLabelText="Recensione"
                    value={review.text || ''}
                    onChange={this.onChangeMaxChars}
                    fullWidth={true}
                    multiLine={true}
                    //rows={3}
                  />
                  {(text_leftChars !== undefined) && 
                    <p className={`message ${(text_leftChars < 0) ? 'alert' : 'neutral'}`}>Caratteri rimanenti: {text_leftChars}</p>
                  }
                </div>
                <div className="form-group">
                  <TextField
                    name="title"
                    type="text"
                    hintText={`Aggiungi un titolo (max ${title_maxChars} caratteri)...`}
                    errorText={errors.title}
                    floatingLabelText="Titolo (opzionale)"
                    value={review.title || ''}
                    onChange={this.onChangeMaxChars}
                    fullWidth={true}
                  />
                  {(title_leftChars !== undefined) && 
                    <p className={`message ${(title_leftChars) < 0 ? 'alert' : 'neutral'}`}>Caratteri rimanenti: {title_leftChars}</p>
                  }
                </div>

                {serverError && 
                  <React.Fragment>
                    <div>&nbsp;</div>
                    <div className="info-row text-align-center"><div className="message error">{serverError}</div></div>
                  </React.Fragment>
                }

                <div className="footer no-gutter">
                  <button className="btn btn-footer primary" disabled={!this.state.changes}>Pubblica</button>
                </div>
              </form>
            )
          }
        </div>

        {isEditing &&
          <div className="form-group">
            <button onClick={this.onExitEditing} className="btn flat centered">Annulla</button>
          </div>
        }
      </React.Fragment>
    );
  }
}