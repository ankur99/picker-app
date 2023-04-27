import React, {useState, useEffect} from 'react';
import {
	StyleSheet,
	View,
	Text,
	Platform,
	FlatList,
	Image,
	Pressable,
	LogBox,
	Dimensions,
	ActivityIndicator,
} from 'react-native';
import {COLORS, FONTS} from '../constants';
import {Header, Empty} from '../components';
import useListing from '../hooks/useListing';
// import moment from 'moment';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {useIsFocused} from '@react-navigation/native';
import {BarCodeScanner} from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Home = ({route, navigation}) => {
	const initialQuery = {
		status: 0,
		page: 1,
		limit: 10,
	};
	const [status, setStatus] = useState(0);
	const {user, currentpickList} = route.params;

	const isFocused = useIsFocused();

	const {
		results,
		query,
		setQuery,
		loading,
		hasMore,
		setResults,
		setLoading,
		activePickList,
		setActivePickList,
	} = useListing(initialQuery, isFocused);

	useEffect(() => {
		(async () => {
			const device = await AsyncStorage.getItem('SELECTED_DEVICE');
			if (!device) {
				navigation.navigate('DeviceSelection');
			}
		})();

		setLoading(true);
		setStatus(0);
		setQuery({
			status: 0,
			page: 1,
			limit: 10,
		});
	}, [isFocused]);

	useEffect(() => {
		(async () => {
			const {status} = await BarCodeScanner.getPermissionsAsync();
			if (status !== 'granted') {
				await BarCodeScanner.requestPermissionsAsync();
			}
			const device = await AsyncStorage.getItem('SELECTED_DEVICE');
			if (!device) {
				navigation.navigate('DeviceSelection');
			}
		})();
	}, []);
	useEffect(() => {
		LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
	}, []);

	useEffect(() => {
		if (route.params?.currentpickList) {
			setResults([]);
			setLoading(true);
			setActivePickList(0);
			setStatus(0);

			setQuery({
				status: 0,
				page: 1,
				limit: 10,
			});
		}
	}, [route.params?.currentpickList]);

	const onFilter = (param) => {
		setResults([]);
		setLoading(true);
		setStatus(param);
		setQuery({
			status: param,
			page: 1,
			limit: 10,
		});
	};

	const showPickList = (item) => {
		if (item.status === 'generated' || item.status === 'picking') {
			navigation.navigate('PickList', {
				pickList: item,
				activePickList: activePickList,
				currentpickList: currentpickList,
			});
		}
	};

	const renderFilterOptions = () => {
		return (
			<View style={styles.filterButtonGroup}>
				<Pressable
					disabled={loading}
					style={({pressed}) => ({
						...styles.filterButton,
						backgroundColor: pressed
							? COLORS.primary
							: status == 0
							? COLORS.green
							: COLORS.BgGray,
					})}
					onPress={() => onFilter(0)}
				>
					<Text style={{fontWeight: 'bold', color: 'white'}}>Pending</Text>
				</Pressable>
				<Pressable
					disabled={loading}
					style={({pressed}) => ({
						...styles.filterButton,
						backgroundColor: pressed
							? COLORS.primary
							: status == 3
							? COLORS.green
							: COLORS.BgGray,
					})}
					onPress={() => onFilter(3)}
				>
					<Text style={{fontWeight: 'bold', color: 'white'}}>Completed</Text>
				</Pressable>
			</View>
		);
	};
	// Header component
	const renderHeader = () => {
		const renderItem = ({item}) => (
			<Pressable
				style={({pressed}) => ({
					...styles.touchableCard,
					backgroundColor: pressed ? COLORS.primary : COLORS.BgListItem,
				})}
				onPress={() => showPickList(item)}
			>
				{({pressed}) => (
					<>
						<View
							style={{
								flexDirection: 'column',
								justifyContent: 'space-between',
							}}
						>
							<View>
								<Text
									style={{
										...FONTS.h4,
										color: pressed ? 'white' : COLORS.black,
										fontWeight: 'bold',
									}}
								>
									Picklist ID - #{item.id}
								</Text>
							</View>

							<View>
								<View
									style={{
										flexDirection: 'row',
										justifyContent: 'space-between',
									}}
								>
									<View>
										<Text style={{color: pressed ? 'black' : COLORS.gray}}>
											SKUs - {item.items_count}
										</Text>
									</View>

									<View>
										<Text
											style={{
												color: pressed ? 'black' : COLORS.gray,
												paddingLeft: 5,
											}}
										>
											{item.status == 'picked' ? 'Total' : 'Quantity'} -{' '}
											{item.status == 'picked'
												? item.picked_quantity
												: item.total_quantity}
										</Text>
									</View>
								</View>
								{item.status == 'picked' && (
									<View
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
										}}
									>
										<View>
											<Text style={{color: pressed ? 'black' : COLORS.gray}}>
												Skipped - {item.skipped_quantity}
											</Text>
										</View>

										<View>
											<Text
												style={{
													color: pressed ? 'black' : COLORS.gray,
													paddingLeft: 5,
												}}
											>
												{item.status == 'picked' ? 'Picked' : 'Quantity'} -{' '}
												{item.picked_quantity}
											</Text>
										</View>
									</View>
								)}
								<View>
									<Text style={{color: pressed ? 'black' : COLORS.gray}}>
										Created at: {item.created_at}{' '}
									</Text>
								</View>
							</View>
						</View>
						{item.status == 'picking' ? (
							<View style={{marginVertical: 10, alignItems: 'center'}}>
								<FontAwesome5
									name="chevron-right"
									size={30}
									color={COLORS.green}
									solid
								/>
								<Text style={{color: pressed ? 'white' : COLORS.green}}>
									Continue
								</Text>
								<Text style={{color: pressed ? 'white' : COLORS.green}}>
									Picking
								</Text>
							</View>
						) : (
							status !== 3 && (
								<View style={{marginVertical: 10, alignItems: 'center'}}>
									<Image
										style={{marginBottom: 5}}
										source={require('../assets/images/arrow.png')}
									/>
									<Text style={{color: pressed ? 'white' : COLORS.primary}}>
										Start
									</Text>
									<Text style={{color: pressed ? 'white' : COLORS.primary}}>
										Picking
									</Text>
								</View>
							)
						)}
						{item.status == 'picked' && (
							<View style={{justifyContent: 'center', alignItems: 'center'}}>
								<Image
									style={{marginBottom: 5}}
									source={require('../assets/icons/check-circle.png')}
								/>
								<Text style={{fontSize: 10}}>PickList</Text>
								<Text style={{fontSize: 10}}>Completed</Text>
							</View>
						)}
					</>
				)}
			</Pressable>
		);

		const loadMore = () => {
			if (!loading && hasMore) {
				setQuery({...query, page: query.page + 1});
			}
		};

		return (
			<View
				style={{
					width: '100%',
					height: Dimensions.get('window').height - 100,
					flex: 1,
				}}
			>
				<View
					style={{
						zIndex: 3,
						flex: 1,
					}}
				>
					{!loading && status === 1 && results.length === 0 && <Empty />}
					{!loading && status !== 1 && results.length === 0 && (
						<View style={{...styles.allDone}}>
							<FontAwesome5
								name="thumbs-up"
								style={{opacity: 0.4, marginBottom: 50}}
								size={160}
								color={COLORS.primary}
								solid
							/>
							<Text
								style={{
									color: COLORS.primary,
									opacity: 0.4,
									fontWeight: 'bold',
								}}
							>
								you have completed all the picklists for today
							</Text>
							<Text
								style={{
									color: COLORS.primary,
									opacity: 0.4,
									fontWeight: 'bold',
								}}
							>
								we will assign new picklists to you soon in the meantime
							</Text>
							<Text
								style={{
									color: COLORS.primary,
									opacity: 0.4,
									fontWeight: 'bold',
								}}
							>
								take a rest
							</Text>
						</View>
					)}
					<FlatList
						onEndReached={() => loadMore()}
						contentContainerStyle={{marginTop: 0}}
						data={results}
						renderItem={renderItem}
						keyExtractor={(item) => `${item.id}`}
						showsHorizontalScrollIndicator={false}
						onEndReachedThreshold={0.5}
						onRefresh={() => onFilter(status)}
						refreshing={false}
						ListFooterComponent={
							loading && (
								<ActivityIndicator size="large" color={COLORS.primary} />
							)
						}
					/>
				</View>
			</View>
		);
	};

	return (
		<View style={{flex: 1, backgroundColor: COLORS.background, padding: 10}}>
			<Header title="Dashboard" left="true" name={user.name} />
			{renderFilterOptions()}
			{renderHeader()}
		</View>
	);
};

const styles = StyleSheet.create({
	touchableCard: {
		// for ios
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 4},
		shadowRadius: 6.5,
		shadowOpacity: 0.3,
		// for ios

		// for android
		elevation: 8,
		// for android

		borderRadius: 10,
		width: Dimensions.get('window').width - 40,
		marginTop: 5,
		position: 'relative',
		flex: 1,
		padding: 12,
		zIndex: 2,
		overflow:
			Platform.OS === 'android' && Platform.Version >= 21
				? 'hidden'
				: 'visible',
		margin: 10,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},

	filterButtonGroup: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 10,
		// alignItems: 'center',
		// height: 30,
		// shadowColor: 'black',
		// shadowOffset: {width: 0, height: 2},
		// shadowOpacity: 0.2,
		// elevation: 2,
		// position: 'relative',
		// marginBottom: 10,
		// marginTop: 5,
	},
	filterButton: {
		borderRadius: 30,
		margin: 5,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'transparent',
		width: '47%',
		height: 30,
		elevation: 8,
		flex: 1,
	},
	allDone: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
});

export default Home;
