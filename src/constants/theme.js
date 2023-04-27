import {Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');

export const COLORS = {
	primary: '#FFA301',
	secondary: '#689F38',
	background: '#FEF9F0',
	BgGray: '#B7B7B7',
	BgListItem: '#FAEEE3',
	BgImage: '#FFE0C3',
	white: '#fff',
	lightGreen: '#CDDC39',
	black: '#000000',
	green: '#00C6AE',
	red: '#ff5050',
	gray: '#797979',
	lightGray: '#dbdbdb',
	lightGray1: '#f5f6fa',
};
export const SIZES = {
	base: 8,
	font: 14,
	radius: 12,
	padding: 24,

	h1: 30,
	h2: 20,
	h25: 20,
	h3: 18,
	h4: 16,
	h6: 10,
	body1: 30,
	body2: 22,
	body3: 16,
	body4: 14,
	body5: 12,

	width,
	height,
};
export const FONTS = {
	h1: {fontSize: SIZES.h1, lineHeight: 36},
	h2: {fontSize: SIZES.h2, lineHeight: 30},
	h25: {fontSize: SIZES.h25, lineHeight: 27},
	h3: {fontSize: SIZES.h3, lineHeight: 22},
	h4: {fontSize: SIZES.h4, lineHeight: 22},
	h6: {fontSize: SIZES.h6},
	body1: {fontSize: SIZES.body1, lineHeight: 36},
	body2: {fontSize: SIZES.body2, lineHeight: 30},
	body3: {fontSize: SIZES.body3, lineHeight: 22},
	body4: {fontSize: SIZES.body4, lineHeight: 22},
	body5: {fontSize: SIZES.body5, lineHeight: 22},
	body6: {fontSize: 11, lineHeight: 12},
};

const appTheme = {COLORS, SIZES, FONTS};

export default appTheme;
