import 'react-native-gesture-handler';
import React, {useState} from 'react';
import {View, Text, Pressable, StyleSheet, Image, Button} from 'react-native';
import {
	Signup,
	OTPScreen,
	PickList,
	Home,
	BarcodeScanner,
	CommonError,
	DeviceSelection,
} from './screens';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';

import store from './store/store';
import {Provider} from 'react-redux';
import Toast from 'react-native-toast-message';
import {COLORS, FONTS} from './constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CrateScanner from './screens/CrateScanner';
import NetworkLogger from 'react-native-network-logger';
const Stack = createStackNavigator();

const App = () => {
	React.useEffect(() => {
		SplashScreen.hide();
	}, []);

	const toastConfig = {
		finishpicklist: ({text1, text2}) => (
			<View style={styles.finishViewContainer}>
				<Image source={require('./assets/icons/coin.png')} />
				<Text
					style={{
						textAlign: 'center',
						...FONTS.body4,
						fontWeight: 'bold',
						margin: 5,
					}}
				>
					{text1}
				</Text>
				<Text
					style={{
						textAlign: 'center',
						...FONTS.body4,
						fontWeight: 'bold',
						margin: 5,
					}}
				>
					{text2}
				</Text>

				<Pressable style={styles.btnContainer} onPress={() => Toast.hide()}>
					<Text style={{color: 'white', fontWeight: 'bold'}}>OK</Text>
				</Pressable>
			</View>
		),
		picklist_not_active: ({text1}) => (
			<View style={styles.viewContainer}>
				<View
					style={{flexDirection: 'row', flex: 1, marginTop: 10, padding: 10}}
				>
					<MaterialCommunityIcons
						name="alert-octagon"
						size={30}
						color={COLORS.primary}
						solid
					/>
					<Text
						style={{
							textAlign: 'center',
							...FONTS.body4,
							fontWeight: 'bold',
							margin: 5,
						}}
					>
						{text1}
					</Text>
				</View>
				<Pressable style={styles.btnContainer} onPress={() => Toast.hide()}>
					<Text style={{color: 'white', fontWeight: 'bold'}}>OK</Text>
				</Pressable>
			</View>
		),
	};
	const themedStyles = () =>
		StyleSheet.create({
			bottomView: {
				flexDirection: 'row',
				justifyContent: 'space-between',
				zIndex: 1000000,
				position: 'absolute',
				bottom: 0,
				left: 0,
			},
		});

	const [theme, setTheme] = useState('dark');
	const [unmountNetworkLogger, setUnmountNetworkLogger] = useState(false);
	const isDark = theme === 'dark';
	const debuggerStyles = themedStyles(isDark);

	const remountButton = (
		<Pressable
			style={{
				width: 35,
				height: 35,
				borderTopRightRadius: 50,
				backgroundColor: COLORS.primary,
				justifyContent: 'center',
			}}
			onPress={() => setUnmountNetworkLogger(!unmountNetworkLogger)}
		>
			<Text
				style={{fontSize: 6, color: 'white', transform: [{rotate: '-45deg'}]}}
			>
				Networks
			</Text>
		</Pressable>
	);

	return (
		<Provider store={store}>
			<NavigationContainer>
				<Stack.Navigator
					keyboardHandlingEnabled={false}
					screenOptions={{
						headerShown: false,
					}}
					initialRouteName={'Signup'}
					unmountInactiveRoutes={true}
				>
					<Stack.Screen name="Signup" component={Signup} />
					<Stack.Screen name="OTPScreen" component={OTPScreen} />
					<Stack.Screen name="DeviceSelection" component={DeviceSelection} />
					<Stack.Screen name="Home" component={Home} />

					<Stack.Screen name="PickList" component={PickList} />

					<Stack.Screen name="BarcodeScanner" component={BarcodeScanner} />

					<Stack.Screen name="CrateScanner" component={CrateScanner} />

					<Stack.Screen name="Error" component={CommonError} />
				</Stack.Navigator>
				<Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />
			</NavigationContainer>

			{/* eslint-disable-next-line no-undef */}
			{__DEV__ && (
				<View
					style={{position: 'absolute', top: 0, width: '100%', height: '100%'}}
				>
					{unmountNetworkLogger && remountButton && (
						<>
							<Button
								title="Toggle Theme"
								onPress={() => setTheme(theme === 'light' ? 'dark' : 'light')}
							/>
							<NetworkLogger theme={theme} />
						</>
					)}
					<View style={debuggerStyles.bottomView}>{remountButton}</View>
				</View>
			)}
		</Provider>
	);
};

export default App;

const styles = StyleSheet.create({
	btnContainer: {
		width: '20%',
		height: 30,
		margin: 10,
		borderRadius: 10,
		backgroundColor: COLORS.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},

	viewContainer: {
		flex: 1,
		width: '95%',
		backgroundColor: COLORS.white,
		borderWidth: 1,
		borderColor: COLORS.primary,
		borderRadius: 10,
		borderLeftWidth: 5,
		alignItems: 'center',
	},
	finishViewContainer: {
		flex: 1,
		width: '95%',
		height: '95%',
		backgroundColor: COLORS.white,
		margin: '20%',
		borderWidth: 1,
		borderColor: COLORS.primary,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
