import * as ACTION from '../../constants/actionTypes';

const initialState = {
	jwt: '',
	user: '',
};

const UserContextReducer = (state = initialState, action) => {
	switch (action.type) {
		case ACTION.SEND_OTP:
			return action.payload;
		case ACTION.VERIFY_OTP:
			return action.payload;
		case ACTION.OTP_VERIFIED:
			return action.payload;

		default:
			return state;
	}
};

export default UserContextReducer;
