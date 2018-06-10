import React from 'react';
import Link from 'react-router-dom/Link';
import { isAuthenticated, reviewRef, uid, userBookRef } from '../config/firebase';
import { icon } from '../config/icons';
import { timeSince } from '../config/shared';
import { reviewType } from '../config/types';
import Avatar from './avatar';
import Rating from './rating';

export default class Review extends React.Component {
  state = {
    like: this.props.review.likes.length && this.props.review.likes.indexOf(uid) > -1 ? true : false || false,
    likes_num: this.props.review.likes.length || 0
  }

  static propTypes = {
    review: reviewType.isRequired
  }

  static getDerivedStateFromProps(props, state) {
    if (props.review.likes.length !== state.likes_num) { return { likes_num: props.review.likes.length }}
    return null;
  }

  onThumbChange = () => {
    const { like } = this.state;
    const { bid, review } = this.props;
    let likes = review.likes;

    if (like) {
      likes = likes.filter(e => e !== uid);
      this.setState({ like: false, likes_num: likes.length });
      //console.log(`User ${uid} remove like on review ${bid}/${review.createdByUid}`);
      //console.log(`User likes decreased to ${likes.length}`);
    } else {
      likes = [...likes, uid];
      this.setState({ like: true, likes_num: likes.length });
      //console.log(`User ${uid} add like on review ${bid}/${review.createdByUid}`);
      //console.log(`User likes increased to ${likes.length}`);
    }
    console.log({likes, 'likes_num': likes.length});
    if (bid && review.createdByUid) {
      reviewRef(bid, review.createdByUid).update({
        likes: likes
      }).then(() => {
        //console.log(`Book review likes updated`);
      }).catch(error => console.warn(error.message));

      userBookRef(review.createdByUid, bid).update({
        likes: likes
      }).then(() => {
        //console.log(`User book review likes updated`);
      }).catch(error => console.warn(error.message));
    } else console.warn('No bid or ruid');
  }

  render() {
    const { like, likes_num } = this.state;
    const { review } = this.props;

    return (
      <div className={`review ${review.createdByUid === uid ? 'own' : null}`}>
        <div className="row">
          <Link to={`/dashboard/${review.createdByUid}`} className="col-auto left">
            <Avatar src={review.photoURL} alt={review.displayName} />
          </Link>
          <div className="col right">
            <div className="head row">
              <Link to={`/dashboard/${review.createdByUid}`} className="col-auto author">
                <h3>{review.displayName}</h3>
              </Link>
              <div className="col text-align-right rating">
                <Rating ratings={{rating_num: review.rating_num}} labels={true} />
              </div>
            </div>
            {review.title && <h4 className="title">{review.title}</h4>}
            <p className="text">{review.text}</p>
            <div className="foot row">
              <div className="col-auto likes">
                <div className="counter">
                  <button 
                    className={`btn flat thumb up ${like}`} 
                    disabled={!isAuthenticated() || (review.createdByUid === uid)} 
                    onClick={this.onThumbChange}
                    title={like ? 'Non mi piace più' : 'Mi piace'}>
                    {icon.thumbUp()} {(likes_num > 0) || (review.createdByUid === uid) ? likes_num : 'Mi piace'}
                  </button>
                </div>
              </div>
              <div className="col counter text-align-right date">{timeSince(review.created_num)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}