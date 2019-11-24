import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { noteRef, notesRef } from '../../config/firebase';
import { noteTypes } from '../../config/lists';
import { funcType, stringType, userType } from '../../config/types';
import Overlay from '../overlay';

const NoteForm = props => {
  const [state, setState] = useState({
    data: {
      text: ''
    },
    text_leftChars: null,
    text_maxChars: 280,
    text_minChars: 10,
    loading: false,
    errors: {}
  });

  const is = useRef(true);
  const { nid, onToggle, openSnackbar, uid, user } = props;
  const { data, text_leftChars, text_maxChars, text_minChars, loading, errors } = state;

  const fetch = useCallback(() => {
    if (nid && uid) {
      if (is.current) setState(prevState => ({ ...prevState, loading: true }));
      
      noteRef(uid, nid).get().then(snap => {
        if (!snap.empty) {
          if (is.current) {
            setState(prevState => ({ 
              ...prevState,
              data: snap.data(),
              loading: false
            }));
          }
        }
      }).catch(error => console.warn(error));
    }
  }, [nid, uid]);

  const onChangeSelect = name => e => {
    e.persist();
    const { value } = e.target;

    if (is.current) {
      setState(prevState => ({
        ...prevState,
        data: { ...prevState.data, [name]: value }, 
        errors: { ...prevState.errors, [name]: null }
      }));
    }
  };
  
  const onChangeMaxChars = e => {
    e.persist();
    const { name, value } = e.target;
    const leftChars = `${name}_leftChars`;
    const maxChars = `${name}_maxChars`;
    
    if (is.current) {
      setState(prevState => ({
        ...prevState,
        data: { ...prevState.data, [name]: value }, 
        [leftChars]: prevState[maxChars] - value.length,
        errors: { ...prevState.errors, [name]: null }
      }));
    }
  };

  const validate = data => {
		const errors = {};
    if (!data.text) { 
      errors.text = "Inserisci il testo"; 
    } else if (data.text && data.text.length > text_maxChars) {
      errors.text = `Lunghezza massima ${text_maxChars} caratteri`;
    } else if (data.text && data.text.length < text_minChars) {
      errors.text = `Lunghezza minima ${text_minChars} caratteri`;
    }
    if (!data.tag) { 
      errors.tag = "Scegli un tag"; 
    }
		return errors;
	};

	const onSubmit = e => {
    e.preventDefault();
    const errors = validate(data);
    
		if (is.current) setState(prevState => ({ ...prevState, errors }));
    
		if (Object.keys(errors).length === 0) {
      if (is.current) setState(prevState => ({ ...prevState, loading: true }));
      
      // console.log(`Sending notification to ${uid}`);
      const newNoteRef = notesRef(uid).doc();
      const ref = nid ? noteRef(uid, nid) : newNoteRef;
      // if (!nid) { notesRef(uid).set({ count: 0 }) }
      ref.set({
        nid: nid || newNoteRef.id,
        text: data.text,
        created_num: Number((new Date()).getTime()),
        createdBy: user.displayName,
        createdByUid: user.uid,
        tag: data.tag,
        read: false,
        uid
      }).then(() => {
        onToggle();
        if (is.current) setState(prevState => ({ ...prevState, loading: false, data: { text: '' } }));
        openSnackbar(nid ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
      }).catch(err => console.warn(err));
		}
	};

  useEffect(() => {
    fetch();
  }, [fetch, nid])

  useEffect(() => () => {
    is.current = false;
  }, []);

  const menuItemsMap = (arr, values) => arr.map(item => 
    <MenuItem 
      value={item} 
      key={item} 
      // insetChildren={Boolean(values)} 
      checked={values ? values.includes(item) : false}>
      {item}
    </MenuItem>
  );

  return (
    <>
      <Overlay onClick={onToggle} />
      <div role="dialog" aria-describedby="new note" className="dialog light">
        {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
        <div className="content">
          <div className="row">
            <div className="form-group col">
              <FormControl className="input-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.text)} htmlFor="text">Testo della notifica</InputLabel>
                <Input
                  id="text"
                  name="text"
                  type="text"
                  autoFocus
                  placeholder={`Inserisci il testo (max ${text_maxChars} caratteri)...`}
                  value={data.text}
                  onChange={onChangeMaxChars}
                  rowsMax={8}
                  multiline
                  error={Boolean(errors.text)}
                />
                {errors.text && <FormHelperText className="message error">{errors.text}</FormHelperText>}
                {(text_leftChars !== null) && 
                  <FormHelperText className={`message ${(text_leftChars < 0) ? 'alert' : 'neutral'}`}>
                    Caratteri rimanenti: {text_leftChars}
                  </FormHelperText>
                }
              </FormControl>
            </div>
          </div>
          <div className="row">
            <div className="form-group col">
              <FormControl className="select-field" margin="normal" fullWidth>
                <InputLabel error={Boolean(errors.tag)} htmlFor="tag">Tag</InputLabel>
                <Select
                  id="tag"
                  error={Boolean(errors.tag)}
                  value={data.tag || []}
                  onChange={onChangeSelect("tag")}
                  multiple>
                  {menuItemsMap(noteTypes, data.tag)}
                </Select>
                {errors.tag && <FormHelperText className="message error">{errors.tag}</FormHelperText>}
              </FormControl>
            </div>
          </div>
        </div>
        <div className="footer no-gutter">
          <button type="button" className="btn btn-footer primary" onClick={onSubmit}>Salva le modifiche</button>
        </div>
      </div>
    </>
  );
}

NoteForm.propTypes = {
  onToggle: funcType.isRequired,
  openSnackbar: funcType.isRequired,
  nid: stringType,
  uid: stringType.isRequired,
  user: userType
}

NoteForm.defaultProps = {
  nid: null,
  user: null
}
 
export default NoteForm;







/* export default class NoteForm extends Component {
	state = {
    data: {
      text: ''
    },
    text_maxChars: 280,
    text_minChars: 10,
    loading: false,
    errors: {}
  }

  static propTypes = {
    onToggle: funcType.isRequired,
    openSnackbar: funcType.isRequired,
    nid: stringType,
    uid: stringType.isRequired,
    user: userType
  }

  static defaultProps = {
    nid: null,
    user: null
  }

  componentDidMount() {
    const { nid, uid } = this.props;
    this._isMounted = true;
    if (nid && uid) {
      this.fetch();
    }
  }
  
  componentDidUpdate(prevProps) {
    const { nid, uid } = this.props;
    if (this._isMounted) {
      if (nid !== prevProps.nid || uid !== prevProps.uid) {
        this.fetch();
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  fetch = () => {
    const { nid, uid } = this.props;
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    if (nid && uid) {
      // console.log({ nid, uid });
      noteRef(uid, nid).get().then(snap => {
        if (!snap.empty) {
          // console.log(snap.data());
          if (this._isMounted) {
            this.setState({ 
              data: snap.data(),
              loading: false
            });
          }
        }
      }).catch(error => console.warn(error));
    }
  }

  onToggle = () => this.props.onToggle(this.state.selectedId);

	onChange = e => {
    e.persist();
    const { name, value } = e.target;
    
    if (this._isMounted) {
      this.setState(prevState => ({ 
        data: { ...prevState.data, [name]: value }, 
        errors: { ...prevState.errors, [name]: null }
      }));
    }
  };

  onChangeSelect = name => e => {
    e.persist();
    const { value } = e.target;

    if (this._isMounted) {
      this.setState(prevState => ({ 
        data: { ...prevState.data, [name]: value }, 
        errors: { ...prevState.errors, [name]: null }
      }));
    }
  };
  
  onChangeMaxChars = e => {
    e.persist();
    const { name, value } = e.target;
    const leftChars = `${name}_leftChars`;
    const maxChars = `${name}_maxChars`;
    
    if (this._isMounted) {
      this.setState(prevState => ({
        data: { ...prevState.data, [name]: value }, 
        [leftChars]: prevState[maxChars] - value.length,
        errors: { ...prevState.errors, [name]: null }
      }));
    }
  };

	onSubmit = e => {
    e.preventDefault();
    const { data } = this.state;
    const { nid, openSnackbar, uid, user } = this.props;
    const errors = this.validate(data);
    
		if (this._isMounted) this.setState({ errors });
    
		if (Object.keys(errors).length === 0) {
      if (this._isMounted) this.setState({ loading: true });
      
      // console.log(`Sending notification to ${uid}`);
      const newNoteRef = notesRef(uid).doc();
      const ref = nid ? noteRef(uid, nid) : newNoteRef;
      // if (!nid) { notesRef(uid).set({ count: 0 }) }
      ref.set({
        nid: nid || newNoteRef.id,
        text: data.text,
        created_num: Number((new Date()).getTime()),
        createdBy: user.displayName,
        createdByUid: user.uid,
        tag: data.tag,
        read: false,
        uid
      }).then(() => {
        this.onToggle();
        if (this._isMounted) this.setState({ loading: false, data: { text: '' } });
        openSnackbar(nid ? 'Modifiche salvate' : 'Nuovo elemento creato', 'success');
      }).catch(err => console.warn(err));
		}
	};

	validate = data => {
		const errors = {};
    if (!data.text) { 
      errors.text = "Inserisci il testo"; 
    } else if (data.text && data.text.length > this.state.text_maxChars) {
      errors.text = `Lunghezza massima ${this.state.text_maxChars} caratteri`;
    } else if (data.text && data.text.length < this.state.text_minChars) {
      errors.text = `Lunghezza minima ${this.state.text_minChars} caratteri`;
    }
    if (!data.tag) { 
      errors.tag = "Scegli un tag"; 
    }
		return errors;
	};

	render() {
    const { data, errors, loading, text_leftChars, text_maxChars } = this.state;

    const menuItemsMap = (arr, values) => arr.map(item => 
			<MenuItem 
				value={item} 
				key={item} 
				// insetChildren={Boolean(values)} 
				checked={values ? values.includes(item) : false}>
				{item}
      </MenuItem>
    );

		return (
			<>
        <Overlay onClick={this.onToggle} />
        <div role="dialog" aria-describedby="new note" className="dialog light">
          {loading && <div aria-hidden="true" className="loader"><CircularProgress /></div>}
          <div className="content">
            <div className="row">
              <div className="form-group col">
                <FormControl className="input-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.text)} htmlFor="text">Testo della notifica</InputLabel>
                  <Input
                    id="text"
                    name="text"
                    type="text"
                    autoFocus
                    placeholder={`Inserisci il testo (max ${text_maxChars} caratteri)...`}
                    value={data.text}
                    onChange={this.onChangeMaxChars}
                    rowsMax={8}
                    multiline
                    error={Boolean(errors.text)}
                  />
                  {errors.text && <FormHelperText className="message error">{errors.text}</FormHelperText>}
                  {(text_leftChars !== undefined) && 
                    <FormHelperText className={`message ${(text_leftChars < 0) ? 'alert' : 'neutral'}`}>
                      Caratteri rimanenti: {text_leftChars}
                    </FormHelperText>
                  }
                </FormControl>
              </div>
            </div>
					  <div className="row">
              <div className="form-group col">
                <FormControl className="select-field" margin="normal" fullWidth>
                  <InputLabel error={Boolean(errors.tag)} htmlFor="tag">Tag</InputLabel>
                  <Select
                    id="tag"
                    error={Boolean(errors.tag)}
                    value={data.tag || []}
                    onChange={this.onChangeSelect("tag")}
                    multiple>
                    {menuItemsMap(noteTypes, data.tag)}
                  </Select>
                  {errors.tag && <FormHelperText className="message error">{errors.tag}</FormHelperText>}
                </FormControl>
              </div>
            </div>
          </div>
          <div className="footer no-gutter">
            <button type="button" className="btn btn-footer primary" onClick={this.onSubmit}>Salva le modifiche</button>
          </div>
        </div>
      </>
		);
	}
} */