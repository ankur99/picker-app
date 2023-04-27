import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as CommonUtils from '../utils/CommonUtils';
export const PHP_API_URL = '';
export const NODE_API_URL =
	'';
const API_PREFIX = '/app/v1';

const PhpInstance = axios.create({
	baseURL: PHP_API_URL + API_PREFIX,
});

const NodeInstance = axios.create({
	baseURL: NODE_API_URL,
});

export const sendOTP = async (phoneNumber) => {
	try {
		const res = await PhpInstance.post('/send-otp', phoneNumber);
		if (res?.data) {
			return res?.data;
		}
	} catch (error) {
		// console.log('Alert.......', error);
		// Alert.alert('OTP not sent..', error.response.data.message, [{text: 'OK'}]);
		throw new Error(error?.response);
	}
};

export const verifotp = (data) => PhpInstance.post('/login', data);

const readHeader = async () => {
	try {
		const node_token = await AsyncStorage.getItem('NODE_TOKEN');
		const jwt_token = await AsyncStorage.getItem('JWT_TOKEN');
		const user = JSON.parse(await AsyncStorage.getItem('USER'));
		let warehouseId = '';
		if (user != null && user.warehouse != null && user.warehouse != []) {
			warehouseId = user.warehouse[user.warehouse.length - 1].id;
		}

		return { node_token, warehouseId, jwt_token, user };
	} catch (e) {
		console.log('error from readHeader', e);
		alert(
			'Please make sure the user has correct permission and warehouse assigned!',
		);
	}
};

NodeInstance.interceptors.request.use(
	async (config) => {
		const result = await readHeader();
		if (result.node_token && result.warehouseId) {
			config.headers = {
				Authorization: `Bearer ${result.node_token}`,
				warehouseId: result.warehouseId,
				// userid: result.user.id,
				// userid: 1204,
				// Accept: '*/*',
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
	await NodeInstance.get('picklist/picklists', { params: query })
		.then((res) => {
			console.log('********resxxee', res);
			picklist = res.data;
		})
		.catch((error) => {
			console.log('errorxx', error);
			if (error.response) {
				if (error.response.status === 401 || error.response.status === 422) {
					// Handle 400
					// AsyncStorage.removeItem('JWT_TOKEN');
					// AsyncStorage.removeItem('NODE_TOKEN');
					// AsyncStorage.removeItem('USER');
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

export const getPendingItems = async (
	id,
	status = '',
	storageId,
	barcode,
	pageNo = 1,
) => {
	console.log(barcode);
	var pendingItems;
	var data = {};
	if (status !== '') {
		data = {
			status: status,
			page: pageNo,
			filters:
				storageId &&
				`str.label:equal:${storageId}` +
				`${barcode ? ',pr.barcode:equal:' + barcode : ''}`,
			limit: 10,
		};
		// if (barcode) {
		// 	data.barcode = 'product.barcode:equal:' + barcode;
		// }
	} else {
		data = {
			page: pageNo,
			storage_id: storageId,
			limit: 10,
		};
	}
	var endPoint = '/picklist/picklists-items/' + id;
	await NodeInstance.get(endPoint, { params: data })
		.then((res) => {
			console.log('items', res.data);
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
					CommonUtils.showMessage(
						'error',
						'Error',
						error.response.data.message,
					);
					console.log('error code ----- ', error.response.status);
				}
			}
		});
	return pendingItems;
};

export const getCrateProductQty = async (id, data) => {
	var result;
	var endPoint = 'picklist/picklists/' + id + '/picklists-items-overview';

	await NodeInstance.get(endPoint, { params: data }).then((res) => {
		console.log('resultxx', res.data);
		result = res.data;
	});
	return result;
};

export const pickItems = async (data) => {
	var pendingItems;
	var endPoint = 'crate/add-item';
	console.log('recieved params', data);
	await NodeInstance.post(endPoint, data).then((res) => {
		pendingItems = res.data;
	});
	return pendingItems;
};

export const skipItems = async (id, productID, storageId, data) => {
	let params = {
		items: data,
		product_id: productID,
		storage_id: storageId,
		picklist_id: id,
	};
	console.log('oarams', params);
	var result;
	var endPoint = 'picklist/picklists-skip-item';

	await NodeInstance.post(endPoint, params).then((res) => {
		console.log('on Skip', res);

		result = res.data;
	});
	return result;
};

export const finishPickList = async (id, storage_label) => {
	var result;
	var endPoint = 'picklist/picklists-submit';
	let params = {
		storage_label: storage_label,
		picklist_id: id,
	};
	console.log('params', params);
	await NodeInstance.post(endPoint, params).then((res) => {
		result = res.data;
	});
	return result;
};
