import React from 'react';
import {Text, View, StyleSheet, Modal, Pressable} from 'react-native';
import {COLORS, SIZES, FONTS} from '../constants';
import {TextInput} from 'react-native-gesture-handler';

const Error = (props) => {
	const handleButtonPress = () => {
		props.setShowError(!props.modalVisible);
		props.handleButtonPress();
	};

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={props.modalVisible}
			onRequestClose={() => {
				props.setShowError(!props.modalVisible);
			}}
		>
			<View style={{flex: 1}}>
				<View style={styles.modalView}>
					<View style={styles.modalContainer}>
						<Text style={{textAlign: 'center', ...FONTS.body2}}>
							{props.errorMsg}
						</Text>
						<Pressable onPress={handleButtonPress}>
							<Text style={{...styles.button, ...FONTS.body3}}>
								{props.buttonTitle}
							</Text>
							<TextInput />
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default Error;

const styles = StyleSheet.create({
	modalView: {
		height: SIZES.height / 2,
		marginTop: SIZES.height / 2,
		backgroundColor: 'white',
		borderRadius: 20,
		alignItems: 'center',
		flex: 1,
	},
	button: {
		borderRadius: 10,
		padding: 10,
		elevation: 2,
		margin: 20,
		alignItems: 'center',
		backgroundColor: COLORS.primary,
	},

	modalContainer: {
		backgroundColor: COLORS.white,

		paddingHorizontal: 20,
		paddingVertical: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
