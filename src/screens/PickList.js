import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
	StyleSheet,
	SafeAreaView,
	View,
	Text,
	TouchableOpacity,
	Platform,
	TouchableNativeFeedback,
	FlatList,
	TextInput,
	Image,
	Pressable,
	ActivityIndicator,
	// Alert,
} from 'react-native';
import {Header} from '../components';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {COLORS, SIZES, FONTS, LABEL} from '../constants';
import * as API from '../utils/NewRestServices';
import * as CommonUtils from '../utils/CommonUtils';
import UserState from '../utils/userstate';
import {
	SkipModal,
	PickModal,
	FinishPickListDialog,
	Empty,
	ImageContainer,
} from '../components';
import DisplayMessage from '../components/DisplayMessage';
import {useFocusEffect} from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

const PickList = ({route, navigation}) => {
	let textInput = useRef();

	const {pickList, activePickList, storageId, fetchedData} = route.params;
	const [isLoading, setIsLoading] = useState(true);
	const [filteredProductList, setFilteredProductList] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [filerOption, setFilterOption] = useState(3);
	const [quantity, setQuantity] = useState(0);
	const [selectedItem, setSelectedItem] = useState(-1);
	const [page, setPage] = useState(1);
	const [lastPage, setLastPage] = useState(1);
	const [pickProduct, setPickProduct] = useState(false);
	const [itemStatus, setItemStatus] = useState('0');
	const [refresh, setRefresh] = useState(0);
	const [isProcessable, setIsProcessable] = useState(false);
	const [displayMessage, setDisplayMessage] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [currentImage, setCurrentImage] = useState('');
	// const [processedItems, setProcessedItems] = useState([]);
	const [perPageItems, setPerPageItems] = useState(0);
	const [imageModalVisible, setImageModalVisible] = useState(false);
	const [summaryData, setSummaryData] = useState(null);
	const [finishing, setFinishing] = useState(false);
	// const [unpicking, setUnpicking] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [searching, setSearching] = useState(false);
	const [showFinishDialog, setShowFinishDialog] = useState(false);
	const [searchText, setSearchText] = useState('');

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', async () => {
			if (fetchedData) {
				setLastPage(Math.ceil(fetchedData.count / fetchedData.count_per_page));
				setPerPageItems(fetchedData.count_per_page);

				setFilteredProductList(fetchedData.data);
				if (fetchedData.count == 0 && !storageId) {
					setShowFinishDialog(true);
				}
			} else {
				await API.getPendingItems(pickList.id, itemStatus, storageId).then(
					(res) => {
						setIsLoading(false);

						setLastPage(Math.ceil(res.count / res.count_per_page));
						setPerPageItems(res.count_per_page);
						setFilteredProductList(res.results);
						if (res.results == 0 && storageId) {
							// CommonUtils.showMessage(
							// 	'error',
							// 	`No items found in ${storageId} storage`,
							// 	'',
							// 	true,
							// );
							setTimeout(function () {
								navigation.replace('PickList', {
									pickList: pickList,
									activePickList: activePickList,
									currentpickList: route.params?.currentpickList,
									storageId: null,
								});
							}, 1000);
						}

						if (res.count == 0 && !storageId) {
							setShowFinishDialog(true);
						}
					},
				);
				setIsLoading(false);
			}

			if (activePickList == 0 || activePickList == pickList.id) {
				setIsProcessable(true);
			}
		});

		return unsubscribe;
	}, [navigation]);

	useFocusEffect(
		useCallback(() => {
			setTimeout(() => {
				!searching && textInput.current && textInput.current.focus();
			}, 1000);
		}, []),
	);

	useEffect(() => {
		const intervalId = setInterval(() => {
			!searching && textInput.current && textInput.current.focus();
		}, 2000);
		return () => clearInterval(intervalId);
	}, [navigation]);

	const populatePickList = async (status) => {
		setIsLoading(true);

		await API.getPendingItems(pickList.id, status, storageId).then((res) => {
			setLastPage(Math.ceil(res.count / res.count_per_page));
			setPage(1);
			setPerPageItems(res.count_per_page);
			setFilteredProductList(res.results);
			if (res.count == 0 && status === '0' && !storageId) {
				setShowFinishDialog(true);
			} else {
				if (res.count == 0 && status === '0' && storageId) {
					setTimeout(function () {
						navigation.replace('PickList', {
							pickList: pickList,
							activePickList: activePickList,
							currentpickList: route.params?.currentpickList,
							storageId: null,
						});
					}, 1000);
				}
			}
		});
		setIsLoading(false);
	};

	useEffect(() => {
		setSelectedItem(-1);
		setPage(Math.ceil(filteredProductList.length / perPageItems));
	}, [filteredProductList]);

	// useEffect(() => {
	// 	if (processedItems.length > 5) {
	// 		loadMoreData();
	// 	}
	// }, [processedItems]);

	// const updateSkipQuantity = (reason) => {
	// 	setUpdating(true);
	// 	let data = {
	// 		product_id: filteredProductList[selectedItem].product_id,
	// 		storage_id: filteredProductList[selectedItem].storage_id,
	// 		quantity: 0,
	// 		skip: reason,
	// 	};
	// 	API.pickItems(pickList.id, data)
	// 		.then((res) => {
	// 			setUpdating(false);
	// 			onProcessed(
	// 				filteredProductList[selectedItem].product_id,
	// 				filteredProductList[selectedItem].storage_id,
	// 				res.is_complete,
	// 			);
	// 		})
	// 		.catch(() => {
	// 			Alert.alert('something went wrong.');
	// 			setUpdating(false);
	// 		});
	// };

	const onInput = async (text) => {
		setSearching(true);
		setSearchText(text);
		const textData = text.toUpperCase();
		if (!storageId) {
			setSearching(false);

			if (text) {
				navigation.replace('PickList', {
					pickList: pickList,
					activePickList: activePickList,
					currentpickList: route.params?.currentpickList,
					storageId: textData,
				});
			}
		} else {
			!searching &&
				(await API.getPendingItems(
					pickList.id,
					itemStatus,
					storageId,
					textData,
				).then((res) => {
					setSearchText('');
					setSearching(false);

					if (res.results.length > 0) {
						setLastPage(Math.ceil(res.count / res.count_per_page));
						setPerPageItems(res.count_per_page);
						setFilteredProductList(res.results);
						if (res.results.length === 1) {
							navigation.navigate('BarcodeScanner', {
								selectedProduct: res.results[0],
								pickList: pickList,
								// onProcessed: onProcessed,
								scanLocation: false,
								activePickList: activePickList,
								currentpickList: route.params?.currentpickList,
								productVerified: true,
							});
						}
					} else {
						setSearchText('');
						setSearching(false);

						CommonUtils.showMessage(
							'error',
							`${
								storageId ? 'Storage Label' : 'Product Barcode'
							} did not match. please check once again`,
							'',
							true,
						);
					}
				}));
			setIsLoading(false);
			if (activePickList == 0 || activePickList == pickList.id) {
				setIsProcessable(true);
			}
		}
	};

	const filterItem = (id) => {
		setIsLoading(true);
		var status = '0';
		switch (id) {
			case 1:
				status = '4';
				break;
			case 2:
				status = '1';
				break;
			case 3:
				status = '0';
				break;
			case 4:
				status = 'skipped';
				break;
			default:
				status = '0';
				break;
		}
		setFilteredProductList([]);
		setItemStatus(status);
		setFilterOption(id);
		populatePickList(status);
		setRefresh(refresh + 1);
	};
	const gotoSkippedItems = () => {
		filterItem(3);
	};
	const renderFilterOptions = () => {
		return (
			<View style={styles.filterButtonGroup}>
				<Pressable
					disabled={isLoading}
					style={{
						...styles.filterButton,
						backgroundColor: filerOption == 3 ? COLORS.green : COLORS.BgGray,
					}}
					onPress={() => filterItem(3)}
				>
					<Text style={{fontWeight: 'bold', color: 'white'}}>Pending</Text>
				</Pressable>
				<Pressable
					disabled={isLoading}
					style={{
						...styles.filterButton,
						backgroundColor: filerOption == 2 ? COLORS.green : COLORS.BgGray,
					}}
					onPress={() => filterItem(2)}
				>
					<Text style={{fontWeight: 'bold', color: 'white'}}>Picked</Text>
				</Pressable>
				{/* <Pressable
					disabled={isLoading}
					style={{
						...styles.filterButton,
						backgroundColor: filerOption == 4 ? COLORS.green : COLORS.BgGray,
					}}
					onPress={() => filterItem(4)}
				>
					<Text style={{fontWeight: 'bold', color: 'white'}}>Skipped</Text>
				</Pressable> */}
				<Pressable
					disabled={isLoading}
					style={{
						...styles.filterButton,
						backgroundColor: filerOption == 1 ? COLORS.green : COLORS.BgGray,
					}}
					onPress={() => filterItem(1)}
				>
					<Text style={{fontWeight: 'bold', color: 'white'}}>Total Items</Text>
				</Pressable>
			</View>
		);
	};

	const expandItem = (item, index) => {
		if (!isProcessable) {
			setDisplayMessage(true);
			return;
		}
		if (item != null) {
			setSelectedItem(index);
			setQuantity(Number(item.pending_quantity));
		}

		navigation.navigate('BarcodeScanner', {
			selectedProduct: item,
			pickList: pickList,
			// onProcessed: onProcessed,
			scanLocation: !item || !storageId,
			activePickList: activePickList,
			currentpickList: route.params?.currentpickList,
			productVerified: false,
			itemStatus: itemStatus,
			storageId: storageId,
		});
	};

	// const pickAgain = async (item) => {
	// 	setUnpicking(true);
	// 	const data = {product_id: item.product_id, storage_id: item.storage_id};
	// 	await API.unPickItem(pickList.id, data)
	// 		.then((result) => {
	// 			if (result !== null && result !== []) {
	// 				filterItem(3);
	// 			}
	// 			setUnpicking(false);
	// 		})
	// 		.catch((error) => {
	// 			setUnpicking(false);

	// 			CommonUtils.showMessage('error', error.message, '', true);
	// 		});
	// 	setUnpicking(false);
	// };

	const markPickListFinished = async (storage_label) => {
		setFinishing(true);
		await API.finishPickList(pickList.id, storage_label)
			.then(() => {
				setFinishing(false);
				setShowFinishDialog(false);
				let refreshpicklist = 1;
				if (route.params?.currentpickList) {
					refreshpicklist = refreshpicklist + route.params?.currentpickList;
				}
				navigation.navigate({
					name: 'Home',
					params: {currentpickList: refreshpicklist},
					merge: true,
				});
				CommonUtils.showMessage(
					'finishpicklist',
					'Hurray !!!',
					'Picklist id #' + pickList.id + '  Completed',
				);
			})
			.catch((error) => {
				console.log('fin ish errprxx', error.response.data.message);
				setFinishing(false);
				setShowFinishDialog(false);
				CommonUtils.showMessage('error', 'Error', error.response.data.message);
				setTimeout(() => {
					setShowFinishDialog(true);
				}, 4000);
			});
	};

	// load more data
	const loadMoreData = () => {
		// console.log({processedItems});

		console.log(page, ' ', lastPage);

		if (page < lastPage) {
			API.getPendingItems(
				pickList.id,
				itemStatus,
				storageId,
				'',
				page + 1,
			).then((res) => {
				const listItems = [...filteredProductList, ...res.results];

				const uniqueItems = listItems.filter((currentitem, id, array) => {
					return (
						array.findIndex(
							(item) =>
								item.product_id == currentitem.product_id &&
								item.storage_id === currentitem.storage_id,
						) == id
					);
				});
				setFilteredProductList(uniqueItems);
				setLastPage(Math.ceil(res.count / res.count_per_page));
			});
			setPage(page + 1);
		}

		setRefresh(refresh + 1);
	};

	// const onProcessed = (itemID, storageid, status) => {
	// 	setIsLoading(true);
	// 	const itemIndex = filteredProductList.findIndex(
	// 		(item) => item.product_id == itemID && item.storage_id === storageid,
	// 	);
	// 	if (itemIndex >= 0) {
	// 		setProcessedItems([...processedItems, itemID]);
	// 		setSelectedItem(-1);
	// 		const itemname = filteredProductList[itemIndex].name;
	// 		filteredProductList.splice(itemIndex, 1);
	// 		CommonUtils.showMessage(
	// 			'success',
	// 			'Successfully picked  Item ' + itemname,
	// 			'',
	// 			true,
	// 		);
	// 		if (status == true) {
	// 			setShowFinishDialog(true);
	// 		}
	// 		if (!status && filteredProductList.length == 0) {
	// 			navigation.pop(2);
	// 		}
	// 	}

	// 	setRefresh(refresh + 1);
	// 	setIsLoading(false);
	// };

	const onRefresh = () => {
		setIsRefreshing(true);
		populatePickList(itemStatus);

		setRefresh(refresh + 1);
		setIsRefreshing(false);
	};
	// Header component
	const renderHeader = () => {
		let TouchableCmp = TouchableOpacity;

		if (Platform.OS === 'android' && Platform.Version >= 21) {
			TouchableCmp = TouchableNativeFeedback;
		}
		//

		const displaySkipOptions = (item, index) => {
			if (!isProcessable) {
				setDisplayMessage(true);
				return;
			}
			setSelectedItem(index);
			setQuantity(Number(item.pending_quantity));
			getSummaryData(item);
		};

		const getSummaryData = async (item) => {
			setSummaryData(null);
			await API.getCrateProductQty(pickList.id, {
				product_id: item?.product_id,
				storage_id: item?.storage_id,
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
				setSummaryData(res);
			});
		};

		const skipItem = async (item) => {
			if (itemStatus != '0') {
				const data = {product_id: item.product_id, storage_id: item.storage_id};
				const result = await API.unPickItem(pickList.id, data);
				if (result !== null && result !== []) {
					setQuantity(Number(result.data.pending_quantity));
				}
			}
			setModalVisible(true);
		};
		const displayImage = (image) => {
			setCurrentImage(image);
			setImageModalVisible(!imageModalVisible);
		};

		const renderItem = ({item, index}) => (
			<TouchableCmp
				style={{flexDirection: 'column'}}
				activeOpacity={0.8}
				onPress={() => {
					if (selectedItem != index) {
						displaySkipOptions(item, index);
					}
				}}
			>
				<View style={{...styles.card}}>
					<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
						<Pressable
							style={{width: '20%', borderRadius: 4.65}}
							onPress={() => displayImage(item.product_image)}
						>
							<Image
								source={{uri: item.product_image}}
								style={{flex: 1, ...styles.imageContainer}}
								resizeMode="contain"
							/>
							<View style={styles.expandIcon}>
								<MaterialCommunityIcons
									name="arrow-expand"
									size={15}
									color={COLORS.primary}
									solid
								/>
							</View>
						</Pressable>

						<View style={{flex: 2, marginLeft: 15}}>
							<View style={{flexDirection: 'column'}}>
								<View>
									<Text
										style={{
											...FONTS.h4,
											color: COLORS.black,
											fontWeight: 'bold',
										}}
									>
										{item.name}
									</Text>
								</View>

								<View>
									<Text style={{...FONTS.h4, color: COLORS.black}}>
										MRP {'\u20B9'}
										{item.mrp}
									</Text>
								</View>

								<View
									style={{
										marginTop: 7,
										flexDirection: 'row',
										alignItems: 'center',
									}}
								>
									<MaterialCommunityIcons
										name="map-marker"
										size={12}
										color={COLORS.gray}
										solid
									/>
									<Text
										style={{
											...FONTS.body4,
											fontWeight: 'bold',
											color: COLORS.primary,
										}}
									>
										{item.location}{' '}
									</Text>
								</View>

								<View>
									{itemStatus == 0 ? (
										<Text style={{...FONTS.body5, color: COLORS.gray}}>
											Quantity-{' '}
											{item.pending_quantity == 0
												? Number(item.picked_quantity) +
												  Number(item.skipped_quantity)
												: Number(item.pending_quantity)}
											{/* {item.variants &&
											item.variants[0] &&
											itemStatus != '' &&
											' (' + item.variants[0][itemStatus][0] + ')'}
											 */}{' '}
											({item.sku_list})
										</Text>
									) : (
										<>
											{itemStatus !== '1' &&
												item.pending_quantity !== item.skipped_quantity && (
													<Text style={{...FONTS.body6, color: COLORS.gray}}>
														Pending: {item.pending_quantity}
													</Text>
												)}
											{itemStatus !== '4' && (
												<Text style={{...FONTS.body6, color: COLORS.gray}}>
													Skipped: {item.skipped_quantity}
												</Text>
											)}
											<Text style={{...FONTS.body6, color: COLORS.gray}}>
												Picked: {item.picked_quantity}
											</Text>
											{itemStatus === '4' && (
												<Text style={{...FONTS.body6, color: COLORS.gray}}>
													Pending: {item.pending_quantity}
												</Text>
											)}
										</>
									)}
								</View>
							</View>
						</View>
						{item.pending_quantity == 0 && item.skipped_quantity == 0 && (
							<Pressable
								// onPress={() => pickAgain(item)}
								style={{
									flexDirection: 'row',
									alignItems: 'center',
									width: '25%',
									justifyContent: 'flex-end',
								}}
							>
								<View
									style={{
										justifyContent: 'space-around',
										alignItems: 'center',
									}}
								>
									<Image
										style={{marginBottom: 5}}
										source={require('../assets/icons/check-circle.png')}
									/>
									<Text style={{fontSize: 10}}>Item</Text>
									<Text style={{fontSize: 10}}>Picked</Text>
								</View>
								{/* <View
									style={{
										alignItems: 'center',
										justifyContent: 'space-around',
									}}
								>
									<FontAwesome5
										name="chevron-right"
										size={30}
										color={COLORS.primary}
										solid
									/>
									<Text
										style={{...FONTS.h6, color: COLORS.primary, marginTop: 9}}
									>
										Pick
									</Text>
									<Text style={{...FONTS.h6, color: COLORS.primary}}>
										Again
									</Text>
								</View> */}
							</Pressable>
						)}
						{/* {((item.pending_quantity == 0 && item.skipped_quantity > 0) ||
							itemStatus == 'skipped') &&
							(!unpicking ? (
								<Pressable
									onPress={() => pickAgain(item)}
									style={{
										flexDirection: 'row',
										alignItems: 'center',
										width: '25%',
										justifyContent: 'space-between',
									}}
								>
									<View
										style={{
											alignItems: 'center',
											justifyContent: 'space-around',
										}}
									>
										<Image source={require('../assets/icons/red-cross.png')} />
										<Text style={{...FONTS.h6, color: COLORS.primary}}>
											Item
										</Text>
										<Text style={{...FONTS.h6, color: COLORS.primary}}>
											Skipped
										</Text>
									</View>
									<View
										style={{
											alignItems: 'center',
											justifyContent: 'space-around',
										}}
									>
										<FontAwesome5
											name="chevron-right"
											size={30}
											color={COLORS.primary}
											solid
										/>
										<Text
											style={{...FONTS.h6, color: COLORS.primary, marginTop: 9}}
										>
											Pick
										</Text>
										<Text style={{...FONTS.h6, color: COLORS.primary}}>
											Again
										</Text>
									</View>
								</Pressable>
							) : (
								<ActivityIndicator />
							))} */}
						{item.pending_quantity > 0 &&
							// item.skipped_quantity == 0 &&
							itemStatus == 0 && (
								<Pressable
									style={{justifyContent: 'center'}}
									onPress={() => expandItem(item, index)}
								>
									<View style={{alignItems: 'center'}}>
										<MaterialCommunityIcons
											name="barcode-scan"
											size={25}
											color={COLORS.primary}
											solid
										/>
										<Text style={{...FONTS.h6, color: COLORS.primary}}>
											Scan
										</Text>
										<Text style={{...FONTS.h6, color: COLORS.primary}}>
											Barcode
										</Text>
									</View>
								</Pressable>
							)}
					</View>

					{selectedItem == index && (
						<View
							style={{
								borderTopWidth: 1,
								borderColor: COLORS.BgGray,
								justifyContent: 'space-around',
								marginTop: 10,
							}}
						>
							{
								// item.skipped_quantity == 0 &&
								itemStatus != 'skipped' && itemStatus == '0' && (
									<Pressable
										style={{...styles.btnContainer}}
										onPress={() => skipItem(item)}
									>
										<Text
											style={{
												...FONTS.h4,
												color: COLORS.primary,
												fontWeight: 'bold',
											}}
										>
											Skip {item.pending_quantity} quantities of this Item
										</Text>
									</Pressable>
								)
							}

							{summaryData && (
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
									{summaryData &&
										summaryData?.order_product_count?.map(
											(summaryItem, key) => (
												<View key={key} style={{...styles.summaryRow}}>
													<View style={{...styles.summaryItem}}>
														<Text style={{...styles.summaryText}}>
															{summaryItem.order_id}
														</Text>
													</View>
													<View style={{...styles.summaryItem}}>
														<Text style={{...styles.summaryText, marginTop: 5}}>
															{summaryItem.pending_quantity}
														</Text>
													</View>
													<View style={{...styles.summaryItem}}>
														<Text
															style={{
																...styles.summaryText,
																marginTop: 5,
															}}
														>
															{summaryItem.picked_quantity}
														</Text>
													</View>
													<View style={{...styles.summaryItem}}>
														{summaryItem?.crate_id?.map((crate, key) => (
															<Text key={key} style={{...styles.summaryText}}>
																{crate}
															</Text>
														))}
													</View>
												</View>
											),
										)}
								</View>
							)}
						</View>
					)}
				</View>
			</TouchableCmp>
		);

		return (
			<View
				style={{
					flex: 1,
					width: '100%',
					height: SIZES.height - 20,
					...styles.shadow,
				}}
			>
				<View
					style={{
						flex: 1,
					}}
				>
					{filteredProductList.length == 0 && !isLoading && <Empty />}
					{isLoading ? (
						<View style={{flex: 1, marginTop: 100}}>
							<ActivityIndicator size="large" color={COLORS.primary} />
						</View>
					) : (
						<FlatList
							contentContainerStyle={{marginTop: 10, flexGrow: 1}}
							data={filteredProductList}
							renderItem={renderItem}
							keyboardShouldPersistTaps="always"
							keyExtractor={(item) => `${item.product_id + item.storage_id}`}
							nestedScrollEnabled={true}
							showsHorizontalScrollIndicator={false}
							showsVerticalScrollIndicator={false}
							extraData={refresh}
							onEndReachedThreshold={0.5}
							onEndReached={() => loadMoreData()}
							onRefresh={onRefresh}
							refreshing={isRefreshing}
							ListFooterComponent={
								isLoading && (
									<View style={{flex: 1}}>
										<ActivityIndicator size="large" color={COLORS.primary} />
									</View>
								)
							}
						/>
					)}
				</View>
			</View>
		);
	};

	const resetStorageLabel = () => {
		navigation.replace('PickList', {
			pickList: pickList,
			activePickList: activePickList,
			currentpickList: route.params?.currentpickList,
			storageId: null,
		});
	};

	const renderSearchBar = () => {
		return (
			<View>
				{storageId && (
					<Pressable onPress={resetStorageLabel}>
						<Text style={styles.storageLabel}>
							{storageId}{' '}
							<MaterialCommunityIcons
								name="close-circle-outline"
								size={15}
								solid
							/>
						</Text>
					</Pressable>
				)}

				<View style={styles.searchBar}>
					<FontAwesome5
						name={'search'}
						size={20}
						style={{
							color: COLORS.primary,
							position: 'absolute',
							marginLeft: 25,
						}}
					/>
					{searching ? (
						<ActivityIndicator />
					) : (
						<TextInput
							isFocused={true}
							ref={textInput}
							style={styles.input}
							onChangeText={(value) => {
								if (!searching) onInput(value);
							}}
							value={searchText}
							placeholder={`Scan ${
								storageId ? 'Product Barcode' : 'Storage Label'
							}`}
							placeholderTextColor={COLORS.primary}
							autoFocus={true}
							showSoftInputOnFocus={false}
						/>
					)}
					{/* <Pressable onPress={() => expandItem(null)}>
						<Image source={require('../assets/icons/barcode.png')} />
					</Pressable> */}
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView
			style={{
				backgroundColor: COLORS.background,
				padding: 10,
				flex: 1,
			}}
		>
			<Header
				backSteps={2}
				title="PickLists"
				left={true}
				name={UserState.name}
			/>
			{renderSearchBar()}
			{renderFilterOptions()}
			{renderHeader()}

			<View>
				{
					<SkipModal
						pickList={pickList}
						quantity={quantity}
						modalVisible={modalVisible}
						setModalVisible={() => {
							setModalVisible((preState) => (preState = !preState));
							setUpdating(false);
						}}
						gotoSkippedItems={gotoSkippedItems}
						// skipItems={updateSkipQuantity}
						updating={updating}
						product={filteredProductList[selectedItem]}
					/>
				}
				{pickProduct && (
					<PickModal
						quantity={quantity}
						modalVisible={pickProduct}
						setModalVisible={() => {
							setPickProduct((preState) => (preState = !preState));
						}}
						// skipItems={updateSkipQuantity}
						product={filteredProductList[selectedItem]}
						pickList={pickList}
						// onProcessed={onProcessed}
					/>
				)}
				{
					<FinishPickListDialog
						finishing={finishing}
						modalVisible={showFinishDialog}
						setModalVisible={() => {
							setShowFinishDialog((preState) => (preState = !preState));
						}}
						handleButtonPress={markPickListFinished}
						handleButtonPress2={gotoSkippedItems}
						buttonTitle1={LABEL.FinishModalSuccessButton}
						buttonTitle2={LABEL.FinishModalSkipButton}
						message={LABEL.FinishModalMessage}
					/>
				}

				{
					<ImageContainer
						modalVisible={imageModalVisible}
						image={currentImage}
						setModalVisible={() => {
							setImageModalVisible((preState) => (preState = !preState));
						}}
					/>
				}

				{
					<DisplayMessage
						modalVisible={displayMessage}
						setModalVisible={() => {
							setDisplayMessage((preState) => (preState = !preState));
						}}
						text={
							'Please finish picking PickList ID # ' + activePickList + ' first'
						}
					/>
				}
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	imageContainer: {
		backgroundColor: COLORS.BgImage,
		borderRadius: 4.65,
	},
	shadow: {
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 144,
		},
		shadowOpacity: 0.3,
		shadowRadius: 4.65,

		elevation: 8,
	},
	card: {
		// for ios
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 4},
		shadowRadius: 4.65,
		shadowOpacity: 0.3,
		// for ios

		// for android
		elevation: 8,
		// for android

		borderRadius: 10,
		margin: 10,
		marginTop: 5,
		position: 'relative',
		justifyContent: 'flex-start',
		paddingVertical: SIZES.base + 3,
		paddingHorizontal: SIZES.base + 3,
		paddingRight: SIZES.base * 2,
		backgroundColor: COLORS.BgListItem,
		zIndex: 3,
	},
	input: {
		height: 40,
		width: '100%',
		borderWidth: 2,
		borderColor: COLORS.primary,
		paddingLeft: 50,
		borderRadius: 20,
		color: COLORS.primary,
	},
	searchBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
		paddingLeft: 10,
		paddingRight: 10,
	},
	filterButtonGroup: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		// alignItems: 'center',
		// height: 30,
		paddingLeft: 10,
		paddingRight: 10,
		marginBottom: 10,
		// shadowColor: 'black',
		// shadowOffset: {width: 0, height: 2},
		// shadowOpacity: 0.2,
		// elevation: 2,
		// position: 'relative',
	},
	filterButton: {
		borderRadius: 30,
		padding: 5,
		alignItems: 'center',
		backgroundColor: COLORS.green,
		width: '30%',
		height: 30,
	},
	btnContainer: {
		height: 25,
		borderRadius: 4,
		marginTop: 5,
		alignItems: 'center',
		justifyContent: 'center',
	},
	expandIcon: {
		backgroundColor: 'white',
		position: 'absolute',
		right: 0,
		top: -5,
		padding: 2,
		borderRadius: 10,
	},
	storageLabel: {
		textAlign: 'center',
		backgroundColor: COLORS.primary,
		color: COLORS.white,
		marginBottom: 10,
		width: '40%',
		paddingVertical: 5,
		borderRadius: 12,
	},
	summary: {
		flexDirection: 'column',
		width: '100%',
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
{
	/*overflow: Platform.OS === 'android' && Platform.Version >= 21 ? 'visible' : 'visible',*/
}
export default PickList;
