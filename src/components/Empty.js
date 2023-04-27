import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {COLORS} from '../constants';

const Empty = () => {
	return (
		<View style={{...styles.container}}>
			<FontAwesome5 name="inbox" size={60} color={COLORS.lightGray} solid />
			<Text style={{color: COLORS.lightGray}}>Nothing to see here..</Text>
		</View>
	);
};

export default Empty;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
