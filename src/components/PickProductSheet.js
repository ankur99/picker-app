import React, {useEffect, useState} from 'react';
import {
	Text,
	View,
	StyleSheet,
	Image,
	TouchableOpacity,
	KeyboardAvoidingView,
	Pressable,
} from 'react-native';
import * as CommonUtils from '../utils/CommonUtils';

import InputSpinner from 'react-native-input-spinner';
import {COLORS, FONTS} from '../constants';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// import AsyncStorage from '@react-native-async-storage/async-storage';

import * as API from '../utils/NewRestServices';
import CrateScanner from '../screens/CrateScanner';

const PickProduct = (props) => {
	const {product, pickList} = props;
	const [quantity, setQuantity] = useState(0);
	// const [modalVisible, setModalVisible] = useState(false);
	const [scannerVisible, setScannerVisible] = useState(false);
	const [crateId, setCrateId] = useState('');
	const [loading, showLoading] = useState(false);
	const [summaryData, setSummaryData] = useState([]);

	useEffect(() => {
		getSummaryData();
	}, []);

	const getSummaryData = async () => {
		await API.getCrateProductQty(pickList.id, {
			product_id: product?.product_id,
			storage_id: product?.storage_id,
		}).then(async (res) => {
			// let storedCrates = JSON.parse(await AsyncStorage.getItem('CARTS'));

			// if (storedCrates) {
			// 	res.order_product_count.map((value) =>
			// 		value.crate.map((item) => {
			// 			if (!storedCrates.includes(item.reference_id)) {
			// 				storedCrates.push(item.reference_id);
			// 			}
			// 		}),
			// 	);
			// 	await AsyncStorage.setItem('CARTS', JSON.stringify(storedCrates));
			// }
			// else {
			// 	let newCrates = [];
			// 	res.order_product_count.map((value) =>
			// 		value.crate.map((item) => {
			// 			newCrates.push(item.reference_id);
			// 		}),
			// 	);
			// 	await AsyncStorage.setItem('CARTS', JSON.stringify(newCrates));
			// }
			if (getSummaryItemsCount(res.order_product_count) === 0) {
				CommonUtils.showMessage('success', 'All items picked 👍', '', true);
				props.setModalVisible();
			}
			setSummaryData(res);
		});
	};

	// const updateSkipQuantity = () => {
	// 	setQuantity(0);
	// };

	const getSummaryItemsCount = (itemsArray) => {
		return itemsArray.reduce(function (sum, current) {
			return sum + current.pending_quantity;
		}, 0);
	};

	const submitItemforProcessing = (crate_id) => {
		showLoading(true);
		let data = {
			product_id: product.product_id,
			storage_id: product.storage_id,
			quantity: quantity,
			reference_id: crate_id,
			picklist_id: pickList?.id,
			// order_id: 445778,
		};
		console.log(data);
		API.pickItems(data)
			.then(() => {
				showLoading(false);
				CommonUtils.showMessage(
					'success',
					`${quantity} quantity picked 👍`,
					'',
					true,
				);
				props.setModalVisible();
			})
			.catch((err) => {
				showLoading(false);
				if (err.response.data.message === 'Invalid Crate') {
					setCrateId(null);
				}
				alert(err.response.data.message);
			});
	};

	const renderProductData = () => {
		return (
			<View style={{justifyContent: 'center', height: '100%'}}>
				{!loading ? (
					<Pressable style={{...styles.contentContainer}}>
						<View style={{flexDirection: 'row'}}>
							<View style={{height: 120, width: 70}}>
								<Image
									source={{uri: product?.product_image}}
									defaultSource={require('../assets/icons/inventory.png')}
									style={styles.imageContainer}
									resizeMode="contain"
								/>
							</View>
							<View style={{width: 200, marginLeft: 10}}>
								<Text
									style={{
										...FONTS.body4,
										fontWeight: 'bold',
									}}
								>
									{product?.name}
								</Text>
								<Text>PID - {product?.product_id}</Text>
								<Text>
									Quantity -{' '}
									{summaryData.order_product_count &&
										getSummaryItemsCount(summaryData.order_product_count)}{' '}
								</Text>
							</View>
						</View>

						{
							<View style={{flexDirection: 'column', alignItems: 'center'}}>
								<View style={{justifyContent: 'center'}}>
									<InputSpinner
										max={
											summaryData.order_product_count
												? Math.max.apply(
														null,
														summaryData?.order_product_count.map(function (o) {
															return o.pending_quantity;
														}),
												  )
												: 0
										}
										min={0}
										step={1}
										value={quantity}
										onChange={(num) => {
											setQuantity(num);
										}}
										colorMax={COLORS.gray}
										style={{...styles.spinner}}
										buttonFontSize={35}
										rounded={false}
										showBorder={true}
										fontSize={20}
									/>
								</View>

								<View
									style={{
										flexDirection: 'row',
										width: '80%',
										justifyContent: 'space-around',
									}}
								>
									<Pressable
										disabled={quantity === 0}
										onPress={() => {
											if (crateId) {
												setScannerVisible(true);
												setCrateId(null);
											} else {
												setScannerVisible(true);
											}
										}}
										style={{
											...styles.btnContainer,
											backgroundColor:
												quantity === 0
													? 'gray'
													: crateId
													? COLORS.green
													: COLORS.primary,
										}}
									>
										<View
											style={{
												...styles.textContinue,
												...FONTS.h5,
												paddingHorizontal: 20,
											}}
										>
											<Text style={{color: 'white'}}>
												{crateId ? crateId : ' Scan Crate'}{' '}
											</Text>
											<MaterialCommunityIcons
												name="barcode-scan"
												size={25}
												color={COLORS.white}
												solid
											/>
										</View>
									</Pressable>
								</View>
								<View style={{...styles.summary}}>
									<View style={{...styles.summaryRow}}>
										<View style={{...styles.summaryItem}}>
											<Text style={{fontWeight: 'bold'}}>order id</Text>
										</View>
										<View style={{...styles.summaryItem}}>
											<Text style={{fontWeight: 'bold'}}>pending</Text>
										</View>
										<View style={{...styles.summaryItem}}>
											<Text style={{fontWeight: 'bold'}}>picked</Text>
										</View>
										<View style={{...styles.summaryItem}}>
											<Text style={{fontWeight: 'bold'}}>crate id</Text>
										</View>
									</View>
									{summaryData?.order_product_count?.map((item, key) => (
										<View key={key} style={{...styles.summaryRow}}>
											<View style={{...styles.summaryItem}}>
												<Text style={{...styles.summaryText}}>
													{item.order_id}
												</Text>
											</View>
											<View style={{...styles.summaryItem}}>
												<Text style={{...styles.summaryText, marginTop: 5}}>
													{item.pending_quantity}
												</Text>
											</View>
											<View style={{...styles.summaryItem}}>
												<Text
													style={{
														...styles.summaryText,
														marginTop: 5,
													}}
												>
													{item.picked_quantity}
												</Text>
											</View>
											<View style={{...styles.summaryItem}}>
												{item?.crate_id?.map((crate, key) => (
													<Text key={key} style={{...styles.summaryText}}>
														{crate}
													</Text>
												))}
											</View>
										</View>
									))}
								</View>
								{crateId && (
									<TouchableOpacity
										style={{
											...styles.btnContainer,
											backgroundColor:
												quantity == 0 ? COLORS.gray : COLORS.primary,
											marginTop: 10,
										}}
										onPress={() => {
											submitItemforProcessing(crateId);
										}}
										disabled={quantity == 0}
									>
										<View
											style={{
												...styles.textContinue,
												...FONTS.h5,
												paddingHorizontal: 20,
											}}
										>
											<FontAwesome5
												name="cart-arrow-down"
												size={20}
												color={COLORS.white}
												solid
											/>
											<Text style={{color: 'white'}}> submit crate</Text>
										</View>
									</TouchableOpacity>
								)}
							</View>
						}
					</Pressable>
				) : (
					<View
						style={{
							...styles.contentContainer,
							justifyContent: 'center',
							alignItems: 'center',
							backgroundColor: 'white',
						}}
					>
						<Image
							style={{height: 200, width: 200}}
							source={require('../assets/images/loading.gif')}
							resizeMode="contain"
						/>
					</View>
				)}
			</View>
		);
	};

	return (
		<KeyboardAvoidingView style={{flex: 1}}>
			{scannerVisible && (
				<CrateScanner
					setScannerVisible={setScannerVisible}
					modalVisible={scannerVisible}
					submitItemforProcessing={submitItemforProcessing}
					pickListId={pickList.id}
					setCrateId={setCrateId}
				/>
			)}
			{!scannerVisible && renderProductData()}

			{/* {modalVisible && (
				<SkipModal
					product={product}
					pickList={pickList}
					quantity={
						quantity != 0
							? quantity
							: summaryData.order_product_count
							? getSummaryItemsCount(summaryData.order_product_count)
							: product.pending_quantity
					}
					modalVisible={modalVisible}
					setModalVisible={() => {
						setModalVisible((preState) => (preState = !preState));
					}}
					getSummaryData={getSummaryData}
					skipItems={updateSkipQuantity}
				/>
			)} */}
		</KeyboardAvoidingView>
	);
};

export default PickProduct;

const styles = StyleSheet.create({
	contentContainer: {
		paddingHorizontal: 15,
		paddingVertical: 15,
		backgroundColor: COLORS.background,
		margin: 15,
		shadowColor: '#000',
		elevation: 50,
		borderRadius: 10,
	},
	btnContainer: {
		height: 35,
		borderRadius: 5,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textContinue: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	imageContainer: {
		backgroundColor: COLORS.BgImage,
		flex: 1,
	},
	spinner: {
		width: '100%',
		marginVertical: 10,
	},
	addbutton: {
		bottom: 170,
		right: 10,
		elevation: 10,
	},
	summary: {
		flexDirection: 'column',
		width: 300,
		marginTop: 20,
	},
	summaryItem: {
		borderWidth: 0.5,
		width: '25%',
		alignItems: 'center',
	},
	summaryRow: {
		flexDirection: 'row',
	},
	summaryText: {
		fontSize: 10,
	},
});
