import React, {useState} from 'react';
import {Modal, Pressable} from 'react-native';
import {PickProductSheet} from '.';

const PickModal = (props) => {
	const [hide, setHide] = useState(false);

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={hide ? false : props.modalVisible}
			onRequestClose={() => {
				props.setModalVisible(!props.modalVisible);
			}}
		>
			<Pressable
				style={{
					flex: 1,
					justifyContent: 'flex-end',
					backgroundColor: 'rgba(52, 52, 52, 0.8)',
					paddingTop: 10,
				}}
				onPressOut={() => props.setModalVisible(!props.modalVisible)}
			>
				<PickProductSheet
					product={props.product}
					pickList={props.pickList}
					setModalVisible={props.setModalVisible}
					// onProcessed={props.onProcessed}
					hide={() => {
						setHide((preState) => (preState = !preState));
					}}
				/>
			</Pressable>
		</Modal>
	);
};

export default PickModal;
