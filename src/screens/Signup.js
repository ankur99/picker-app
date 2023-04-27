/* eslint-disable no-undef */
import React, {useState, useRef, useEffect} from 'react';
import {
	View,
	KeyboardAvoidingView,
	TextInput,
	StyleSheet,
	Text,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
	TouchableOpacity,
	Image,
	Alert,
	ActivityIndicator,
} from 'react-native';
import * as API from '../utils/NewRestServices';
import {COLORS, FONTS} from '../constants';
import UserState from '../utils/userstate';
import {CommonActions} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getErrorText} from '../utils/CommonUtils';
import {NODE_API_URL, PHP_API_URL} from '../utils/NewRestServices';
// import SelectDropdown from 'react-native-select-dropdown';

// const phpUrls = [
// 	'https://wms-dev2-api.1knetworks.com',
// 	'https://wms-staging-api.1knetworks.com',
// ];

// const nodeUrls = [
// 	'https://wms-node-staging2.1knetworks.com/api/v1/app/',
// 	'https://wms-node-staging4.1knetworks.com/api/v1/app/',
// ];

const Signup = ({navigation}) => {
	let textInput = useRef(null);
	const defaultCodeCountry = '+91';
	const defaultMaskCountry = '99999 99999';
	const [phoneNumber, setPhoneNumber] = useState();
	const [focusInput, setFocusInput] = useState(true);
	const [sendingOtp, setSendingOtp] = useState(false);
	// const [error, setError] = useState({isError: false, errorCode: ''});

	const [codeCountry] = useState(defaultCodeCountry);
	const [placeholder] = useState(defaultMaskCountry);
	const [isLoading, setIsLoading] = useState(true);

	const onChangePhone = (num) => {
		setPhoneNumber(num);
	};

	const onPressContinue = async () => {
		if (phoneNumber && phoneNumber.length === 10) {
			setSendingOtp(true);
			var data = {
				mobile: codeCountry + phoneNumber,
			};
			await API.sendOTP(data)
				.then(() => {
					setSendingOtp(false);
					navigation.navigate('OTPScreen', {mobile: data.mobile});
				})
				.catch((err) => {
					// console.log('harsh is here...', Array.isArray(err));
					setSendingOtp(false);
					Alert.alert('OTP not sent..', getErrorText(err), [{text: 'OK'}]);
				});
		}
	};

	const onChangeFocus = () => {
		setFocusInput(true);
	};

	const onChangeBlur = () => {
		setFocusInput(false);
	};

	useEffect(() => {
		(async () => {
			// let query = {
			// 	status: 0,
			// 	page: 1,
			// };

			// const res = await API.fetchPickList(query);
			// if (res != null && res.isError == true) {
			// 	setError(res);
			// }

			await checkIfLoggedIn();

			textInput.focus();
		})();
	}, []);

	// if (error != {} && error.isError == true) {
	// 	navigation.navigate('Error');
	// }

	const checkIfLoggedIn = async () => {
		const token = await AsyncStorage.getItem('JWT_TOKEN');
		const node_token = await AsyncStorage.getItem('NODE_TOKEN');
		const user = JSON.parse(await AsyncStorage.getItem('USER'));
		// alert(JSON.stringify({token: token, node_token: node_token, user: user}));
		if (
			token != null &&
			token != undefined &&
			token != '' &&
			node_token != null &&
			node_token != undefined &&
			node_token != '' &&
			user != null
		) {
			UserState.code = user.code;
			UserState.name = user.name;
			UserState.type = user.type;
			UserState.email = user.email;
			UserState.id = user.id;
			UserState.mobile = user.mobile;
			UserState.warehouse = user.warehouse;
			navigation.dispatch({
				...CommonActions.reset({
					index: 0,
					routes: [{name: 'Home', params: {user: user}}],
				}),
			});
			return;
		}
		setIsLoading(false);
	};

	if (isLoading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: 'white',
				}}
			>
				<Image source={require('../assets/images/pickerapp.png')} />
				<Image
					style={{height: 200, width: 200}}
					source={require('../assets/images/loading.gif')}
				/>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={styles.container}
		>
			{/* <SelectDropdown
				placeholder="Select PHP server"
				buttonStyle={{
					height: 20,
					position: 'absolute',
					zIndex: 100,
					width: '50%',
				}}
				buttonTextStyle={{fontSize: 11}}
				rowTextStyle={{fontSize: 11}}
				rowStyle={{height: 30}}
				data={phpUrls}
				onSelect={(selectedItem) => {
					AsyncStorage.setItem('PHP_API_URL', selectedItem);
				}}
				buttonTextAfterSelection={(selectedItem) => {
					// text represented after item is selected
					// if data array is an array of objects then return selectedItem.property to render after item is selected
					return selectedItem;
				}}
				rowTextForSelection={(item) => {
					// text represented for each item in dropdown
					// if data array is an array of objects then return item.property to represent item in dropdown
					return item;
				}}
			/>
			<SelectDropdown
				buttonStyle={{
					height: 20,
					position: 'absolute',
					zIndex: 100,
					right: 0,
					width: '50%',
				}}
				buttonTextStyle={{fontSize: 11}}
				rowTextStyle={{fontSize: 11}}
				rowStyle={{height: 30}}
				data={nodeUrls}
				onSelect={(selectedItem) => {
					AsyncStorage.setItem('NODE_API_URL', selectedItem);
				}}
				buttonTextAfterSelection={(selectedItem) => {
					// text represented after item is selected
					// if data array is an array of objects then return selectedItem.property to render after item is selected
					return selectedItem;
				}}
				rowTextForSelection={(item) => {
					// text represented for each item in dropdown
					// if data array is an array of objects then return item.property to represent item in dropdown
					return item;
				}}
			/> */}
			<Image
				style={{position: 'absolute', width: '100%'}}
				source={require('../assets/images/signup-bg.png')}
			/>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View style={styles.inner}>
					<Image
						style={{flex: 1, resizeMode: 'contain'}}
						source={require('../assets/images/mobile.png')}
					/>
					<Text style={{marginTop: 20, ...FONTS.h3}}>
						Enter mobile number to sign in
					</Text>
					{__DEV__ && (
						<Text style={{fontSize: 10}}>
							{PHP_API_URL} {NODE_API_URL}
						</Text>
					)}

					<Text
						style={{
							marginBottom: 10,
							color: COLORS.gray,
							paddingHorizontal: 50,
							textAlign: 'center',
						}}
					>
						We will send you an OTP on the entered number
					</Text>

					<View style={{width: '100%'}}>
						<Text>Phone Number</Text>
						<View
							style={{
								...styles.containerInput,
								borderColor: focusInput ? COLORS.primary : COLORS.gray,
							}}
						>
							<TouchableOpacity>
								<View style={styles.openDialogView}>
									<TextInput
										style={{...styles.phoneInput, ...FONTS.body2}}
										editable={false}
										value={`${codeCountry} |`}
									/>
								</View>
							</TouchableOpacity>

							<View>
								<TextInput
									autoComplete="tel-device"
									autoCorrect={true}
									ref={(input) => (textInput = input)}
									style={{...styles.phoneInput, ...FONTS.body2}}
									placeholder={placeholder}
									keyboardType="numeric"
									value={phoneNumber}
									onChangeText={onChangePhone}
									secureTextEntry={false}
									onFocus={onChangeFocus}
									onBlur={onChangeBlur}
									autoFocus={focusInput}
									maxLength={10}
								/>
							</View>
						</View>
					</View>

					{sendingOtp && (
						<View>
							<ActivityIndicator size="large" color={COLORS.primary} />
						</View>
					)}

					<TouchableOpacity style={styles.viewBottom} onPress={onPressContinue}>
						<View
							style={{
								...styles.btnContainer,
								backgroundColor:
									phoneNumber == undefined || phoneNumber.length !== 10
										? COLORS.gray
										: COLORS.primary,
							}}
						>
							<Text style={{...styles.textContinue, ...FONTS.h3}}>Next</Text>
						</View>
					</TouchableOpacity>
				</View>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	inner: {
		padding: 30,
		flex: 1,
		alignItems: 'center',
		paddingTop: 10,
	},
	containerInput: {
		flexDirection: 'row',
		paddingHorizontal: 10,
		borderRadius: 4,
		alignItems: 'center',
		borderWidth: 1,
		backgroundColor: COLORS.BgListItem,
		marginTop: 5,
	},
	openDialogView: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	phoneInput: {
		marginLeft: 5,
		height: 50,
		color: 'black',
	},
	viewBottom: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	btnContainer: {
		width: 150,
		height: 50,
		borderRadius: 4,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textContinue: {
		color: 'white',
		alignItems: 'center',
	},
});

export default Signup;
