import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors } from '../theme/colors';

const Loading = ({ isLoading }) => {
  return ( 
    isLoading ? (
      <View style={styles.overlay}>
        <LottieView 
          source={require('../assets/animation.json')} 
          style={styles.animation}
          autoPlay 
          loop 
        /> 
      </View>
    ) : null
  );
};
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  animation: { width: 150, height: 150 },
});

export default Loading;
