import MomentUtils from '@date-io/moment';
import Avatar from '@material-ui/core/Avatar';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { DatePicker, LocalizationProvider } from '@material-ui/pickers';
import { storage } from 'firebase';
import moment from 'moment';
import 'moment/locale/it';
import React, { ChangeEvent, FC, FormEvent, Fragment, ReactText, useContext, useState } from 'react';
import { storageRef, userRef } from '../../config/firebase';
import icon from '../../config/icons';
import { continents, europeanCountries, italianProvinces, languages, northAmericanCountries } from '../../config/lists';
import { app, calcAge, getInitials, urlRegex, validateImg } from '../../config/shared';
import SnackbarContext, { SnackbarContextModel } from '../../context/snackbarContext';
import UserContext from '../../context/userContext';
import '../../css/profileForm.css';
import { UserContextModel, UserModel } from '../../types';

const min: Record<string, number> = {
  birth_date: new Date().setFullYear(new Date().getFullYear() - 120)
};

const max: Record<string, number> = {
  birth_date: new Date().setFullYear(new Date().getFullYear() - 14)
};

interface ProfileFormProps {
  user: UserModel;
}

interface StateModel {
  imgLoading: boolean;
  imgPreview: string;
  imgProgress: number;
  loading: boolean;
  changes: boolean;
  saved: boolean;
  errors: Record<string, ReactText | null>;
  isEditingSocial: boolean;
}

const initialState: StateModel = {
  imgLoading: false,
  imgPreview: '',
  imgProgress: 0,
  loading: false,
  changes: false,
  saved: false,
  errors: {},
  isEditingSocial: false,
};

const ProfileForm: FC<ProfileFormProps> = ({ user: _user }: ProfileFormProps) => {
  const { isAdmin, user: contextUser } = useContext<UserContextModel>(UserContext);
  const { openSnackbar } = useContext<SnackbarContextModel>(SnackbarContext);
  const [user, setUser] = useState<UserModel>(_user);
  const [imgLoading, setImgLoading] = useState<boolean>(initialState.imgLoading);
  const [imgPreview, setImgPreview] = useState<string>(user.photoURL);
  const [imgProgress, setImgProgress] = useState<number>(initialState.imgProgress);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [changes, setChanges] = useState<boolean>(initialState.changes);
  const [saved, setSaved] = useState<boolean>(initialState.saved);
  const [errors, setErrors] = useState<Record<string, ReactText | null>>(initialState.errors);
  const [isEditingSocial, setIsEditingSocial] = useState<boolean>(initialState.isEditingSocial);

  const luid: string | undefined = contextUser?.uid;
  const uid: string = user?.uid;

  const setChange = (name: string, value: string): void => {
    setUser({ ...user, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
    setSaved(false);
    setChanges(true);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.persist();
    const { name, value } = e.target;
    setChange(name, value);
  };

  const onChangeSelect = (e: ChangeEvent<{ name?: string; value: unknown }>): void => {
    e.persist();
    const { name, value } = e.target;
    if (name) setChange(name, value as string);
  };

  const onChangeDate = (name: string) => (date: number): void => {
    const value = String(date);
    setChange(name, value);
  };

  const onSetDatePickerError = (name: string, reason: string): void => {
    const errorMessages: Record<string, string> = {
      disableFuture: 'Data futura non valida',
      disablePast: 'Data passata non valida',
      invalidDate: 'Data non valida',
      minDate: `Data non valida prima del ${new Date(min[name]).toLocaleDateString()}`,
      maxDate: `Data non valida oltre il ${new Date(max[name]).toLocaleDateString()}`
    };
    
    setErrors(errors => ({ ...errors, [name]: errorMessages[reason] }));
  };

  const validate = (user: UserModel) => {
    const errors: Record<string, string> = {};

    if (!user.displayName) errors.displayName = 'Inserisci un nome utente';
    if (new Date(user.birth_date).getTime() > new Date().getTime()) { 
      errors.birth_date = 'Data di nascita non valida'; 
    } else if (calcAge(user.birth_date) < 13) { 
      errors.birth_date = 'Età minima 14 anni'; 
    } else if (calcAge(user.birth_date) > 119) {
      errors.birth_date = 'E chi sei.. Matusalemme?'; 
    }
    if (user.city?.length > 150) errors.city = 'Lunghezza massima 150 caratteri';
    if (user.website && !user.website.match(urlRegex)) errors.website = 'URL non valido';
    if (user.youtube?.includes('youtube.com')) errors.youtube = 'Rimuovi "https://www.youtube.com/channel/"';
    if (user.instagram?.includes('instagram.com')) errors.instagram = 'Rimuovi "https://www.instagram.com/"';
    if (user.twitch?.includes('twitch.tv')) errors.twitch = 'Rimuovi "https://www.twitch.tv/"';
    if (user.facebook?.includes('facebook.com')) errors.facebook = 'Rimuovi "https://www.facebook.com/"';
    return errors;
  };

  const onImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const file: File | undefined = e.target.files?.[0];
    
    if (file) {
      const error: string | undefined = validateImg(file, 1);
  
      if (!error) {
        setImgLoading(true);
        setErrors({ ...errors, upload: null });
        const uploadTask: storage.UploadTask = storageRef.child(`users/${uid}/avatar`).put(file);
        const unsubUploadTask: Function = uploadTask.on('state_changed', (snap: storage.UploadTaskSnapshot): void => {
          setImgProgress((snap.bytesTransferred / snap.totalBytes) * 100);
        }, (err: Error): void => {
          // console.warn(`Upload error: ${error.message}`);
          setErrors({ ...errors, upload: err.message });
          setImgLoading(false);
          setImgProgress(0);
          openSnackbar(err.message, 'error');
        }, (): void => {
          // console.log('upload completed');
          uploadTask.then((snap: storage.UploadTaskSnapshot): void => {
            snap.ref.getDownloadURL().then((url: string): void => {
              setImgLoading(false);
              setImgPreview(url);
              setChanges(true);
              setSaved(false);
              openSnackbar('Immagine caricata', 'success');
            });
          });
          unsubUploadTask();
        });
      } else {
        setErrors({ ...errors, upload: error });
        openSnackbar(error, 'error');
        setTimeout((): void => {
          setErrors({ ...errors, upload: null });
        }, 2000);
      }
    }
  };
  
  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const errors: Record<string, string | number> = validate(user);
    
    setErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setLoading(true);
      setIsEditingSocial(false);

      userRef(uid).set({
        ...user,
        photoURL: imgPreview || '',
        sex: user.sex || '',
        birth_date: user.birth_date || '',
        city: user.city || '',
        country: user.country || ''
      }).then((): void => {
        setImgProgress(0);
        setChanges(false);
        setSaved(true);
        openSnackbar('Modifiche salvate', 'success');
        // setRedirectToReferrer(true);
      }).catch((err: Error): void => {
        openSnackbar(err.message, 'error');
      }).finally((): void => {
        setLoading(false);
      });
    } else openSnackbar('Ricontrolla i dati inseriti', 'error');
  };

  const onToggleSocial = (): void => setIsEditingSocial(isEditingSocial => !isEditingSocial);
  
  const menuItemsMap = (arr: Record<string, string>[]) => arr.map(({ name, nativeName, id }: Record<string, string>) => (
    <MenuItem
      value={name}
      title={nativeName}
      key={id}>
      {name}
    </MenuItem>
  ));
  
  // if (!user) return null;

  return (
    <Fragment>
      {loading && <div aria-hidden='true' className='loader'><CircularProgress /></div>}
      <div className='container sm'>
        <div className='row basic-profile'>
          
          <div className='col-auto'>
            <div className={`upload-avatar ${errors.upload ? 'error' : imgProgress === 100 ? 'success' : ''}`}>
              <Avatar className='avatar' src={imgPreview} alt={user.displayName}>{!imgPreview && getInitials(user.displayName)}</Avatar>
              {imgLoading ? (
                <div aria-hidden='true' className='loader'><CircularProgress /></div>
              ) : (
                <div className='overlay'>
                  <span title="Carica un'immagine">+</span>
                  <input type='file' accept='image/*' className='upload' onChange={onImageChange}/>
                </div>
              )}
            </div>
          </div>
          <div className='col'>
            <div className='username'>{user.displayName || 'Innominato'}</div>
            <div className='email'>{user.email}</div>
          </div>
        </div>

        <div>&nbsp;</div>

        <form onSubmit={onSubmit} noValidate>
          <div className='form-group'>
            <FormControl className='input-field' margin='normal' fullWidth>
              <InputLabel error={Boolean(errors.displayName)} htmlFor='displayName'>Nome e cognome</InputLabel>
              <Input
                id='displayName'
                name='displayName'
                type='text'
                placeholder='es: Mario Rossi'
                value={user.displayName || ''}
                readOnly={!isAdmin}
                onChange={onChange}
                error={Boolean(errors.displayName)}
              />
              {!isAdmin && (
                user.displayName && (
                  <FormHelperText className='message'>
                    Per modificare il <span className='hide-sm'>nominativo</span><span className='show-sm'>nome</span> scrivi a <a href={`mailto:${app.email}?subject=Biblo: modifica nominativo utente`}>{app.email}</a>.
                  </FormHelperText>
                )
              )}
              {errors.displayName && (
                <FormHelperText className='message error'>
                  {errors.displayName}
                </FormHelperText>
              )}
            </FormControl>
          </div>

          <div className='row'>
            <div className='col form-group'>
              <FormControl className='select-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.sex)} htmlFor='sex'>Sesso</InputLabel>
                <Select
                  id='sex'
                  placeholder='es: Femmina'
                  name='sex'
                  value={user.sex || ''}
                  onChange={onChangeSelect}
                  error={Boolean(errors.sex)}>
                  <MenuItem key='m' value='m'>Uomo</MenuItem>
                  <MenuItem key='f' value='f'>Donna</MenuItem>
                  <MenuItem key='x' value='x'>Altro</MenuItem>
                </Select>
                {errors.sex && <FormHelperText className='message error'>{errors.sex}</FormHelperText>}
              </FormControl>
            </div>

            <div className='col form-group'>
              <LocalizationProvider dateAdapter={MomentUtils} dateLibInstance={moment} locale='it'>
                <DatePicker 
                  className='date-picker'
                  cancelText='Annulla'
                  leftArrowIcon={icon.chevronLeft}
                  rightArrowIcon={icon.chevronRight}
                  inputFormat='DD/MM/YYYY'
                  // invalidDateMessage='Data non valida'
                  minDate={min.birth_date}
                  maxDate={max.birth_date}
                  // minDateMessage='Chi sei? ...Matusalemme?'
                  // maxDateMessage='Età minima 14 anni'
                  label='Data di nascita'
                  // autoOk
                  value={user.birth_date ? new Date(user.birth_date) : null}
                  onChange={() => onChangeDate('birth_date')}
                  onError={reason => onSetDatePickerError('birth_date', reason || '')}
                  renderInput={props => (
                    <TextField {...props} margin='normal' fullWidth helperText={errors.birth_date} />
                  )}
                />
              </LocalizationProvider>
            </div>
          </div>

          <div className='form-group'>
            <FormControl className='select-field' margin='normal' fullWidth>
              <InputLabel htmlFor='languages'>{`Lingue conosciute ${user.languages?.length > 1 ? ` (${user.languages.length})` : ''}`}</InputLabel>
              <Select
                id='languages'
                placeholder='es: Italiano, Spagnolo'
                name='languages'
                value={user.languages || []}
                onChange={onChangeSelect}
                multiple>
                {menuItemsMap(languages)}
              </Select>
            </FormControl>
          </div>

          <div className='row'>
            <div className='col form-group'>
              <FormControl className='select-field' margin='normal' fullWidth>
                <InputLabel htmlFor='continent'>Continente</InputLabel>
                <Select
                  id='continent'
                  placeholder='es: Europa'
                  name='continent'
                  value={user.continent || ''}
                  onChange={onChangeSelect}>
                  {menuItemsMap(continents)}
                </Select>
              </FormControl>
            </div>

            {(user.continent === 'Europa' || user.continent === 'Nordamerica') && (
              <div className='col form-group'>
                <FormControl className='select-field' margin='normal' fullWidth>
                  <InputLabel htmlFor='nation'>Nazione</InputLabel>
                  <Select
                    id='nation'
                    placeholder='es: Italia'
                    name='country'
                    value={user.country || ''}
                    onChange={onChangeSelect}>
                    {user.continent === 'Europa' && menuItemsMap(europeanCountries)}
                    {user.continent === 'Nordamerica' && menuItemsMap(northAmericanCountries)}
                  </Select>
                </FormControl>
              </div>
            )}
          </div>

          <div className='form-group'>
            {user.country && user.country === 'Italia‎' ? (
              <FormControl className='select-field' margin='normal' fullWidth>
                <InputLabel htmlFor='city'>Provincia</InputLabel>
                <Select
                  id='city'
                  placeholder='es: Torino'
                  name='city'
                  value={user.city || ''}
                  onChange={onChangeSelect}>
                  {menuItemsMap(italianProvinces)}
                </Select>
              </FormControl>
            ) : (
              <FormControl className='input-field' margin='normal' fullWidth>
                <InputLabel error={Boolean(errors.city)} htmlFor='city'>Città</InputLabel>
                <Input
                  id='city'
                  name='city'
                  type='text'
                  placeholder='es: New York'
                  value={user.city || ''}
                  onChange={onChange}
                  error={Boolean(errors.city)}
                />
                {errors.city && <FormHelperText className='message error'>{errors.city}</FormHelperText>}
              </FormControl>
            )}
          </div>

          {isEditingSocial ? (
            <>
              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.website)} htmlFor='website'>Sito internet o blog</InputLabel>
                  <Input
                    id='website'
                    name='website'
                    type='url'
                    placeholder={`es: ${app.url}`}
                    value={user.website || ''}
                    onChange={onChange}
                    error={Boolean(errors.website)}
                  />
                  {errors.website && <FormHelperText className='message error'>{errors.website}</FormHelperText>}
                </FormControl>
              </div>

              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.youtube)} htmlFor='youtube'>Canale Youtube</InputLabel>
                  <Input
                    id='youtube'
                    name='youtube'
                    type='url'
                    autoComplete='https://www.youtube.com/channel/'
                    placeholder='es: bibloSpace'
                    value={user.youtube || ''}
                    onChange={onChange}
                    error={Boolean(errors.youtube)}
                  />
                  {errors.youtube && <FormHelperText className='message error'>{errors.youtube}</FormHelperText>}
                </FormControl>
              </div>

              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.instagram)} htmlFor='instagram'>Profilo Instagram</InputLabel>
                  <Input
                    id='instagram'
                    name='instagram'
                    type='url'
                    autoComplete='https://www.instagram.com/'
                    placeholder='es: bibloSpace'
                    value={user.instagram || ''}
                    onChange={onChange}
                    error={Boolean(errors.instagram)}
                  />
                  {errors.instagram && <FormHelperText className='message error'>{errors.instagram}</FormHelperText>}
                </FormControl>
              </div>

              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.twitch)} htmlFor='twitch'>Canale Twitch</InputLabel>
                  <Input
                    id='twitch'
                    name='twitch'
                    type='url'
                    autoComplete='https://www.twitch.tv/'
                    placeholder='es: bibloSpace'
                    value={user.twitch || ''}
                    onChange={onChange}
                    error={Boolean(errors.twitch)}
                  />
                  {errors.twitch && <FormHelperText className='message error'>{errors.twitch}</FormHelperText>}
                </FormControl>
              </div>

              <div className='form-group'>
                <FormControl className='input-field' margin='normal' fullWidth>
                  <InputLabel error={Boolean(errors.facebook)} htmlFor='facebook'>Pagina Facebook</InputLabel>
                  <Input
                    id='facebook'
                    name='facebook'
                    type='url'
                    autoComplete='https://www.facebook.com/'
                    placeholder='es: bibloSpace'
                    value={user.facebook || ''}
                    onChange={onChange}
                    error={Boolean(errors.facebook)}
                  />
                  {errors.facebook && <FormHelperText className='message error'>{errors.facebook}</FormHelperText>}
                </FormControl>
              </div>
            </>
          ) : (
            <div className='info-row'>
              <button type='button' className='btn flat rounded centered' onClick={onToggleSocial}>
                {(user.website || user.youtube || user.instagram || user.twitch || user.facebook) ? 'Modifica' : 'Aggiungi'} profili social
              </button>
            </div>
          )}
          
          <div>&nbsp;</div>

          {luid === uid && (
            <FormHelperText className='message'>
              Per cancellare l&apos;account scrivi a <a href={`mailto:${app.email}?subject=Biblo: cancellazione account utente`}>{app.email}</a>.
            </FormHelperText>
          )}

        </form>
      </div>
      <div className='footer no-gutter'>
        <button type='button' className={`btn btn-footer ${saved && !changes ? 'success' : 'primary'}`} disabled={!changes} onClick={onSubmit as (e: FormEvent) => void}>
          {saved ? 'Modifiche salvate' : 'Salva le modifiche'}
        </button>
      </div>
    </Fragment>
  );
};

export default ProfileForm;