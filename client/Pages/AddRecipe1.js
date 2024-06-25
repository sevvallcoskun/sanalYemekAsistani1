import { View, Text, TextInput, StyleSheet, Pressable, Image, Alert, TouchableOpacity } from 'react-native'
import React, { useState } from 'react' 
import { colors } from "../theme/colors";
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons} from '@expo/vector-icons';
import BackButton from '../components/BackButton';
import * as ImagePicker from 'expo-image-picker';
import axios from  'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddRecipe1({ navigation }) {
  const [recipeName, setRecipeName] = useState("");
  const progressBar=<Progress.Bar progress={0.3} width={300} color={colors.primary} />
  const forwardIcon=<Ionicons name="arrow-forward" size={50} color={colors.primary} />
  const [recipeImage, setRecipeImage] = useState('');

  const handleNext = async() => {
    if (!recipeName.trim()) {
      Alert.alert("Hata", "Lütfen bir tarif adı girin.");
      return;
    }

    if (!recipeImage) {
      Alert.alert("Hata", "Lütfen bir fotoğraf seçin.");
      return;
    }

    try {
      navigation.navigate('AddRecipe2', { recipeName, recipeImage: recipeImage });
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert("Hata", "Fotoğraf yükleme sırasında bir hata oluştu.");
    }
  };   

  const handleImagePick = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Permission Result:", permissionResult);
      if (permissionResult.granted === false) {
        Alert.alert('İzin Hatası', 'Galeriye erişim izni gereklidir!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      }); 
      console.log("Result:", result);

      if (!result.cancelled) {
        // İlk fotoğrafın uri'sine erişmek için:
        const selectedImageUri = result.assets[0].uri;
        console.log("Selected Image URI:", selectedImageUri);
        setRecipeImage(selectedImageUri);
      } else {
        console.log("Kullanıcı seçim yapmadı veya seçimi iptal etti.");
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
      <View style={{ marginTop:'3%', flexDirection:'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ marginRight: 10 }}>
            <BackButton/>
          </View> 
          <View >
            {progressBar}
          </View> 
        </View>
        <Text style={{fontSize:20, paddingTop:20, marginBottom:10}}>Bir tarif oluşturun</Text>
        <TextInput
          style={styles.input}
          placeholder="Tarif adı"
          placeholderTextColor={colors.primary}
          value={recipeName}
          onChangeText={setRecipeName}
        />
        <View style={styles.imageContainer}>
          <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: "space-around" }}>
            <TouchableOpacity onPress={handleImagePick}>
              <View style={{ flexDirection: 'row'}}>
                <Image source={require('../assets/addPhoto.png')} style={styles.addPhoto} />
                {recipeImage && (
                  <Image source={{ uri: recipeImage }} style={{ width: 100, height: 100 }} />
                )}
              </View>
            </TouchableOpacity>
            <Text style={{ fontSize: 20, color: colors.primary, height: 150, width: 120, alignItems: "center" }}>Tarifiniz için bir fotoğraf ekleyin</Text>
          </View>
        </View>
      </View>
      <Pressable style={styles.forwardButton} onPress={handleNext}>
        {forwardIcon}
      </Pressable>
    </SafeAreaView>
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
    input:{
      height:45,
      justifyContent:'center',
      alignItems:'center',
      paddingLeft: 10,
      marginBottom:20,
      borderWidth: 1,
      borderColor:colors.bg,
      backgroundColor:colors.fg
    },
    imageContainer:{
      height:400,
      justifyContent:'center',
      alignItems:'center',
      borderColor:colors.fg,
      backgroundColor:colors.fg
    },
    addPhoto: {
      width: 96, 
      height: 96,
    },
    forwardButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
    }

})
