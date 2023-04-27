import React, {useState, useEffect} from 'react';
import {
	Text,
	View,
	StyleSheet,
	Modal,
	Pressable,
	ActivityIndicator,
	TextInput,
	Alert,
} from 'react-native';
import {COLORS, FONTS} from '../constants';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as CommonUtils from '../utils/CommonUtils';
import * as API from '../utils/NewRestServices';

const SkipModal = (props) => {
	const [skipConfirmed, setskipConfirmed] = useState(false);
	const [skipReasons, setSkipReasons] = useState(null);
	const [skipping, setSkippingItems] = useState(false);
	let skipData = [];

	useEffect(() => {
		getReasons();
	}, []);

	const getReasons = async () => {
		setSkipReasons({
			damaged: 'damaged',
			expired: 'expired',
			not_found: 'not_found',
		});
		AsyncStorage.setItem(
			'SKIP_REASONS',
			JSON.stringify({
				damaged: 'damaged',
				expired: 'expired',
				not_found: 'not_found',
			}),
		);
	};

	const renderLabels = () => {
		let labels = [];
		if (skipReasons != null && skipReasons != undefined) {
			Object.entries(skipReasons).map(([Index, Value]) => {
				labels = [...labels, <Text key={Index}>{Value}</Text>];
			});
		}
		return labels;
	};

	const renderSkipInputs = () => {
		let labels = [];
		if (skipReasons != null && skipReasons != undefined) {
			Object.entries(skipReasons).map(([Index, Value]) => {
				labels = [
					...labels,
					<TextInput
						key={Index}
						defaultValue="0"
						numeric
						keyboardType={'number-pad'}
						onChangeText={(value) => {
							let data;
							if (skipData.length === 0) {
								data = [];
							} else {
								data = [...skipData];
							}

							if (data.findIndex((obj) => obj.reason == Value) === -1) {
								data.push({
									reason: Value,
									quantity: parseInt(value) || 0,
								});
							} else {
								data[data.findIndex((obj) => obj.reason == Value)] = {
									reason: Value,
									quantity: parseInt(value) || 0,
								};
							}
							skipData = data;
						}}
						style={styles.inputStyle}
					/>,
				];
			});
		}
		return labels;
	};

	const submitSkipItems = async () => {
		let skipItemSum = 0;

		for (let i = 0; i < skipData.length; i++) {
			if (skipData[i].quantity < 0) {
				Alert.alert('Alert!', 'Negative numbers not allowed', [{text: 'OK'}]);
				return;
			}
		}
		skipData.map((value) => {
			skipItemSum = value.quantity + skipItemSum;
		});
		console.log('props.product', props.product);
		if (skipItemSum == props.quantity) {
			setSkippingItems(true);
			await API.skipItems(
				props.pickList.id,
				props.product.product_id,
				props.product.storage_id,
				skipData,
			)
				.then(() => {
					setSkippingItems(false);
					CommonUtils.showMessage('success', 'items skipped 👍', '', true);
					props.gotoSkippedItems();
				})
				.catch((err) => {
					console.log('err on Skip', err);
					setSkippingItems(false);
					CommonUtils.showMessage('error', 'could not process!', '', true);
				});
			props.setModalVisible(!props.modalVisible);
		} else {
			Alert.alert(
				'Alert!',
				'Total sum of skipped items should be  equal to ' + props.quantity,
				[{text: 'OK'}],
			);
		}
	};
	return (
		<View style={{flex: 1}}>
			<Modal
				animationType="slide"
				transparent={true}
				visible={props.modalVisible}
				onRequestClose={() => {
					props.setModalVisible(!props.modalVisible);
				}}
			>
				<View
					style={{
						flex: 1,
						justifyContent: 'center',
						backgroundColor: 'rgba(52, 52, 52, 0.8)',
					}}
				>
					<View style={styles.modalView}>
						{!skipConfirmed && (
							<View style={{alignItems: 'center'}}>
								<Text style={{...FONTS.h3, fontWeight: 'bold'}}>
									Are you sure you want to Skip {props.quantity} Items ?
								</Text>
								<View
									style={{
										flexDirection: 'row',
										justifyContent: 'space-between',
									}}
								>
									<Pressable
										style={{...styles.button, backgroundColor: COLORS.primary}}
										onPress={() => setskipConfirmed(true)}
									>
										<Text style={{color: 'white', fontWeight: 'bold'}}>
											Yes
										</Text>
									</Pressable>

									<Pressable
										style={{...styles.button, ...styles.btnSecondary}}
										onPress={() => props.setModalVisible(!props.modalVisible)}
									>
										<Text style={{color: COLORS.primary, fontWeight: 'bold'}}>
											No
										</Text>
									</Pressable>
								</View>
							</View>
						)}
						{skipConfirmed && (
							<View>
								<View style={{alignItems: 'center'}}>
									<Text style={{...FONTS.h3, fontWeight: 'bold'}}>
										Why do you want to skip {props.quantity} items ?
									</Text>
								</View>

								<View style={{marginTop: 10}}>
									<View
										style={{
											flexDirection: 'row',
											justifyContent: 'space-between',
										}}
									>
										<View style={{flex: 2, justifyContent: 'space-around'}}>
											{renderLabels()}
										</View>

										<View style={{flex: 1}}>{renderSkipInputs()}</View>
									</View>
								</View>

								<View
									style={{
										flexDirection: 'row',
										justifyContent: 'space-between',
									}}
								>
									<Pressable
										disabled={skipping}
										style={{...styles.button, backgroundColor: COLORS.primary}}
										onPress={() => submitSkipItems()}
									>
										<Text style={{color: 'white', fontWeight: 'bold'}}>
											Submit
										</Text>
									</Pressable>

									<Pressable
										style={{...styles.button, ...styles.btnSecondary}}
										onPress={() => {
											setskipConfirmed(false);
											props.setModalVisible(!props.modalVisible);
										}}
									>
										<Text style={{color: COLORS.primary, fontWeight: 'bold'}}>
											Cancel
										</Text>
									</Pressable>
								</View>
							</View>
						)}

						{props.updating && (
							<ActivityIndicator size="large" color={COLORS.primary} />
						)}
					</View>
				</View>
			</Modal>
		</View>
	);
};

export default SkipModal;

const styles = StyleSheet.create({
	modalView: {
		margin: 10,
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 25,
		alignItems: 'center',
	},
	button: {
		borderRadius: 2,
		paddingHorizontal: 20,
		paddingVertical: 10,
		elevation: 2,
		width: 100,
		margin: 20,
		alignItems: 'center',
	},
	btnSecondary: {
		backgroundColor: COLORS.white,
		borderWidth: 1,
		borderColor: COLORS.primary,
	},
	inputStyle: {
		elevation: 1,
		paddingLeft: 20,
		height: 50,
		color: 'black',
	},
});
