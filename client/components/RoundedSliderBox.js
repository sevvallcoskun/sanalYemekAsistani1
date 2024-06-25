import { View, Text, ScrollView, StyleSheet, Image, Pressable } from 'react-native'
import React from 'react'

export default function RoundedSliderBox({ categoryName, categoryImage, onPress }) {
  const defaultImage = require('../assets/allrecipes.png');
  const handleImagePress = () => {
    onPress();
  };
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{margin:10}}>
          <Pressable onPress={handleImagePress} >
            <Image source={categoryImage ? { uri: categoryImage } : defaultImage} style={{width:75, height:75, borderRadius:45}}></Image>
            <Text>{categoryName}</Text>
          </Pressable>
        </View> 
      </ScrollView>
    </View>
  )
}
