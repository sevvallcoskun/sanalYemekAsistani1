import { View, Text, StyleSheet, Pressable } from 'react-native'
import React, { useState } from 'react'
import { colors } from "../theme/colors";
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Progress from 'react-native-progress';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import BackButton from '../components/BackButton';
import axios from  'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddRecipe2({ navigation, route }) {
  const progressBar=<Progress.Bar progress={0.6} width={300} color={colors.primary}/>
  const forwardIcon=<Ionicons name="arrow-forward" size={50} color={colors.primary} />
  const formatTime = (hours, minutes) => {
    if (hours > 0) {
      return `${hours} saat ${minutes} dakika`;
    } else {
      return `${minutes} dakika`;
    }
  };

  const [servicesCount, setServicesCount] = useState(0);
  const serviscesCountOptions = Array.from({ length: 21 }, (_, i) => ({ label: `${i} servis`, value: i }));
  const [cookingTime, setCookingTime] = useState(0);
  const cookingTimeOptions = Array.from({ length: 200 }, (_, i) => {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;
    return {
      label: `${formatTime(hours, minutes)}`, 
      value: i
    };
  });

  const [preparationTime, setPreparationTime] = useState(0);
  const preparationTimeOptions = Array.from({ length: 200 }, (_, i) => {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;
    return {
      label: `${formatTime(hours, minutes)}`, 
      value: i
    };
  });

  const handleNext = () => {
    navigation.navigate('AddRecipe3', {
      recipeName: route.params.recipeName,
      recipeImage: route.params.recipeImage,
      servicesCount: servicesCount,
      cookingTime: cookingTime,
      preparationTime: preparationTime,
    }); 
    console.log("preparationTime:", preparationTime);
    console.log("cookingTime:", cookingTime);
    console.log("servicesCount:", servicesCount);
    console.log("recipeName", route.params.recipeName);
    console.log("recşmageurl", route.params.recipeImage);
  };
  
  return (
    <View style={styles.container}>
    <SafeAreaView style={styles.container}>
    <View style={{ marginTop:'3%', flexDirection:'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ marginRight: 10 }}>
            <BackButton/>
          </View>
          <View >
            {progressBar}
          </View> 
        </View>
      <View style={styles.card}>
        <View style={{flexDirection:'row' }}>
            <View style={{flexDirection:'column'}}>
                <Text style={{fontSize:16, fontWeight:500}}>SERVİS SAYISI</Text>
                <Text style={{fontSize:16, fontWeight:300, width:150}}>Kaç kişilik bir tarif yapıyorsun?</Text>
            </View>
            <View style={{ flex: 1, paddingTop:20 }}>
            <RNPickerSelect
              onValueChange={(value) => setServicesCount(value)}
              items={serviscesCountOptions}
              value={servicesCount}
              style={pickerSelectStyles}
              Icon={() => null}
            />
          </View> 
        </View>
        <View style={{flexDirection:'row', paddingTop:20 }}>
            <View style={{flexDirection:'column'}}>
                <Text style={{fontSize:16, fontWeight:500}}>HAZIRLAMA SÜRESİ</Text>
                <Text style={{fontSize:16, fontWeight:300, width:150}}>Bu tarife hazırlık için kaç dakika harcıyorsun?</Text>
            </View>
            <View style={{ flex: 1,  }}>
            <RNPickerSelect
              onValueChange={(value) => setPreparationTime(value)}
              items={preparationTimeOptions} 
              value={preparationTime}
              style={pickerSelectStyles}
              Icon={() => null}
            />
          </View> 
        </View>
        <View style={{flexDirection:'row',paddingTop:20}}>
            <View style={{flexDirection:'column'}}>
                <Text style={{fontSize:16, fontWeight:500}}>PİŞİRME SÜRESİ</Text>
                <Text style={{fontSize:16, fontWeight:300, width:150}}>Pişirme süresi kaç dakika?</Text>
            </View>
            <View style={{ flex: 1,  }}>
            <RNPickerSelect
              onValueChange={(value) => setCookingTime(value)}
              items={cookingTimeOptions}
              value={cookingTime}
              style={pickerSelectStyles}
              Icon={() => null}
              modalProps={{
                animationType: "slide", // Seçeneklerin alttan yukarı doğru kayması için animasyon türü
                transparent: true, // Arka planın saydam olması
                statusBarTranslucent: true, // Durum çubuğunun içerik üzerine bindirilmesi
              }} 

            />
          </View> 
        </View>
        
      </View>
      
    </SafeAreaView>
    <Pressable style={styles.forwardButton} onPress={handleNext}>
        {forwardIcon}
      </Pressable>
    </View>
  )
}

const styles=StyleSheet.create({
    container:{
      flex:1,
      width:'100%',
      height:'100%',
      alignItems:'center',
      backgroundColor: colors.bg
    },
    card:{
        paddingTop:20,
        marginHorizontal:20,
        alignItems:'flex-start',
        justifyContent:'flex-start'
    },
    forwardButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
    }

})

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
  },
  inputAndroid: {
    fontSize: 16,
    fontWeight:500,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 10, // to ensure the text is never behind the icon
  },
  
});