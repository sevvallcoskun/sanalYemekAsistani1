import { View, Text, TouchableOpacity, StyleSheet, } from 'react-native'
import React from 'react'
import { colors } from "../theme/colors";


export default function Button() {
  return (
    <View>
      <TouchableOpacity style={styles.button}>
         
      </TouchableOpacity>
    </View>
  )
}

const styles=StyleSheet.create({
  button:{
    width:"90%",
    height:40,
    alignItems:'center',
    justifyContent:'center',
    borderRadius:20,
    borderWidth: 1,
    borderColor:colors.primary,
    backgroundColor:colors.primary,
    marginBottom:10, 
  },
})