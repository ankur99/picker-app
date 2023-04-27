import React from 'react';
import {View, Text, TouchableOpacity, Image, Pressable} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import {COLORS, FONTS, icons} from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CommonActions} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Header = ({title, left, name, backSteps}) => {
	const navigation = useNavigation();

	const logOut = () => {
		AsyncStorage.removeItem('JWT_TOKEN');
		AsyncStorage.removeItem('USER');

		navigation.dispatch({
			...CommonActions.reset({
				index: 0,
				routes: [{name: 'Signup'}],
			}),
		});
	};

	return (
		<View
			style={{
				justifyContent: 'flex-start',
				height: 70,
				paddingVertical: 10,
				paddingHorizontal: 10,

				position: 'relative',
			}}
		>
			<View
				style={{
					flex: 1,
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<TouchableOpacity
					style={{
						flexDirection: 'row',
						alignItems: 'center',
					}}
					onPress={() => {
						left
							? backSteps
								? navigation.pop(backSteps)
								: navigation.goBack()
							: null;
					}}
				>
					{left && (
						<Image
							source={icons.back_arrow}
							resizeMode="contain"
							style={{
								width: 15,
								height: 15,
								tintColor: COLORS.black,
							}}
						/>
					)}
					<Text
						style={{
							marginLeft: 5,
							...FONTS.h5,
							color: COLORS.black,
							fontWeight: 'bold',
						}}
					>
						{title}
					</Text>
				</TouchableOpacity>
				<Pressable
					style={{
						borderColor: COLORS.primary,
						paddingBottom: 3,
					}}
					onPress={logOut}
				>
					<Text
						style={{
							...FONTS.h5,
							color: COLORS.primary,
							fontWeight: 'bold',
						}}
					>
						<MaterialCommunityIcons
							name="cog-outline"
							color={COLORS.primary}
							solid
						/>{' '}
						logout{' '}
					</Text>
				</Pressable>
			</View>

			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
				}}
			>
				<View>
					{name && (
						<Text style={{...FONTS.h5, color: COLORS.black}}>
							{' '}
							Hello, {name}
						</Text>
					)}
				</View>
			</View>
		</View>
	);
};

export default Header;
