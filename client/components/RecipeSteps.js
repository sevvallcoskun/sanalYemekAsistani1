import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Image, TouchableOpacity, Modal } from 'react-native'
import React from 'react'
import { colors } from '../theme/colors';


export default function RecipeSteps({ step }) {
    return (
        <View style={styles.container}>
            {/* <Text style={styles.stepText}>Adım {step.index}</Text> */}
            <Text style={styles.stepText}>{step.description}</Text>
        </View>
    );
}


const styles=StyleSheet.create({
    container: {
      flex:1,
      width:'100%',
      height:'100%',
      alignItems:'center',
      justifyContent:'center',
      backgroundColor: colors.bg,
      marginTop:'10%'
    },
    stepText: {
        fontSize: 26,
        marginHorizontal:15,
        
    }
})