import React from 'react';
import {View, StyleSheet, Image, Modal, Pressable} from 'react-native';
import {COLORS} from '../constants';

const PickModal = (props) => {
	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={props.modalVisible}
			onRequestClose={() => {
				props.setModalVisible(!props.modalVisible);
			}}
		>
			<Pressable
				onPressOut={() => props.setModalVisible(!props.modalVisible)}
				style={{
					flex: 1,
					justifyContent: 'center',
					backgroundColor: 'rgba(52, 52, 52, 0.8)',
				}}
			>
				<View style={{width: '75%', height: '75%', margin: '12%'}}>
					<Image
						source={{uri: props.image}}
						style={styles.imageContainer}
						resizeMode="contain"
					/>
				</View>
			</Pressable>
		</Modal>
	);
};

export default PickModal;

const styles = StyleSheet.create({
	imageContainer: {
		backgroundColor: COLORS.BgImage,
		flex: 1,
	},
});
