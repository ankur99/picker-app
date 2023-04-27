import Toast from 'react-native-toast-message';

// To display messagetype  | error | info | success
export const showMessage = (
	messagetype,
	message,
	message2 = '',
	hide = false,
) => {
	Toast.show({
		type: messagetype,
		text1: message,
		text2: message2,
		autoHide: hide,
		visibilityTime: 1500,
	});
};

export const ERROR_FALLBACK_TEXT =
	'Something went wrong, Please try again later!';

export const getErrorText = (error) => {
	console.log(error);
	try {
		if (typeof error?.response?.data === 'string') {
			return error.response.data;
		}

		if (typeof error?.response?.data?.message === 'string') {
			return error.response.data.message;
		}

		if (typeof error?.response?.data?.error === 'string') {
			return error.response.data.error;
		}

		if (
			Array.isArray(error.response?.data?.message) &&
			error.response?.data?.message?.length > 0
		) {
			const errorMessageArray = error.response?.data?.message;
			return errorMessageArray
				.map((item) => {
					return item.message;
				})
				.join(' & ');
		}
		const error =
			error?.response?.data?.error ||
			error?.response?.data?.message ||
			ERROR_FALLBACK_TEXT;

		return error;
	} catch (error) {
		return ERROR_FALLBACK_TEXT;
	}
};
