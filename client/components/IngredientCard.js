import { View, Text, Pressable, ScrollView, Image } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function IngredientCard() {
    const tarifImage = require('../assets/gray.png');
    const addIcon=<Ionicons name="add-circle" size={50} color={colors.primary} />; 

    const handleImagePress = () => {
        console.log("Image Pressed!");
      };
  return (
    <View>
      <ScrollView>   
        <Text style={{fontSize:20, fontWeight:300,paddingStart:10, marginTop:10}}>Sebzeler</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{margin:10}}>
                <Pressable onPress={handleImagePress} >
                <Image source={tarifImage} style={{width:120, height:120, borderRadius:15}}/>
                <Text>Malzeme 1</Text>
                </Pressable>
            </View>
            <View style={{margin:10}}>
                <Pressable onPress={handleImagePress} >
                <Image source={tarifImage} style={{width:120, height:120, borderRadius:15}}/>
                <Text>Malzeme 1</Text>
                </Pressable>
            </View>
            <View style={{margin:10}}>
                <Pressable onPress={handleImagePress} >
                <Image source={tarifImage} style={{width:120, height:120, borderRadius:15}}/>
                <Text>Malzeme 1</Text>
                </Pressable>
            </View>
        </ScrollView>

      </ScrollView>
    </View>
  )
}