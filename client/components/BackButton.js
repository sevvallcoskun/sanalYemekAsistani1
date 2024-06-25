import React from 'react';
import { TouchableOpacity, Platform, StyleSheet, View } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

const BackButton = () => {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.goBack();
  };

  return (
    <View>
      <TouchableOpacity onPress={handlePress}>
        <Ionicons
          name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'arrow-back'}
          size={30}
          color={colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

export default BackButton;
