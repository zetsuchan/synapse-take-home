import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { atom, useAtomValue, useSetAtom } from 'jotai';

const appStateAtom = atom<AppStateStatus>(AppState.currentState);
const isForegroundAtom = atom((get) => get(appStateAtom) === 'active');

export function useAppForeground() {
  const setAppState = useSetAtom(appStateAtom);
  const isForeground = useAtomValue(isForegroundAtom);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);

    return () => {
      subscription.remove();
    };
  }, [setAppState]);

  return isForeground;
}
