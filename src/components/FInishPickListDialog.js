import React, {useRef, useState} from 'react';
import {
	Text,
	View,
	StyleSheet,
	Modal,
	Pressable,
	ActivityIndicator,
} from 'react-native';
import {COLORS, FONTS} from '../constants';
import {TextInput} from 'react-native-gesture-handler';

const FinishPickListDialog = (props) => {
	const [internalValue, setInternalValue] = useState(null);

	const handleButtonPress = () => {
		// props.setModalVisible(!props.modalVisible);
		props.handleButtonPress(internalValue);
	};
	// const handleButtonPress2 = () => {
	// 	props.setModalVisible(!props.modalVisible);
	// 	props.handleButtonPress2();
	// };
	let textInput = useRef();
	const onChangeText = async (val) => {
		setInternalValue(val);
	};

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={props.modalVisible}
			onRequestClose={() => {
				props.setModalVisible(!props.modalVisible);
			}}
		>
			<View style={{flex: 1}}>
				<View style={styles.modalView}>
					<View style={styles.modalContainer}>
						<Text style={{textAlign: 'center', ...FONTS.body2}}>
							{props.message}
						</Text>
						<TextInput
							placeholder="Please Scan Billing Desk"
							disabled={internalValue}
							clearButtonMode="always"
							ref={textInput}
							style={styles.locationInput}
							value={internalValue}
							onChangeText={onChangeText}
							returnKeyType="done"
							keyboardType={'ascii-capable'}
							autoFocus={true}
						/>
						<View
							style={{
								flexDirection: 'row',
								width: '100%',
								justifyContent: 'center',
								alignItems: 'center',
							}}
						>
							{internalValue && (
								<Pressable
									disabled={props.finishing}
									onPress={handleButtonPress}
									// style={{
									// 	borderWidth: 1,
									// }}
								>
									<Text style={{...styles.button, ...FONTS.body3}}>
										{props.buttonTitle1}
										{props.finishing && <ActivityIndicator />}
									</Text>
								</Pressable>
							)}
							{/* <Pressable onPress={handleButtonPress2}>
								<Text
									style={{
										...styles.button2,
										...FONTS.body3,
										color: COLORS.primary,
									}}
								>
									{props.buttonTitle2}
								</Text>
							</Pressable> */}
						</View>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default FinishPickListDialog;

const styles = StyleSheet.create({
	modalView: {
		// height: SIZES.height / 2,
		// marginTop: SIZES.height / 2,
		backgroundColor: 'white',
		borderRadius: 20,
		alignItems: 'center',
		flex: 1,
	},
	button: {
		padding: 10,
		elevation: 2,
		// margin: 20,
		backgroundColor: COLORS.primary,
		color: 'white',
	},
	button2: {
		padding: 10,
		elevation: 2,
		// margin: 20,
		alignItems: 'center',
		backgroundColor: COLORS.white,
	},

	modalContainer: {
		backgroundColor: COLORS.white,

		paddingHorizontal: 20,
		paddingVertical: 10,
		justifyContent: 'center',
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
