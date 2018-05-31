import { Dispatch, Action } from 'redux';

export enum AppActionTypes {
  LOAD_PAGE = 'LOAD_PAGE',
  SHOW_PAGE = 'SHOW_PAGE'
}

interface AppActionArgs {
  LOAD_PAGE: { path: string };
  SHOW_PAGE: { path: string };
}

export type AppActions = {
  [T in keyof typeof AppActionTypes]: T extends (keyof AppActionArgs) ? (Action<T> & AppActionArgs[T]) : Action<T>;
}

export type AppAction<T extends keyof AppActions = keyof AppActions> = AppActions[T];

interface Page {
  match: (path: string) => boolean;
  load: () => Promise<any>;
}

const navigateProvider = (pages: Array<Page>) => (path: string) => async (dispatch: Dispatch<AppAction, any>) => {
  const page = pages.find(p => p.match(path));
  if (page) {
    dispatch({ type: AppActionTypes.LOAD_PAGE, path });
    await page.load();
    dispatch({ type: AppActionTypes.SHOW_PAGE, path });
  }
}

export const navigate = navigateProvider([{
  match: path => path === '/',
  load: () => import(/* webpackChunkName: "home-page" */ '../components/home-page')
}]);
