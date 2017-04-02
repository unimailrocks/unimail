import { combineReducers } from 'redux';
import editorReducer from './templates/editor/duck';

export default combineReducers({
  editor: editorReducer,
});
