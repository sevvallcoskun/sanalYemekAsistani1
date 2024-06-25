import { View, Text, ScrollView, StyleSheet, Image, Pressable } from 'react-native'
import React from 'react'

export default function RoundedBox({content}) {
  const tarifImage = require('../assets/gray.png');
  return (
    <View>
        <View style={{margin:10, flexDirection:'row',}}>
            <Image source={tarifImage} style={{width:75, height:75, borderRadius:45}}></Image>
            <Text>{content}</Text>
        </View>
    </View>
  )
}