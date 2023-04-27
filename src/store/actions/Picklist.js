import {GET_PICKLIST} from '../../constants/actionTypes';
import * as API from '../../utils/RestServices';
import {FETCH_PRODUCTS} from '../../constants/actionTypes';

export const getPickList = () => {
	return {
		TYPE: GET_PICKLIST,
		payload: 'x',
	};
};

export const getProducts = () => async (dispatch) => {
	try {
		const {data} = await API.fetchProducts();
		const action = {
			type: FETCH_PRODUCTS,
			payload: data,
		};
		dispatch(action);
	} catch (error) {
		console.log(error);
	}
};
