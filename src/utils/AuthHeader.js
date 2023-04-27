export const AuthHeader = (jwttoken) => {
	const header = 'headers: { Authorization: "Bearer "' + jwttoken + '}';

	return header;
};
