import { DocumentData, FirestoreError } from '@firebase/firestore-types';
import React, { createContext, Dispatch, FC, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { groupFollowersRef, groupRef, userRef } from '../config/firebase';
import { handleFirestoreError } from '../config/shared';
import { GroupModel, ModeratorModel, UserModel } from '../types';
import SnackbarContext from './snackbarContext';
import UserContext from './userContext';

let groupFetch: (() => void) | undefined;
let groupFollowersFetch: (() => void) | undefined;

interface StateModel {
  follow: boolean;
  followers: UserModel[];
  item: GroupModel | null;
  loading: boolean;
  moderators: ModeratorModel[];
}

const initialState: StateModel = {
  follow: false,
  followers: [],
  item: null,
  loading: false,
  moderators: [],
};

interface GroupContextModel {
  clearStates: () => void;
  fetchGroup: (gid: string) => void;
  follow: boolean;
  followers: UserModel[];
  isOwner: boolean;
  isModerator: boolean;
  item: GroupModel | null;
  loading: boolean;
  moderators: ModeratorModel[];
  moderatorsList: string[];
  ownerUid: string | undefined;
  setFollow: Dispatch<SetStateAction<boolean>>;
  setModerators: Dispatch<SetStateAction<ModeratorModel[]>>;
}

const initialGroupContext: GroupContextModel = {
  clearStates: () => null,
  fetchGroup: () => null,
  follow: initialState.follow,
  followers: initialState.followers,
  isOwner: false,
  isModerator: false,
  item: initialState.item,
  loading: initialState.loading,
  moderators: initialState.moderators,
  moderatorsList: [],
  ownerUid: undefined,
  setFollow: () => false,
  setModerators: () => [],
};

const GroupContext = createContext<GroupContextModel>(initialGroupContext);

export default GroupContext;

export const GroupProvider: FC = ({ children }) => {
  const { user } = useContext(UserContext);
  const { openSnackbar } = useContext(SnackbarContext);
  const [follow, setFollow] = useState<boolean>(initialState.follow);
  const [followers, setFollowers] = useState<UserModel[]>(initialState.followers);
  const [item, setItem] = useState<GroupModel | null>(initialState.item);
  const [loading, setLoading] = useState<boolean>(initialState.loading);
  const [moderators, setModerators] = useState<ModeratorModel[]>(initialState.moderators);

  const ownerUid: string | undefined = item?.ownerUid;
  const isOwner: boolean = user?.uid === ownerUid;
  const moderatorsList = useMemo((): string[] => item?.moderators || [], [item?.moderators]);
  const isModerator = useMemo((): boolean => Boolean(moderatorsList?.some((uid: string): boolean => uid === user?.uid)), [moderatorsList, user]);

  const fetchFollowers = useCallback(gid => {
    setLoading(true);
    groupFollowersFetch = groupFollowersRef(gid).onSnapshot((snap: DocumentData): void => {
      if (!snap.empty) {
        const followers: UserModel[] = [];
        snap.forEach((follower: DocumentData): number => followers.push(follower.data()));
        setFollowers(followers);
      } else {
        setFollowers(initialState.followers);
        setFollow(initialState.follow);
      }
    }, (err: FirestoreError) => openSnackbar(handleFirestoreError(err), 'error'));
  }, [openSnackbar]);

  const fetchModerators = useCallback((moderators: string[]): void => {
    const items: ModeratorModel[] = [];
    moderators.forEach((uid: string): void => {
      userRef(uid).get().then((snap: DocumentData): void => {
        if (snap.exists) {
          items.push(snap.data());
        }
      }).catch((err: FirestoreError) => openSnackbar(handleFirestoreError(err), 'error'));
    });
    setModerators(items);
  }, [openSnackbar]);

  const fetchGroup = useCallback((gid: string): void => {
    setLoading(true);
    groupFetch = groupRef(gid).onSnapshot((snap: DocumentData): void => {
      if (snap.exists) {
        setItem(snap.data());
        setLoading(false);
        fetchFollowers(gid);
        if (snap.data()?.moderators?.length > 1) {
          fetchModerators(snap.data()?.moderators);
        }
      }
    }, (err: FirestoreError) => openSnackbar(handleFirestoreError(err), 'error'));
  }, [fetchFollowers, fetchModerators, openSnackbar]);

  useEffect(() => {
    setFollow(followers.some((follower: UserModel): boolean => follower.uid === user?.uid));
  }, [followers, user]);

  useEffect(() => () => {
    groupFetch?.();
    groupFollowersFetch?.();
  }, []);

  const clearStates = useCallback(() => {
    setFollow(initialState.follow);
    setFollowers(initialState.followers);
    setItem(initialState.item);
    setLoading(initialState.loading);
    setModerators(initialState.moderators);
  }, []);

  const GroupProvided = useMemo((): GroupContextModel => ({ 
    clearStates, 
    fetchGroup, 
    follow, 
    followers, 
    isOwner, 
    isModerator, 
    item, 
    loading, 
    moderators, 
    moderatorsList,
    ownerUid, 
    setFollow, 
    setModerators
  }), [clearStates, fetchGroup, follow, followers, isOwner, isModerator, item, loading, moderators, moderatorsList, ownerUid]);

  return (
    <GroupContext.Provider
      value={GroupProvided}>
      {children}
    </GroupContext.Provider>
  );
};