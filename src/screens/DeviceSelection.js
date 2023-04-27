import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {COLORS} from '../constants';

const DeviceSelection = ({navigation}) => {
	const [deviceType, setDeviceType] = React.useState(null);
	console.log(deviceType);
	useEffect(() => {
		(async () => {
			const device = await AsyncStorage.getItem('SELECTED_DEVICE');
			setDeviceType(device);
		})();
	}, []);

	useEffect(() => {
		if (deviceType) {
			console.log(deviceType, 'device type in use effect');
			AsyncStorage.setItem('SELECTED_DEVICE', deviceType);
			setTimeout(() => {
				console.log('I executed!!!');
				navigation.navigate('Home');
			}, 500);
		}
	}, [deviceType]);

	return (
		<View style={styles.container}>
			<View style={{alignItems: 'center'}}>
				<Text style={styles.header}>PLEASE SELECT DEVICE</Text>
			</View>
			<View
				style={{
					paddingTop: '20%',
					flex: 1,
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-evenly',
				}}
			>
				<TouchableOpacity
					onPress={() => setDeviceType('mobile')}
					style={{
						borderWidth: 0.5,
						alignItems: 'center',
						paddingVertical: 20,
						paddingHorizontal: 10,
						borderRadius: 10,
						backgroundColor:
							deviceType === 'mobile' ? COLORS.primary : '#c0b7b7',
					}}
				>
					<Text style={{fontWeight: 'bold'}}>Mobile</Text>
					<Image
						style={{width: 100, height: 100}}
						resizeMode="contain"
						source={require('../assets/images/mobile-device.png')}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => setDeviceType('scanner')}
					style={{
						borderWidth: 0.5,
						alignItems: 'center',
						paddingVertical: 20,
						paddingHorizontal: 10,
						borderRadius: 10,
						backgroundColor:
							deviceType === 'scanner' ? COLORS.primary : '#c0b7b7',
					}}
				>
					<Text style={{fontWeight: 'bold'}}>Scanner Device</Text>
					<Image
						style={{width: 100, height: 100}}
						resizeMode="contain"
						source={require('../assets/images/scanner-device.png')}
					/>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default DeviceSelection;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: COLORS.background,
	},
	header: {
		fontWeight: 'bold',
		fontSize: 18,
		marginTop: 100,
	},
});
