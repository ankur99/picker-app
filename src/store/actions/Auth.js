import * as API from '../../utils/RestServices';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const verify = (data) => {
	return () => {
		API.verifotp(data).then((response) => {
			AsyncStorage.setItem('JWT_TOKEN', response.token);
			AsyncStorage.setItem('user', response.data);
			return response.data;
		});
	};
};
