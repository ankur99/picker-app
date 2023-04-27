import React, {useState, useEffect, useRef} from 'react';
import {
	View,
	Text,
	StyleSheet,
	Keyboard,
	TouchableWithoutFeedback,
	TextInput,
	TouchableOpacity,
	Image,
	Alert,
	ActivityIndicator,
} from 'react-native';
import {COLORS, FONTS} from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as API from '../utils/NewRestServices';
import UserState from '../utils/userstate';
import {CommonActions} from '@react-navigation/native';

const OTPScreen = ({route, navigation}) => {
	const lengthInput = 6;
	let textInput = useRef();
	let clockCall = null;
	const defaultCountDown = 30;
	const [internalValue, setInternalValue] = useState('');
	const [countdown, setCountDown] = useState(defaultCountDown);
	const [checkingOtp, setCheckingOtp] = useState(false);
	const {mobile} = route.params;

	const onChangeText = async (val) => {
		setInternalValue(val);
		if (val.length === lengthInput) {
			var data = {
				mobile: mobile,
				otp: val,
				node_token: true,
			};
			setCheckingOtp(true);
			await API.verifotp(data)
				.then((response) => {
					setCheckingOtp(false);
					AsyncStorage.setItem('JWT_TOKEN', response.data.token);
					AsyncStorage.setItem('NODE_TOKEN', response.data.node_token);
					AsyncStorage.setItem('USER', JSON.stringify(response.data.data));
					AsyncStorage.removeItem('SELECTED_DEVICE');

					setUserstate(response.data.data);

					navigation.dispatch({
						...CommonActions.reset({
							index: 0,
							routes: [{name: 'Home', params: {user: response.data.data}}],
						}),
					});
				})
				.catch((err) => {
					setCheckingOtp(false);
					Alert.alert("Sorry that didn't work!", err.response.data.message, [
						{text: 'OK'},
					]);
				});
		}
	};

	const setUserstate = (data) => {
		UserState.id = data.id;
		UserState.code = data.code;
		UserState.email = data.email;
		UserState.mobile = data.mobile;
		UserState.name = data.name;
		UserState.type = data.type;
		UserState.warehouse = data.warehouse;
	};

	const onChangeNumber = () => {
		navigation.navigate('Signup');
	};

	useEffect(() => {
		clockCall = setInterval(() => {
			if (countdown === 0) {
				setCountDown(0);
				clearInterval(clockCall);
			} else {
				setCountDown(countdown - 1);
			}
		}, 1000);
		return () => {
			clearInterval(clockCall);
		};
	});

	useEffect(() => {
		textInput.current.focus();
	}, []);

	return (
		<View style={styles.container}>
			<Image
				style={{position: 'absolute', width: '100%'}}
				source={require('../assets/images/signup-bg.png')}
			/>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View style={styles.inner}>
					<View style={{position: 'absolute', left: 0, padding: 10}}>
						<TouchableOpacity onPress={onChangeNumber}>
							<View>
								<Text style={styles.textChange}>Change Number</Text>
							</View>
						</TouchableOpacity>
					</View>
					<Image
						style={{flex: 1, resizeMode: 'contain'}}
						source={require('../assets/images/otp.png')}
					/>
					<Text style={{marginTop: 20, ...FONTS.h3}}>Enter OTP</Text>
					<Text
						style={{marginTop: 10, textAlign: 'center', color: COLORS.gray}}
					>
						OTP sent to {mobile}. OTP will be autodetected in 30 seconds
					</Text>
					<View>
						<TextInput
							ref={textInput}
							style={{opacity: 0}}
							value={internalValue}
							onChangeText={onChangeText}
							maxLength={lengthInput}
							returnKeyType="done"
							keyboardType="numeric"
							focusable={true}
							autoFocus={true}
						/>
						<View style={styles.containerInput}>
							{Array(lengthInput)
								.fill()
								.map((data, index) => (
									<TouchableOpacity
										onPress={() => {
											textInput.current.focus();
										}}
										style={{
											...styles.cellView,
											borderBottomColor:
												index === internalValue.length
													? COLORS.gray
													: COLORS.primary,
										}}
										key={index}
									>
										<Text style={styles.cellText}>
											{internalValue && internalValue.length > 0
												? internalValue[index]
												: ''}
										</Text>
									</TouchableOpacity>
								))}
						</View>
					</View>

					{checkingOtp && (
						<View>
							<ActivityIndicator size="large" color={COLORS.primary} />
						</View>
					)}

					<View style={styles.bottomView}></View>
				</View>
			</TouchableWithoutFeedback>
		</View>
	);
};

export default OTPScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	inner: {
		padding: 30,
		paddingBottom: 0,
		flex: 1,
		alignItems: 'center',
	},
	containerInput: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	cellView: {
		paddingVertical: 11,
		width: 40,
		margin: 5,
		justifyContent: 'center',
		alignItems: 'center',
		borderBottomWidth: 1,
	},
	cellText: {
		...FONTS.body2,
		textAlign: 'center',
	},
	bottomView: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'flex-end',
		paddingBottom: 15,
	},
	textChange: {
		...FONTS.body3,
		color: COLORS.secondary,
		alignItems: 'center',
	},
});
