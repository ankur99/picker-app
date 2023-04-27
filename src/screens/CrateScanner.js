import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {
	Text,
	View,
	StyleSheet,
	TouchableOpacity,
	SafeAreaView,
	KeyboardAvoidingView,
	Modal,
} from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner';
import {COLORS, SIZES} from '../constants';
import {
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetTextInput,
	BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
// import * as API from '../utils/RestServices';
import BarcodeMask from 'react-native-barcode-mask';
import AsyncStorage from '@react-native-async-storage/async-storage';
import debounce from 'lodash/debounce';
// import {useNavigation} from '@react-navigation/native';

const CrateScanner = ({
	modalVisible,
	setScannerVisible,
	submitItemforProcessing,
	// pickListId,
	setCrateId,
}) => {
	const [hasPermission, setHasPermission] = useState(true);
	const [scanned, setScanned] = useState(false);
	const bottomSheetModalRef = useRef(null);
	const [toggleButton, setToggleButton] = useState(false);
	const [submit, setSubmit] = useState(true);
	const [showKeyboard, setShowKeyBoard] = useState(false);
	// const navigation = useNavigation();

	let textInput = useRef(null);

	const snapPoints = useMemo(() => ['25%', '80%'], []);

	useEffect(() => {
		(async () => {
			const {status} = await BarCodeScanner.getPermissionsAsync();
			if (status === 'granted') {
				setHasPermission(true);
			} else {
				const {status} = await BarCodeScanner.requestPermissionsAsync();
				setHasPermission(status === 'granted');
			}
			const device = await AsyncStorage.getItem('SELECTED_DEVICE');
			if (device === 'scanner') {
				bottomSheetModalRef.current?.present();
			} else {
				openScanner();
			}
		})();
	}, []);

	const renderBackdrop = useCallback(
		(props) => (
			<BottomSheetBackdrop
				{...props}
				disappearsOnIndex={1}
				appearsOnIndex={2}
				opacity={0.1}
			/>
		),
		[],
	);

	const openScanner = () => {
		setSubmit(false);
		setToggleButton(true);
		bottomSheetModalRef.current?.dismiss();
	};

	const handlePresentModalPress = useCallback(() => {
		setToggleButton(false);
		setSubmit(false);

		bottomSheetModalRef.current?.present();
	}, []);

	const handleBarCodeScanned = async (type) => {
		var barcode = JSON.stringify(type.data);
		barcode = barcode.replace(/"/g, '');
		barcode = barcode.replace(/\\/g, '');

		setScanned(true);
		addCrate(barcode);
	};

	const addCrate = async (barcode) => {
		// let verifiedCrates = JSON.parse(await AsyncStorage.getItem('CARTS'));
		// if (verifiedCrates.includes(barcode)) {
		// 	setCrateId(barcode);
		// 	setScannerVisible(false);
		// 	submitItemforProcessing(barcode);
		// } else {
		// 	await API.verifyCrate(pickListId, barcode)
		// 		.then(async (res) => {
		// 			verifiedCrates.push(barcode);
		// 			console.log('verify crate response', res);
		// 			await AsyncStorage.setItem('CARTS', JSON.stringify(verifiedCrates));
		// 			setCrateId(barcode);
		// 			setScannerVisible(false);
		// 			submitItemforProcessing(barcode);
		// 		})
		// 		.catch((err) => {
		// 			setScanned(false);
		// 			console.log('err in verfiy crate', err);
		// 			alert(`Invalid Crate Scanned!`);
		// 			setCrateId(null);
		// 		});
		// 	textInput.clear();
		// }
		setCrateId(barcode);
		setScannerVisible(false);
		submitItemforProcessing(barcode);
		textInput.clear();
	};

	if (hasPermission === null) {
		return <Text>Requesting for camera permission</Text>;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	const debounceChange = debounce((value) => addCrate(value), 1000);

	const renderBarcodeInput = () => {
		return (
			<View style={styles.contentContainer}>
				<Text>Enter Crate Label</Text>
				<View>
					<BottomSheetTextInput
						onFocus={() => setShowKeyBoard(true)}
						ref={(input) => (textInput = input)}
						returnKeyType="done"
						keyboardType="ascii-capable"
						autoFocus={true}
						onChangeText={(value) => {
							debounceChange(value);
						}}
						showSoftInputOnFocus={showKeyboard}
					/>
				</View>
				<TouchableOpacity
					style={{marginTop: 120}}
					onPress={() => openScanner(true)}
				>
					<Text style={{textDecorationLine: 'underline'}}>
						Scan with camera
					</Text>
				</TouchableOpacity>
			</View>
		);
	};

	return (
		<SafeAreaView style={{flex: 1}}>
			<Modal
				animationType="none"
				transparent={true}
				visible={true}
				onRequestClose={() => {
					setScannerVisible(!modalVisible);
				}}
			>
				<View style={{flex: 1}}>
					{!submit && (
						<BarCodeScanner
							onBarCodeScanned={
								scanned
									? undefined
									: (type, data) => handleBarCodeScanned(type, data)
							}
							style={StyleSheet.absoluteFillObject}
						>
							<BarcodeMask showAnimatedLine={false} />
						</BarCodeScanner>
					)}

					{toggleButton && (
						<TouchableOpacity
							onPress={handlePresentModalPress}
							style={styles.productContainer}
						>
							<Text style={{textAlign: 'center'}}>
								{' '}
								Cant Scan the barcode? enter the number below
							</Text>
						</TouchableOpacity>
					)}

					<BottomSheetModalProvider>
						<KeyboardAvoidingView style={styles.bottomsheetcontainer}>
							<BottomSheetModal
								ref={bottomSheetModalRef}
								index={1}
								snapPoints={snapPoints}
								backdropComponent={renderBackdrop}
								keyboardBehavior="interactive"
								keyboardBlurBehavior="restore"
								backgroundStyle={{opacity: 0.7}}
								// onDismiss={() => navigation.goBack()}
							>
								{renderBarcodeInput()}
							</BottomSheetModal>
						</KeyboardAvoidingView>
					</BottomSheetModalProvider>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

export default CrateScanner;

const styles = StyleSheet.create({
	productContainer: {
		position: 'absolute',
		zIndex: 30,
		width: SIZES.width,
		height: SIZES.height - 50,
		alignSelf: 'center',
		borderRadius: 15,
		borderWidth: 2,
		borderColor: COLORS.white,
		marginTop: SIZES.height - 100,
		backgroundColor: COLORS.background,
		opacity: 0.5,
	},
	contentContainer: {
		flex: 1,
		alignItems: 'center',
	},
	bottomsheetcontainer: {
		flex: 1,
		padding: 24,
		height: SIZES.height,
		width: SIZES.width,
		position: 'absolute',
		justifyContent: 'center',
		textAlign: 'center',
	},
});
