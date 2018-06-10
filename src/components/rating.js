import React from 'react';
import { boolType, ratingsType } from '../config/types';
import { ratingLabels } from '../config/lists';
import Rater from 'react-rater';

export default class Rating extends React.Component {
  state = {
    ratings_num: this.props.ratings.ratings_num || 0,
    rating_num: this.props.ratings.rating_num || 0,
    averageRating_num: Math.round(this.props.ratings.rating_num / this.props.ratings.ratings_num * 10) / 10 || 0
  }

  static propTypes = {
    ratings: ratingsType.isRequired,
    labels: boolType
  }

  static getDerivedStateFromProps(props, state) {
    if (props.ratings.ratings_num !== state.ratings_num || props.ratings.rating_num !== state.rating_num) { 
      return { 
        ratings_num: props.ratings.ratings_num || state.ratings_num, 
        rating_num: props.ratings.rating_num || state.rating_num, 
        averageRating_num: Math.round((props.ratings.rating_num || state.rating_num) / (props.ratings.ratings_num || state.ratings_num) * 10) / 10 || 0 
      }; 
    }
    return null;
  }

  render() {
    const { averageRating_num, rating_num, ratings_num } = this.state;
    const { labels } = this.props;

    return (
      <div className="rating">
        <Rater title={ratingLabels[ratings_num ? averageRating_num : rating_num]} interactive={false} total={5} rating={ratings_num ? averageRating_num : rating_num} />
        {labels && 
          <div className="rating-labels">
            <span className="label rating-num">{ratings_num ? averageRating_num : rating_num}</span>
            <span className="label ratings-num">{ratings_num} {ratings_num !== 1 ? 'voti' : 'voto'}</span>
          </div>
        }
      </div>
    )
  }
}