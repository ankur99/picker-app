import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {
	Text,
	View,
	StyleSheet,
	TouchableOpacity,
	SafeAreaView,
	KeyboardAvoidingView,
	Pressable,
} from 'react-native';
import {BarCodeScanner} from 'expo-barcode-scanner';
import {COLORS, SIZES, FONTS} from '../constants';
import {
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetTextInput,
	BottomSheetBackdrop,
	BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {ErrorModal, PickModal} from '../components';
import * as API from '../utils/RestServices';
import * as CommonUtils from '../utils/CommonUtils';
import BarcodeMask from 'react-native-barcode-mask';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BarcodeScanner = ({route, navigation}) => {
	const {
		selectedProduct,
		pickList,
		scanLocation,
		activePickList,
		currentpickList,
		productVerified,
		itemStatus,
		storageId,
	} = route.params;
	const [scanProduct, setScanProduct] = useState(!scanLocation);
	const [product, setProduct] = useState(selectedProduct);
	const [hasPermission, setHasPermission] = useState(true);
	const [scanned, setScanned] = useState(false);
	const bottomSheetModalRef = useRef(null);
	const [toggleButton, settoggleButton] = useState(false);
	const [verified, setVerified] = useState(productVerified);
	const [quantity, setQuantity] = useState(0);

	const lengthInput = 5;
	let textInput = useRef(null);
	const [internalValue, setInternalValue] = useState('');
	const [modalVisible, setModalVisible] = useState(productVerified);

	const [processedQty, setProcessedQty] = useState(0);
	const processedItems = {
		picked: 0,
		skipped: [],
	};
	const snapPoints = useMemo(() => ['25%', '80%'], []);

	const [showError, setShowError] = useState(false);
	const [openCamera, setOpenCamera] = useState(false);

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

	useEffect(() => {
		if (internalValue.length >= 5) verifyCode();
	}, [internalValue]);

	useEffect(() => {
		verifyCode();
	}, [product]);
	const handlePresentModalPress = useCallback(() => {
		settoggleButton(false);
		setInternalValue('');

		setOpenCamera(false);
		bottomSheetModalRef.current?.present();
	}, []);

	const openScanner = () => {
		settoggleButton(true);
		setOpenCamera(true);
		bottomSheetModalRef.current?.dismiss();
	};

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

	const onChangeText = async (val) => {
		if (!scanProduct) {
			setInternalValue(val);
		} else {
			if (product == null || product == undefined) {
				setInternalValue(val);
			} else {
				setInternalValue(val.substring(val.length - 5));
			}
		}
	};
	const handleBarCodeScanned = async (type) => {
		var barcode = JSON.stringify(type.data);
		barcode = barcode.replace(/"/g, '');
		barcode = barcode.replace(/\\/g, '');
		barcode = barcode.replace(/]C1/g, '');

		setInternalValue(barcode);
	};

	if (hasPermission === null) {
		return <Text>Requesting for camera permission</Text>;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	const closePickModal = () => {
		setModalVisible(false);
		setVerified(false);
		setScanned(false);
		setInternalValue('');
		navigation.goBack();
	};

	const verifyCode = async (click) => {
		if (!scanProduct) {
			if (product !== null && product !== undefined) {
				console.log('product', product);

				if (internalValue.length >= product?.location.toString().length) {
					if (internalValue == product?.location.toString()) {
						setScanProduct(true);
						setInternalValue('');
						settoggleButton(false);
						setOpenCamera(false);
						bottomSheetModalRef.current?.present();
					} else {
						CommonUtils.showMessage(
							'error',
							`Location Label did not match. please check once again`,
							'',
							true,
						);
					}
				}
			} else {
				if (click) {
					if (internalValue.length > 1) {
						await API.getPendingItems(pickList.id, internalValue).then(
							(res) => {
								if (res.data.length > 1) {
									navigation.push('PickList', {
										pickList: pickList,
										activePickList: activePickList,
										currentpickList: currentpickList,
										storageId: internalValue,
										fetchedData: res,
									});
								} else if (res.data.length === 1) {
									navigation.navigate('BarcodeScanner', {
										selectedProduct: res.data[0],
										pickList: pickList,
										// onProcessed: onProcessed,
										scanLocation: false,
										activePickList: activePickList,
										currentpickList: route.params?.currentpickList,
										productVerified: true,
									});
								} else {
									CommonUtils.showMessage(
										'error',
										`Storage Id did not match. please check once again`,
										'',
										true,
									);
								}
							},
						);
					}
				}
			}
		} else {
			let comparisionValue;
			if (internalValue.length > 0) {
				if (internalValue.length >= 5) {
					comparisionValue = internalValue.slice(-5);
				} else {
					comparisionValue = internalValue;
				}
				if (
					(product == null || product == undefined) &&
					internalValue.length > 5
				) {
					await API.getPendingItems(
						pickList.id,
						pickList.id,
						itemStatus,
						storageId,
						internalValue,
					).then((res) => {
						if (res.data.length === 1) {
							setProduct(res.data[0]);
							setVerified(true);
							settoggleButton(false);
							setOpenCamera(false);
							bottomSheetModalRef.current?.dismiss();
							setModalVisible(true);
							return;
						} else {
							CommonUtils.showMessage(
								'error',
								`Barcode did not match. please check once again`,
								'',
								true,
							);
						}
					});
				}
				if (
					product?.barcode !== null &&
					product?.barcode != undefined &&
					comparisionValue == product?.barcode.toString().slice(-5)
				) {
					setVerified(true);
					settoggleButton(false);
					setOpenCamera(false);
					bottomSheetModalRef.current?.dismiss();
					setModalVisible(true);
					return;
				}
				if (internalValue.length > 5) {
					setShowError(true);
				} else if (internalValue.length === 5) {
					CommonUtils.showMessage(
						'error',
						`Bar code did not match. please check once again`,
						'',
						true,
					);
				}
				return;
			}
		}
	};

	const updateSkipQuantity = (reason) => {
		if (reason != null && reason != undefined) {
			processedItems.skipped.push({
				reason: reason,
				quantity: quantity,
			});
			setProcessedQty(processedQty + quantity);
			setQuantity(0);
		}

		setModalVisible(!modalVisible);
	};

	// const onProcessed = (product_id, storage_id, is_complete) => {
	// 	route.params.onProcessed(product_id, storage_id, is_complete);
	// 	navigation.goBack();
	// };

	const renderBarcodeInput = () => {
		return (
			<View style={styles.contentContainer}>
				<Text>
					{!scanProduct
						? 'Scan Storage Label'
						: 'Enter Last 5 digits of the barcode'}
				</Text>
				<View>
					<BottomSheetTextInput
						ref={(input) => (textInput = input)}
						style={scanProduct ? {width: 0, height: 0} : styles.locationInput}
						value={internalValue}
						onChangeText={onChangeText}
						returnKeyType="done"
						keyboardType={!scanProduct ? 'ascii-capable' : 'numeric'}
						autoFocus={true}
					/>
					{scanProduct && (
						<View style={styles.containerInput}>
							{Array(lengthInput)
								.fill()
								.map((data, index) => (
									<Pressable
										style={{
											...styles.cellView,
											borderBottomColor:
												index === internalValue.length
													? COLORS.gray
													: COLORS.gray,
										}}
										key={index}
										onPress={() => textInput.focus()}
									>
										<Text style={styles.cellText}>
											{internalValue && internalValue.length > 0
												? internalValue[index]
												: ''}
										</Text>
									</Pressable>
								))}
						</View>
					)}
				</View>
				<TouchableOpacity onPress={() => verifyCode('click')}>
					<View
						style={{
							...styles.btnContainer,
							backgroundColor: COLORS.primary,
						}}
					>
						<Text style={{...styles.textContinue, ...FONTS.h3}}>Verify</Text>
					</View>
				</TouchableOpacity>

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
			{openCamera && (
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
						Cant Scan the barcode? enter the number below{' '}
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
						<BottomSheetScrollView>
							{!verified && renderBarcodeInput()}
						</BottomSheetScrollView>
					</BottomSheetModal>
				</KeyboardAvoidingView>
			</BottomSheetModalProvider>

			<View style={{width: 500, heigh: 500}}>
				<PickModal
					quantity={quantity}
					modalVisible={modalVisible}
					setModalVisible={closePickModal}
					skipItems={updateSkipQuantity}
					product={product}
					pickList={pickList}
					// onProcessed={onProcessed}
				/>
			</View>
			{
				<ErrorModal
					errorMsg="Bar Code you entered/scanned did not match with the product."
					modalVisible={showError}
					setShowError={() => {
						setShowError((preState) => (preState = !preState));
					}}
					handleButtonPress={handlePresentModalPress}
					buttonTitle={
						product == undefined ? 'scan again' : 'enter the barcode manually'
					}
				/>
			}
		</SafeAreaView>
	);
};

export default BarcodeScanner;

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
	cellView: {
		paddingVertical: 11,
		width: 40,
		margin: 5,
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 10,
	},
	cellText: {
		...FONTS.body2,
		textAlign: 'center',
	},
	containerInput: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		width: 100,
		height: 100,
	},
	btnContainer: {
		width: 160,
		height: 50,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textContinue: {
		color: 'white',
		alignItems: 'center',
	},
	locationInput: {
		borderWidth: 1,
		width: 300,
		borderRadius: 12,
		marginVertical: 10,
		paddingLeft: 10,
		color: 'black',
	},
});
