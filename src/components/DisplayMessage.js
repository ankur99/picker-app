import * as React from 'react';
import {View, StyleSheet, Modal, Text, Pressable} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS, FONTS} from '../constants';

const DisplayMessage = (props) => {
	return (
		<Modal
			style={styles.container}
			animationType="slide"
			transparent={true}
			visible={props.modalVisible}
			onRequestClose={() => {
				props.setModalVisible();
			}}
		>
			<View style={styles.viewContainer}>
				<View style={styles.modalView}>
					<View
						style={{flexDirection: 'row', flex: 1, margin: 'auto', padding: 10}}
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
							{props.text}
						</Text>
					</View>
					<Pressable
						style={styles.btnContainer}
						onPress={() => props.setModalVisible()}
					>
						<Text style={{color: 'white', fontWeight: 'bold'}}>OK</Text>
					</Pressable>
				</View>
			</View>
		</Modal>
	);
};

export default DisplayMessage;

const styles = StyleSheet.create({
	viewContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(52, 52, 52, 0.8)',
	},
	modalView: {
		margin: 10,
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 25,
		alignItems: 'center',
		height: 200,
	},
	btnContainer: {
		width: 100,
		height: 30,
		margin: 10,
		borderRadius: 10,
		backgroundColor: COLORS.primary,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
