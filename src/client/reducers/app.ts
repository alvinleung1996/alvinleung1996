import { combineReducers } from 'redux';
import { AppActionTypes, AppAction } from '../actions/app';

const loadingPath = (state: string | null = null, action: AppAction) => {
  switch (action.type) {
    case AppActionTypes.LOAD_PAGE:
      return action.path;

    case AppActionTypes.SHOW_PAGE:
      return null;

    default:
      return state;
  }
};

const showingPath = (state: string | null = null, action: AppAction) => {
  switch (action.type) {
    case AppActionTypes.LOAD_PAGE:
      return null;

    case AppActionTypes.SHOW_PAGE:
      return action.path;

    default:
      return state;
  }
};

const router = combineReducers({
  loadingPath,
  showingPath
});

const ui = combineReducers({
  router
});

export const app = combineReducers({
  ui
});
