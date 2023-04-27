import {combineReducers} from 'redux';

import products from './products';
import UserContextReducer from './usercontext';

export default combineReducers({
	products,
	UserContextReducer,
});
