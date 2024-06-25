import { View, Text, StyleSheet, TouchableOpacity,Image } from 'react-native';
import React, { useState } from 'react';
import { colors } from '../theme/colors';
import LottieView from 'lottie-react-native';
import { Entypo } from '@expo/vector-icons';
import axios from 'axios'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Rating({ route, navigation }) {
  const { recipeId } = route.params;
  const emptyStar = <Entypo name="star-outlined" size={40} color="#FFCF64" />;
  const filledStar = <Entypo name="star" size={40} color="#FFCF64" />;
  const [rating, setRating] = useState(0);

  const handleRating = (newRating) => {
    setRating(newRating);
  }; 

  const saveRating = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log("Token not found");
        return;
      }
      const res = await axios.post("http://192.168.56.1:3030/userdata", { 
        token: token,
      });
      if (res.data.status === "ok") {
        const userId = res.data.data._id;
        const ratingData = {
          recipeId: recipeId,
          rating: rating,
          userId: userId
        };
        console.log("ratingData", ratingData)
  
        try {
          // Try to get existing rating
          const existingRatingResponse = await axios.get(`http://192.168.56.1:3030/recipes/${recipeId}/rating/${userId}`);
          if (existingRatingResponse.data.status === "ok") {
            console.log("if");
            const existingRatingId = existingRatingResponse.data.data._id;
            await axios.put(`http://192.168.56.1:3030/recipes/${recipeId}/rating/${existingRatingId}`, ratingData, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            console.log('Rating updated successfully');
          }
        } catch (getError) {
          if (getError.response && getError.response.status === 404) {
            // If no existing rating, create a new one
            console.log("else");
            const response = await axios.post(`http://192.168.56.1:3030/recipes/${recipeId}/rate`, ratingData, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            console.log("response", response); 
            console.log('New rating created successfully');
          } else {
            // Handle other errors
            console.error('Error checking existing rating:', getError);
          }
        }
  
        console.log("Gönderilen İstek:", ratingData);
        await AsyncStorage.setItem('ratingData', JSON.stringify(ratingData));
        console.log('Rating sent successfully');
        setRating(0);
        navigation.navigate('Main');
      }
    } catch (error) {
      console.error('Error sending rating:', error);
    }
  };
  
  

  const renderStars = () => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity key={i} onPress={() => handleRating(i)}>
          {i <= rating ? filledStar : emptyStar}
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
            <Image source={require('../assets/woman.png')} style={styles.images} />

      <View style={styles.ratingContainer}>
        {renderStars()}
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveRating}>
        <Text style={styles.buttonText}>Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg
  },
  overlay: {
    flex:0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  images:{
    height:250,
    width:250
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  saveButton: {
    width: '80%',
    height: 45,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.secondary,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16
  },
  animation: { width: 150, height: 150 },
});
