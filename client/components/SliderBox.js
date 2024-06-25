import { View, Text, ScrollView, ImageBackground, TouchableOpacity, StyleSheet, Pressable, Image } from 'react-native'
import React from 'react'
import { FontAwesome6 } from '@expo/vector-icons';
import { colors } from '../theme/colors';


export default function SliderBox({ recipeName, recipeImage, onPress, showTrashIcon, onDeletePress }) {
  const defaultImage = require('../assets/gray.png');
   
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.secondCont}> 
          <View> 
            <Pressable onPress={onPress}> 
              <Image source={recipeImage ? { uri: recipeImage } : defaultImage} style={styles.imageBackground} />
              {showTrashIcon && (
                <TouchableOpacity onPress={onDeletePress} style={styles.trashButton}>
                  <FontAwesome6 name="trash-can" size={20} color="red" />
                </TouchableOpacity> 
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles=StyleSheet.create({
secondCont:{
    width: '100%', 
    marginTop:5,
    justifyContent:'flex-start',
    paddingHorizontal: 10,
  },
  imageBackground: {
    aspectRatio: 5 / 6,
    height: 170,
    marginRight: 10,
    borderRadius: 6,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  trashButton: {
    alignItems:'center',
    justifyContent:'center',
    height:40,
    width:40,
    position: 'absolute',
    backgroundColor: colors.fg,
    borderRadius: 25,
    top: '2%',
    right: '9%',
    zIndex: 1,
},
})
