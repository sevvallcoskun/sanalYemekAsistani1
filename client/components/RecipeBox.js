import { View, Text, Image, Pressable, TouchableOpacity } from 'react-native'
import React from 'react'
import { FontAwesome6 } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function RecipeBox({ recipeName, recipeImage, onPress, onDeletePress, showTrashIcon }) {
  const defaultImage = require('../assets/gray.png');
  
  const handlePress = () => {
    if (onPress) {
      onPress(); 
    }
  };

  const handleDeletePress = () => {
    if (onDeletePress) {
      onDeletePress(); 
    }
  }

    return (
      <View>   
        <View style={{margin:10}}>  
          <Pressable onPress={handlePress}>
          <Image source={recipeImage ? { uri: recipeImage } : defaultImage} style={{ width: '100%', height: 150, borderRadius: 20 }} />
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
              <Text>{recipeName}</Text>
              {showTrashIcon && ( 
                <TouchableOpacity onPress={onDeletePress}>
                  <FontAwesome6 name="trash-can" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
          
        </View>
      </View>
    )
}
