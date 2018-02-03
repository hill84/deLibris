import React from 'react';
/* import PropTypes from 'prop-types'; */

export default class Cover extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
      book: this.props.book,
      cover: this.props.book.covers[0] || '',
      index: 0,
      loading: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState({
        book: nextProps.book,
        cover: nextProps.book.covers ? nextProps.book.covers[0] : '',
        index: 0,
      });
    }
  }

  changeCover = () => {
    const { index, book } = this.state;
    const newIndex = index + 1 >= book.covers.length ? 0 : index + 1;
    this.setState({
      book: { ...this.state.book },
      cover: this.state.book.covers[newIndex],
      index: newIndex
    });
  };

  render() {
    const { cover, book } = this.state;

		return (
      <div className="book" ref="coverComponent">
        {cover ?
          <div>
            <div className="cover" style={{backgroundImage: `url(${cover})`}}>
              <div className="overlay"></div>
            </div>
            {book.covers && book.covers.length > 1 && <button className="btn" onClick={this.changeCover}>Cambia copertina</button>}
          </div>
        :
          <div className="cover">
            <div className="overlay"></div>
            <h2 className="title">{book.title}</h2>
            {book.subtitle && book.subtitle.length > 0 && <h3 className="subtitle">{book.subtitle}</h3>}
            <span className="author">{book.authors}</span>
            <span className="publisher">{book.publisher}</span>
          </div>
        }
      </div>
    );
  }
}