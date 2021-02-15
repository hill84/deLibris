import { FirestoreError } from '@firebase/firestore-types';
import Avatar from '@material-ui/core/Avatar';
import Grow from '@material-ui/core/Grow';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { TransitionProps } from '@material-ui/core/transitions';
import React, { FC, forwardRef, Fragment, MouseEvent, ReactElement, Ref, useCallback, useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { groupDiscussionRef } from '../config/firebase';
import icon from '../config/icons';
import { getInitials, handleFirestoreError, isToday, timeSince } from '../config/shared';
import GroupContext from '../context/groupContext';
import SnackbarContext from '../context/snackbarContext';
import UserContext from '../context/userContext';
import { DiscussionModel, FlagModel } from '../types';
import FlagDialog from './flagDialog';
import MinifiableText from './minifiableText';

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>,
) {
  return <Grow ref={ref} {...props} />;
});

interface DiscussionProps {
  discussion: DiscussionModel;
  gid?: string;
}

const Discussion: FC<DiscussionProps> = ({
  discussion,
  gid,
}: DiscussionProps) => {
  const { isAdmin, isEditor, user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const { 
    isOwner: isGroupOwner, 
    isModerator: isGroupModerator, 
    moderatorsList,
    ownerUid: groupOwner
  } = useContext(GroupContext);
  const [flagLoading, setFlagLoading] = useState<boolean>(false);
  const [actionsAnchorEl, setActionsAnchorEl] = useState<Element | null>(null);
  const [isOpenFlagDialog, setIsOpenFlagDialog] = useState<boolean>(false);

  const onFlagRequest = (): void => setIsOpenFlagDialog(true);

  const onCloseFlagDialog = (): void => setIsOpenFlagDialog(false);

  const onFlag = useCallback((value: string): void => {
    if (user && gid) {
      const flag: FlagModel = {
        value,
        flaggedByUid: user.uid,
        flagged_num: Date.now()
      };
  
      setFlagLoading(true);
      groupDiscussionRef(gid, discussion.did).update({ flag }).then((): void => {
        setFlagLoading(false);
        setIsOpenFlagDialog(false);
        openSnackbar('Discussione segnalata agli amministratori', 'success');
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn('Cannot flag');
  }, [gid, openSnackbar, discussion, user]);

  const onRemoveFlag = useCallback((): void => {
    if (isAdmin && gid) {
      setFlagLoading(true);
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      const { flag, ...rest }: DiscussionModel = discussion;
      groupDiscussionRef(gid, discussion.did).set(rest).then((): void => {
        setFlagLoading(false);
        openSnackbar('Segnalazione rimossa', 'success');
      }).catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn('Cannot remove flag');
  }, [gid, isAdmin, openSnackbar, discussion]);

  const onDelete = (): void => {
    if (gid) {
      groupDiscussionRef(gid, discussion.did).delete().catch((err: FirestoreError): void => openSnackbar(handleFirestoreError(err), 'error'));
    } else console.warn('No gid');
  };

  const onOpenActionsMenu = (e: MouseEvent): void => setActionsAnchorEl(e.currentTarget);

  const onCloseActionsMenu = (): void => setActionsAnchorEl(null);

  const isOwner = useMemo((): boolean => discussion.createdByUid === user?.uid, [discussion.createdByUid, user]);
  const flaggedByUser = useMemo((): boolean => (discussion.flag && discussion.flag.flaggedByUid) === user?.uid, [discussion.flag, user]);
  const classNames = useMemo((): string => `${isOwner ? 'own discussion' : 'discussion'} ${discussion.flag ? `flagged ${discussion.flag.value}` : ''}`, [isOwner, discussion]);

  return (
    <Fragment>
      <div className={classNames} id={discussion.did}>
        <div className='row'>
          <div className='col-auto left'>
            <Link to={`/dashboard/${discussion.createdByUid}`}>
              <Avatar className='avatar' src={discussion.photoURL} alt={discussion.displayName}>
                {!discussion.photoURL && getInitials(discussion.displayName)}
              </Avatar>
            </Link>
          </div>
          <div className='col right'>
            <div className='head row'>
              <Link to={`/dashboard/${discussion.createdByUid}`} className='col author'>
                <h3>
                  {discussion.displayName} {moderatorsList?.some(uid => uid === discussion.createdByUid) && (
                    <span className='text-sm text-regular lighter-text hide-sm'>({discussion.createdByUid === groupOwner ? 'creatore' : 'moderatore'})</span>
                  )}
                </h3>
              </Link>

              <div className='col-auto text-right counter last date hide-xs'>
                {isToday(discussion.created_num) ? timeSince(discussion.created_num) : new Date(discussion.created_num).toLocaleDateString()}
              </div>

              {isEditor && (
                <div className='col-auto'>
                  <button
                    type='button'
                    className='btn sm flat rounded icon'
                    onClick={actionsAnchorEl ? onCloseActionsMenu : onOpenActionsMenu}>
                    {actionsAnchorEl ? icon.close : icon.dotsVertical}
                  </button>
                  <Menu
                    id='actions-menu'
                    className='dropdown-menu'
                    anchorEl={actionsAnchorEl}
                    onClick={onCloseActionsMenu}
                    open={Boolean(actionsAnchorEl)}
                    onClose={onCloseActionsMenu}>
                    {!isOwner && <MenuItem onClick={onFlagRequest} disabled={flaggedByUser}>Segnala</MenuItem>}
                    {!isOwner && isAdmin && flaggedByUser && <MenuItem onClick={onRemoveFlag}>Rimuovi segnalazione</MenuItem>}
                    {(isOwner || isAdmin || isGroupModerator || isGroupOwner) && <MenuItem onClick={onDelete}>Elimina</MenuItem>}
                  </Menu>
                </div>
              )}
            </div>
            <div className='info-row text'>
              <MinifiableText text={discussion.text} maxChars={500} rich />
            </div>
          </div>
        </div>
      </div>

      {isOpenFlagDialog && (
        <FlagDialog 
          loading={flagLoading}
          open={isOpenFlagDialog}
          onClose={onCloseFlagDialog}
          onFlag={onFlag}
          TransitionComponent={Transition}
          value={flaggedByUser ? discussion.flag?.value : ''}
        />
      )}
    </Fragment>
  );
};

export default Discussion;