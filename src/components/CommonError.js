import {useNavigation, CommonActions} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, Text, View, Image, TouchableOpacity} from 'react-native';
import {COLORS, FONTS} from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CommonError = () => {
	const navigation = useNavigation();

	const logOut = () => {
		console.log('Logged Out');
		AsyncStorage.removeItem('JWT_TOKEN');
		AsyncStorage.removeItem('NODE_TOKEN');
		AsyncStorage.removeItem('USER');

		navigation.dispatch({
			...CommonActions.reset({
				index: 0,
				routes: [{name: 'Signup'}],
			}),
		});
	};
	return (
		<View style={{...styles.container}}>
			<Image
				source={require('../assets/icons/error.png')}
				style={{flex: 1, marginTop: '20%'}}
				resizeMode="contain"
			/>
			<Text style={{...FONTS.body3, ...styles.textcontainer}}>
				{' '}
				Looks like there is some error connecting to the server
			</Text>
			<Text style={{...FONTS.body3, ...styles.textcontainer}}>
				{' '}
				Please log out or Go back.
			</Text>
			<Text style={{...FONTS.body3, ...styles.textcontainer}}>
				{' '}
				IF the error persist please come back later.
			</Text>
			<View style={{flex: 1, flexDirection: 'row'}}>
				<TouchableOpacity
					style={{
						...styles.btnContainer,
						backgroundColor: COLORS.primary,
						margin: 10,
					}}
					onPress={() => logOut()}
				>
					<Text style={{...styles.textContinue, ...FONTS.h4}}>Log out</Text>
				</TouchableOpacity>
				{/* <TouchableOpacity
					style={{
						...styles.btnContainer,
						backgroundColor: COLORS.primary,
						margin: 10,
					}}
					onPress={() => navigation.goBack()}
				>
					<Text style={{...styles.textContinue, ...FONTS.h4}}>Go back</Text>
				</TouchableOpacity> */}
			</View>
		</View>
	);
};

export default CommonError;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
	btnContainer: {
		height: 40,
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 25,
	},
	textContinue: {
		color: 'white',
	},
	textcontainer: {
		color: COLORS.black,
		textAlign: 'center',
		padding: 5,
		margin: 5,
	},
});
