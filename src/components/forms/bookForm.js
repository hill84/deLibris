import { CircularProgress, DatePicker, MenuItem, SelectField, TextField } from 'material-ui';
import ChipInput from 'material-ui-chip-input';
import React from 'react';
import { bookRef, booksRef, collectionsRef, storageRef, uid } from '../../config/firebase';
import { checkBadWords, formats, genres, languages, validateImg } from '../../config/shared';
import { bookType, funcType, userType } from '../../config/types';
import Cover from '../cover';

export default class BookForm extends React.Component {
	state = {
    book: {
      ISBN_10: this.props.book.ISBN_10 || 0,
      ISBN_13: this.props.book.ISBN_13 || 0, 
      EDIT: this.props.book.EDIT || {
        createdBy: this.props.book.createdBy || '',
        createdByUid: this.props.book.createdByUid || '',
        created_num: this.props.book.created || 0,
        lastEditBy: this.props.book.lastEditBy || '',
        lastEditByUid: this.props.book.lastEditByUid || '',
        lastEdit_num: this.props.book.lastEdit || 0
      },
      authors: this.props.book.authors || [], 
      bid: this.props.book.bid || '', 
      collections: this.props.book.collections || [],
      covers: this.props.book.covers || [], 
      description: this.props.book.description || '', 
      edition_num: this.props.book.edition_num || 0, 
      format: this.props.book.format || '', 
      genres: this.props.book.genres || [], 
      incipit: this.props.book.incipit || '',
      languages: this.props.book.languages || [], 
      pages_num: this.props.book.pages_num || 0, 
      publisher: this.props.book.publisher || '', 
      publication: this.props.book.publication || '', 
      readers_num: this.props.book.readers_num || 0,
      rating_num: this.props.book.rating_num || 0,
      ratings_num: this.props.book.ratings_num || 0,
      reviews_num: this.props.book.reviews_num || 0,
      subtitle: this.props.book.subtitle || '', 
      title: this.props.book.title || '', 
      title_sort: this.props.book.title_sort || ''
    },
    imgPreview: null,
    imgProgress: 0,
    isEditingDescription: false,
    isEditingIncipit: false,
    description_maxChars: 2000,
    incipit_maxChars: 2500,
    loading: false,
    errors: {},
    authError: '',
    changes: false
  }

  static propTypes = {
    book: bookType.isRequired,
    isEditing: funcType.isRequired,
    user: userType.isRequired
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.book !== prevState.book) { return { book: nextProps.book }}
    return null;
  }

  /* componentDidMount(props) {
    if (this.props.book.bid) {
      bookRef(this.props.book.bid).onSnapshot(snap => {
        this.setState({
          book: snap.data()
        });
      });
    }
  } */

  onEditDescription = e => {
    e.preventDefault();
    this.setState(prevState => ({
      isEditingDescription: !prevState.isEditingDescription
    }));
  }

  onEditIncipit = e => {
    e.preventDefault();
    this.setState(prevState => ({
      isEditingIncipit: !prevState.isEditingIncipit
    }));
  }
  
  onChange = e => {
    this.setState({
      book: { ...this.state.book, [e.target.name]: e.target.value }, changes: true
    });
  };

  onChangeNumber = e => {
    this.setState({
      book: { ...this.state.book, [e.target.name]: parseInt(e.target.value, 10) }, changes: true
    });
  };

  onChangeSelect = key => (e, i, val) => {
		this.setState({ 
      book: { ...this.state.book, [key]: val }, changes: true
    });
  };

  onChangeDate = key => (e, date) => {
		this.setState({ 
      book: { ...this.state.book, [key]: String(date) }, changes: true
    });
  };
  
  onAddChip = (key, chip) => {
    this.setState({
      book: { ...this.state.book, [key]: [...this.state.book[key], chip] }, changes: true
    });
  };

  onDeleteChip = (key, chip) => {
    this.setState({
      //chips: this.state.chips.filter((c) => c !== chip)
      book: { ...this.state.book, [key]: this.state.book[key].filter((c) => c !== chip) }, changes: true
    });
  };
  
  onChangeMaxChars = e => {
    let leftChars = `${e.target.name}_leftChars`;
    let maxChars = `${e.target.name}_maxChars`;
    this.setState({
      ...this.state, 
      book: { ...this.state.book, [e.target.name]: e.target.value }, [leftChars]: this.state[maxChars] - e.target.value.length, changes: true
    });
  };

  onSubmit = e => {
    e.preventDefault();
    const { book } = this.state;
    if (this.state.changes || !this.state.book.bid) {
      const errors = this.validate(book);
      this.setState({ errors });
      if (Object.keys(errors).length === 0) {
        this.setState({ loading: true });
        if (this.props.book.bid) {
          const { EDIT, ...restBook } = book; // Exclude EDIT from fullBook
          bookRef(this.props.book.bid).update({
            ...restBook, 
            'EDIT.lastEdit_num': Number((new Date()).getTime()),
            'EDIT.lastEditBy': (this.props.user && this.props.user.displayName) || '',
            'EDIT.lastEditByUid': uid || ''
          }).then(() => {
            this.setState({ 
              //redirectToReferrer: true,
              loading: false,
              changes: false
            });
            this.props.isEditing();
          }).catch(error => {
            this.setState({
              authError: error.message,
              loading: false
            });
          });
        } else {
          //const { EDIT, ...restBook } = book; // Exclude EDIT from fullBook
          let newBookRef = booksRef.doc();
          newBookRef.set({
            ISBN_10: book.ISBN_10,
            ISBN_13: book.ISBN_13, 
            authors: book.authors, 
            bid: newBookRef.id,
            collections: book.collections,
            covers: book.covers, 
            description: book.description, 
            EDIT: {
              created_num: Number((new Date()).getTime()),
              createdBy: (this.props.user && this.props.user.displayName) || '',
              createdByUid: uid || '',
            },
            edition_num: book.edition_num, 
            format: book.format, 
            genres: book.genres, 
            incipit: book.incipit,
            languages: book.languages, 
            pages_num: book.pages_num, 
            publisher: book.publisher, 
            publication: book.publication, 
            readers_num: book.readers_num,
            rating_num: book.rating_num,
            ratings_num: book.ratings_num,
            reviews_num: book.reviews_num,
            subtitle: book.subtitle, 
            title: book.title, 
            title_sort: book.title_sort
          }).then(() => {
            this.setState({
              loading: false,
              changes: false
            });
            this.props.isEditing();
            console.log(`New book created with bid ${newBookRef.id}`);
          }).catch(error => {
            this.setState({
              authError: error.message,
              loading: false
            });
          });
        }
        if (book.collections) {
          book.collections.forEach(cid => {
            let bcid = 0;
            collectionsRef(cid).doc(book.bid).get().then(collectionBook => {
              if (collectionBook.exists) { bcid = collectionBook.data().bcid; }
              collectionsRef(cid).doc(book.bid).set({
                bid: book.bid, 
                bcid: bcid,
                covers: (!!book.covers[0] && Array(book.covers[0])) || [],
                title: book.title,  
                subtitle: book.subtitle, 
                authors: book.authors, 
                publisher: book.publisher,
                publication: book.publication,
                rating_num: book.rating_num,
                ratings_num: book.ratings_num
              }).then(() => {
                //console.log(`Book added to ${cid} collection`)
              }).catch(error => console.warn(error));
            }).catch(error => console.warn(error));
          });
        }
      }
    } else this.props.isEditing();
  };

  validate = book => {
    const errors = {};
    if (!book.title) {
      errors.title = "Inserisci il titolo";
    } else if (book.title.length > 255) {
      errors.title = "Lunghezza massima 255 caratteri";
    }
    if (book.subtitle && book.subtitle.length > 255) {
      errors.subtitle = "Lunghezza massima 255 caratteri";
    }
    if (!book.authors) {
      errors.authors = "Inserisci l'autore";
    } else if (book.authors.length > 5) {
      errors.authors = "Massimo 5 autori";
    } else if (book.authors[0].length > 35) {
      errors.authors = "Lunghezza massima 35 caratteri";
    } 
    if (!book.publisher) {
      errors.publisher = "Inserisci l'editore";
    } else if (book.publisher.length > 150) {
      errors.publisher = "Lunghezza massima 150 caratteri";
    }
    if (!book.pages_num) {
      errors.pages_num = "Inserisci il numero di pagine";
    } else if (book.pages_num.toString().length > 5) {
      errors.pages_num = "Lunghezza massima 5 cifre";
    } else if (book.pages_num < 20) {
      errors.pages_num = "Minimo 20 pagine";
    }
    if (!book.ISBN_13) {
      errors.ISBN_13 = "Inserisci il codice ISBN";
    } else if (book.ISBN_13.toString().length !== 13) {
      errors.ISBN_13 = "Il codice deve essere composto da 13 cifre";
    } else if (book.ISBN_13.toString().substring(0,3) !== "978") {
      errors.ISBN_13 = "Il codice deve iniziare per 978";
    }
    if (book.ISBN_10 && (book.ISBN_10.toString().length !== 10)) {
      errors.ISBN_10 = "Il codice deve essere composto da 10 cifre";
    }
    if (Number(new Date(book.publication).getTime()) > Number(new Date().getTime())) { // DOESN'T WORK?
      errors.publication = "Data di pubblicazione non valida";
    }
    if (book.edition_num && book.edition_num < 1) {
      errors.edition_num = "Numero non valido";
    } else if (book.edition_num && book.edition_num.toString().length > 2) {
      errors.edition_num = "Max 2 cifre";
    }
    if (book.languages && (book.languages.length > 4)) {
      errors.languages = "Massimo 4 lingue";
    }
    if (book.genres && (book.genres.length > 3)) {
      errors.genres = "Massimo 3 generi";
    }
    if (book.collections && (book.collections.length > 5)) {
      errors.collections = "Massimo 5 collezioni";
    }
    if (book.collections && book.collections.length > 255) {
      errors.collections = "Lunghezza massima 255 caratteri";
    } // BROKEN
    if (book.description && book.description.length < 150) {
      errors.description = `Lunghezza minima 150 caratteri`;
      this.setState({ isEditingDescription: true });
    }
    if (book.description && book.description.length > this.state.description_maxChars) {
      errors.description = `Lunghezza massima ${this.state.description_maxChars} caratteri`;
      this.setState({ isEditingDescription: true });
    }
    if (book.incipit && book.incipit.length < 255) {
      errors.incipit = `Lunghezza minima 255 caratteri`;
      this.setState({ isEditingIncipit: true });
    }
    if (book.incipit && book.incipit.length > this.state.incipit_maxChars) {
      errors.incipit = `Lunghezza massima ${this.state.incipit_maxChars} caratteri`;
      this.setState({ isEditingIncipit: true });
    }
    ['description', 'publisher', 'subtitle', 'title'].map(text => {
      if (checkBadWords(book[text])) return errors[text] = "Niente volgarità";
    });
    return errors;
  }

	onImageChange = e => {
		e.preventDefault();
		const file = e.target.files[0];
		//console.log(file);
		const errors = validateImg(file, 1048576);
		this.setState({ errors });
		if(Object.keys(errors).length === 0) {
			const uploadTask = storageRef(`books/${this.props.book.bid || this.state.book.bid}`, 'cover').put(file);
			uploadTask.on('state_changed', snap => {
				this.setState({
					imgProgress: (snap.bytesTransferred / snap.totalBytes) * 100
				});
			}, error => {
				console.warn(`upload error: ${error}`);
				errors.upload = true;
			}, () => {
				//console.log('upload completed');
				this.setState({
					imgPreview: uploadTask.snapshot.downloadURL,
					changes: true,
					success: false
				});
			});
		}
	};

  onExitEditing = () => this.props.isEditing();
	
	render() {
    const { authError, book, description_leftChars, description_maxChars, imgProgress, incipit_leftChars, incipit_maxChars, isEditingDescription, isEditingIncipit, errors } = this.state;
    const { user } = this.props;
    const isAdmin = () => user && user.roles && user.roles.admin === true;
    const menuItemsMap = (arr, values) => arr.map(item => 
			<MenuItem 
				value={item.name} 
				key={item.id} 
				insetChildren={values ? true : false} 
				checked={values ? values.includes(item.name) : false} 
				primaryText={item.name} 
			/>
		);

		return (
      <div ref="BookFormComponent">
        <div className="content-background"><div className="bg" style={{backgroundImage: `url(${book.covers[0]})`}}></div></div>
        <div className="container top">
          <form onSubmit={this.onSubmit} className="card">
            {this.state.loading && <div className="loader"><CircularProgress /></div>}
            <div className="container md">
              <div className="edit-book-cover">
                <Cover book={book} />
                {isAdmin() && !book.covers[0] && 
                  <button className="btn sm flat centered">
                    <span>Carica un'immagine</span>
                    <input type="file" accept="image/*" className="upload" onChange={e => this.onImageChange(e)} />
                    {(imgProgress > 0) && 
                      <progress type="progress" value={imgProgress} max="100" className="progress"></progress>
                    }
                  </button>
                }
              </div>
              <div className="edit-book-info">
                <div className="form-group">
                  <TextField
                    name="title"
                    type="text"
                    hintText="es: Sherlock Holmes"
                    errorText={errors.title}
                    floatingLabelText="Titolo"
                    value={book.title || ''}
                    onChange={this.onChange}
                    fullWidth={true}
                  />
                </div>
                <div className="form-group">
                  <TextField
                    name="subtitle"
                    type="text"
                    hintText="es: Uno studio in rosso"
                    errorText={errors.subtitle}
                    floatingLabelText="Sottotitolo"
                    value={book.subtitle || ''}
                    onChange={this.onChange}
                    fullWidth={true}
                  />
                </div>
                <div className="form-group">
                  <ChipInput
                    name="authors"
                    hintText="es: Arthur Conan Doyle"
                    errorText={errors.authors}
                    floatingLabelText="Autore"
                    value={book.authors}
                    onRequestAdd={chip => this.onAddChip("authors", chip)}
                    onRequestDelete={chip => this.onDeleteChip("authors", chip)}
                    fullWidth={true}
                  />
                </div>
                <div className="row">
                  <div className="form-group col-sm-6">
                    <TextField
                      name="ISBN_13"
                      type="number"
                      hintText="es: 9788854152601"
                      errorText={errors.ISBN_13}
                      floatingLabelText="ISBN-13"
                      value={book.ISBN_13}
                      onChange={this.onChangeNumber}
                      fullWidth={true}
                    />
                  </div>
                  <div className="form-group col-sm-6">
                    <TextField
                      name="ISBN_10"
                      type="number"
                      hintText="es: 8854152609"
                      errorText={errors.ISBN_10}
                      floatingLabelText="ISBN-10"
                      value={book.ISBN_10}
                      onChange={this.onChangeNumber}
                      fullWidth={true}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="form-group col-8">
                    <TextField
                      name="publisher"
                      type="text"
                      hintText="es: Newton Compton (Live)"
                      errorText={errors.publisher}
                      floatingLabelText="Editore"
                      value={book.publisher}
                      onChange={this.onChange}
                      fullWidth={true}
                    />
                  </div>
                  <div className="form-group col-4">
                    <TextField
                      name="pages_num"
                      type="number"
                      hintText="es: 128"
                      errorText={errors.pages_num}
                      floatingLabelText="Pagine"
                      value={book.pages_num}
                      onChange={this.onChangeNumber}
                      fullWidth={true}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="form-group col-8">
                    <DatePicker 
                      name="publication"
                      hintText="2013-05-01" 
                      cancelLabel="Annulla"
                      openToYearSelection={true} 
                      errorText={errors.publication}
                      floatingLabelText="Data di pubblicazione"
                      value={book.publication ? new Date(book.publication) : null}
                      onChange={this.onChangeDate("publication")}
                      fullWidth={true}
                    />
                  </div>
                  <div className="form-group col-4">
                    <TextField
                      name="edition_num"
                      type="number"
                      hintText="es: 1"
                      errorText={errors.edition_num}
                      floatingLabelText="Edizione"
                      value={book.edition_num}
                      onChange={this.onChangeNumber}
                      fullWidth={true}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="form-group col-6">
                    <SelectField
                      errorText={errors.languages}
                      floatingLabelText="Lingua"
                      value={book.languages}
                      onChange={this.onChangeSelect("languages")}
                      fullWidth={true}
                      multiple={true}
                      maxHeight={300}
                    >
                      {menuItemsMap(languages, book.languages)}
                    </SelectField>
                  </div>
                  <div className="form-group col-6">
                    <SelectField
                      errorText={errors.format}
                      floatingLabelText="Formato"
                      value={book.format}
                      onChange={this.onChangeSelect("format")}
                      fullWidth={true}
                      maxHeight={200}
                    >
                      {menuItemsMap(formats, book.format)}
                    </SelectField>
                  </div>
                </div>
                <div className="form-group">
                  <SelectField
                    errorText={errors.genres}
                    floatingLabelText="Genere (max 3)"
                    value={book.genres}
                    onChange={this.onChangeSelect("genres")}
                    fullWidth={true}
                    multiple={true}
                    maxHeight={200}
                  >
                    {menuItemsMap(genres, book.genres)}
                  </SelectField>
                </div>
                {isAdmin() &&
                  <div className="form-group">
                    <ChipInput
                      name="collections"
                      hintText="es: Sherlock Holmes"
                      errorText={errors.collections}
                      floatingLabelText="Collezione (max 5)"
                      value={book.collections}
                      onRequestAdd={chip => this.onAddChip("collections", chip)}
                      onRequestDelete={chip => this.onDeleteChip("collections", chip)}
                      disabled={!isAdmin()}
                      fullWidth={true}
                    />
                  </div>
                }
                {isEditingDescription /* || book.description */ ?
                  <div className="form-group">
                    <TextField
                      name="description"
                      id="description"
                      type="text"
                      hintText={`Inserisci una descrizione del libro (max ${description_maxChars} caratteri)...`}
                      errorText={errors.description}
                      floatingLabelText="Descrizione"
                      value={book.description}
                      onChange={this.onChangeMaxChars}
                      fullWidth={true}
                      multiLine={true}
                      //rows={4}
                    />
                    {(description_leftChars !== undefined) && 
                      <p className={`message ${(description_leftChars < 0) ? 'alert' : 'neutral'}`}>Caratteri rimanenti: {description_leftChars}</p>
                    }
                  </div>
                :
                  <div className="info-row">
                    <button className="btn flat centered" onClick={this.onEditDescription}>
                      {book.description ? 'Modifica la descrizione' : 'Aggiungi una descrizione'}
                    </button>
                  </div>
                }
                {isEditingIncipit /* || book.incipit */ ? 
                  <div className="form-group">
                    <TextField
                      name="incipit"
                      id="incipit"
                      type="text"
                      hintText={`Inserisci i primi paragrafi del libro (max ${incipit_maxChars} caratteri)...`}
                      errorText={errors.incipit}
                      floatingLabelText="Incipit"
                      value={book.incipit || ''}
                      onChange={this.onChangeMaxChars}
                      fullWidth={true}
                      multiLine={true}
                      //rows={4}
                    />
                    {(incipit_leftChars !== undefined) && 
                      <p className={`message ${(incipit_leftChars < 0) ? 'alert' : 'neutral'}`}>Caratteri rimanenti: {incipit_leftChars}</p>
                    }
                  </div>
                :
                  <div className="info-row">
                    <button className="btn flat centered" onClick={this.onEditIncipit}>
                      {book.incipit ? "Modifica l'incipit" : "Aggiungi un incipit"}
                    </button>
                  </div>
                }

                {authError && <div className="info-row"><div className="message error">{authError}</div></div>}

              </div>
            </div>
            <div className="footer no-gutter">
              <button className="btn btn-footer primary">Salva le modifiche</button>
            </div>
          </form>
          <div className="form-group">
            <button onClick={this.onExitEditing} className="btn flat centered">Annulla</button>
          </div>
        </div>
      </div>
		);
	}
}