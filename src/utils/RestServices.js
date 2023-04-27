import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {API_URL, API_PREFIX} from 'react-native-dotenv';

const API_URL = '';
const API_PREFIX = '/app/v1';
//API_URL='https://tapi.niyotail.com'
//API_PREFIX='/app/v1'
const readHeader = async () => {
	try {
		const jwt = await AsyncStorage.getItem('JWT_TOKEN');
		const user = JSON.parse(await AsyncStorage.getItem('USER'));
		let warehouseId = '';
		if (jwt !== null) {
			setJWT(jwt);
		}
		if (user != null && user.warehouse != null && user.warehouse != []) {
			warehouseId = user.warehouse[user.warehouse.length - 1].id;
		}

		return { jwt, warehouseId };
	} catch (e) {
		alert('Failed to fetch the data from storage');
	}
};

const setJWT = () => {
	// jwt as var
	//Save this to state/store
	return;
};

export const APIWITHOUTHEADER = axios.create({
	baseURL: API_URL + API_PREFIX,
});

export const API = axios.create({
	baseURL: API_URL + API_PREFIX, //todo change to .env
});

API.interceptors.request.use(
	async (config) => {
		var result = await readHeader();
		if (result.jwt) {
			config.headers = {
				Authorization: `Bearer ${result.jwt}`,
				warehouseId: result.warehouseId,
			};
		}
		return config;
	},
	(error) => {
		Promise.reject(error);
	},
);

export const fetchPickList = async (query) => {
	var picklist = [];
	await API.get('/picklists', { params: query })
		.then((res) => {
			picklist = res.data;
		})
		.catch((error) => {
			if (error.response) {
				if (error.response.status === 401 || error.response.status === 422) {
					// Handle 400
					AsyncStorage.removeItem('JWT');
					AsyncStorage.removeItem('USER');
				} else {
					// Handle else
					picklist = { isError: true, errorCode: error.response.status };
				}
			} else if (error.request) {
				picklist = { isError: true, errorCode: 'Request Not send' };
			} else {
				picklist = { isError: true, errorCode: 'something wend wrong' };
			}
		});
	return picklist;
};
export const sendOTP = async (phoneNumber) => {
	// const navigation = useNavigation();
	return APIWITHOUTHEADER.post('/send-otp', phoneNumber).catch((error) => {
		if (error.response) {
			if (error.response.status === 401) {
				// Handle 400
				AsyncStorage.removeItem('JWT');
				AsyncStorage.removeItem('USER');
			} else if (error.request) {
				console.log('errorrrrr send otp ###');
				// navigation.navigate('Error');
			} else {
				console.log('Error send otp ###', error.message);
			}
		}
	});
};
export const verifotp = (data) => APIWITHOUTHEADER.post('/login', data);

export const getPendingItems = async (
	id,
	status = '',
	storageId,
	barcode,
	pageNo = 1,
) => {
	var pendingItems;
	var data = {};
	if (status !== '') {
		data = {
			status: status,
			page: pageNo,
			storage_id: storageId,
		};
		if (barcode) {
			data.barcode = barcode;
		}
	} else {
		data = {
			page: pageNo,
			storage_id: storageId,
		};
	}
	var endPoint = '/picklists/' + id + '/items';
	await API.get(endPoint, { params: data })
		.then((res) => {
			pendingItems = res.data;
		})
		.catch((error) => {
			if (error.response) {
				if (error.response.status === 401) {
					// Handle 400
					AsyncStorage.removeItem('JWT');
					AsyncStorage.removeItem('USER');
				} else {
					// Handle else
					console.log('error code ----- ', error.response.status);
				}
			}
		});
	return pendingItems;
};

export const getSkipReasons = () => API.get('/picklists/skip_reasons');

export const pickItems = async (id, data) => {
	var pendingItems;
	var endPoint = '/picklists/' + id + '/pick-item';
	await API.post(endPoint, data).then((res) => {
		pendingItems = res.data;
	});
	return pendingItems;
};

export const unPickItem = async (id, data) => {
	var unpick;
	var endPoint = '/picklists/' + id + '/unpick-item';
	await API.post(endPoint, data).then((res) => {
		unpick = res.data;
	});
	return unpick;
};

export const searchProduct = async (id, barcode) => {
	var product;
	var endPoint = '/picklists/' + id + '/search-product';
	var searchOptions = {
		barcode: barcode,
	};

	await API.get(endPoint, { params: searchOptions }).then((res) => {
		product = res.data;
	});
	return product;
};

export const finishPickList = async (id, storage_label) => {
	var result;
	var endPoint = '/picklists/' + id + '/mark-picked';
	let params = {
		storage_label: storage_label,
	};
	console.log('params', params);
	await API.post(endPoint, params).then((res) => {
		result = res.data;
	});
	return result;
};

export const getCrateProductQty = async (id, data) => {
	var result;
	var endPoint = 'picklists/' + id + '/get-product-quantity';
	await API.get(endPoint, { params: data }).then((res) => {
		console.log('resultxx', res.data);
		result = res.data;
	});
	return result;
};

export const skipItems = async (id, productID, storageId, data) => {
	let params = {
		skip: data,
		product_id: productID,
		storage_id: storageId,
	};
	console.log('oarams', params);
	var result;
	var endPoint = 'picklists/' + id + '/skip-items';
	await API.post(endPoint, params).then((res) => {
		result = res.data;
	});
	return result;
};

export const verifyCrate = async (picklist, label) => {
	let params = {
		crate_id: label,
	};
	console.log('oarams', params, picklist);
	var result;
	var endPoint = 'picklists/' + picklist + '/scan-crate';
	await API.get(endPoint, { params: params }).then((res) => {
		console.log('resxxxxx', res);
		result = res.data;
	});
	return result;
};

export const unPickByQunatity = async (
	picklistId,
	orderId,
	quantity,
	productId,
) => {
	let params = {
		product_id: productId,
		quantity: quantity,
		order_id: orderId,
	};
	console.log('params to unpick', params);
	var result;
	var endPoint = 'picklists/' + picklistId + '/unpick-product';
	await API.post(endPoint, params).then((res) => {
		result = res.data;
	});
	return result;
};
