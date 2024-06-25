import { View, Text, StyleSheet, TextInput, SafeAreaView, ScrollView, Image, Pressable, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from './Loading';

export default function WpSearchPage({ navigation, route }) {
  const [userId, setUserId] = useState("");
  const checkIconEmpty=<AntDesign name="checkcircleo" size={20} color={colors.primary} />
  const checkIcon=<AntDesign name="checkcircle" size={20} color={colors.primary} />
  const defaultImage = require('../assets/gray.png');
  const [recipes, setRecipes] = useState([]);
  const [isAddedToPlan, setIsAddedToPlan] = useState({});
  const { selectedDate } = route.params;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log("Token:", token);
        if (!token) {
          console.log("Token not found");
          return;
        }
        const res = await axios.post("http://192.168.56.1:3030/userdata", { token: token });
        setUserId(res.data.data._id);
        console.log("userId",res.data.data._id);
      } catch (error) {
        console.error("Error getting user id:", error.message);
      }
    };
    getUserId();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchRecipes();
  }, []);

  useEffect(() => {
    setIsAddedToPlan({});
  }, [recipes]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 saniye
  
  
    return () => clearTimeout(timer);
  }, []);

  const toggleCheck = async (recipeId) => {
    try {
        const response = await axios.put(`http://192.168.56.1:3030/recipes/${recipeId}/addedToPlan`, { isAddedToPlan: !isAddedToPlan[recipeId] });
        setIsAddedToPlan({ ...isAddedToPlan, [recipeId]: !isAddedToPlan[recipeId] });
    } catch (error) {
        console.error('plana eklenme durumu güncelleme hatası:', error);
    } 
  };

  const fetchRecipes = async () => {
    try {
      setLoading(true); 
      const token = await AsyncStorage.getItem('token');
      /* const userRecipesResponse = await axios.get('http://192.168.56.1:3030/userRecipes', {
          headers: {
              Authorization: `Bearer ${token}`
          }
      });
      const userRecipes = userRecipesResponse.data.data; */

      const allRecipesResponse = await axios.get('http://192.168.56.1:3030/recipes', {
          headers: {
              Authorization: `Bearer ${token}`
          }
      });
      const allRecipes = allRecipesResponse.data.data;  
       
      const mergedRecipes = [ ...allRecipes.filter(recipe => recipe.isShared)];  
      const initialIsAddedToPlan = {};
      mergedRecipes.forEach((recipe, index) => {
        initialIsAddedToPlan[index] = recipe.isAddedToPlan;
      });
      setIsAddedToPlan(initialIsAddedToPlan);

      setRecipes(mergedRecipes);
    } catch (error) {
        console.error('Tarifleri alma hatası:', error);
    } finally {
      setLoading(false); 
    }
  }; 
  
  const handleGoMealPlanner = () => {
    navigation.navigate('MealPlanner'); 
  };

  const handleTextInputFocus = () => {
    navigation.navigate('WpSearchResultsPage', { searchQuery: '', selectedDate });
  };
  
  const addToWeeklyPlan = async () => {
    console.log("pressed")
    console.log(route.params);
    try { 
      const token = await AsyncStorage.getItem('token');
      console.log("Token:", token); 

      const selectedRecipeIds = Object.keys(isAddedToPlan).filter(recipeId => isAddedToPlan[recipeId]);
      console.log("Selected Recipe IDs:", selectedRecipeIds);

      const response = await axios.post('http://192.168.56.1:3030/weeklyPlan/addRecipeToPlan', {
        date: selectedDate,
        selectedRecipeIds: selectedRecipeIds
      }, { 
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Tarifler haftalık programa eklendi:", response.data); 
      handleGoMealPlanner();
    } catch (error) {
        console.error('Tarifleri haftalık programa eklerken bir hata oluştu:', error);
        Alert.alert("Hata", "Tarifleri haftalık programa eklerken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <>
      {loading ? (
          <View style={{alignItems:'center',marginTop:'90%', backgroundColor:colors.bg}}><Loading isLoading={loading}/></View>
        ) : (
      <>
      <ScrollView>
        <View style={styles.searchBar}>
          <AntDesign name="search1" size={24} color="#F26627" />
          <TextInput
              placeholder=" Ara.."
              placeholderTextColor={colors.primary}
              style={{ flex: 1 }}
              onFocus={handleTextInputFocus}
          />
        </View>
        <Text style={{marginTop:5, fontSize:20, fontWeight:"300", paddingStart:10, marginStart:10}}>Tarifler</Text>
        <View style={{ flexDirection:'row', justifyContent:'space-evenly'}}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', flexWrap: 'wrap'}}>
          {recipes.map((recipe, index) => (                 
            <View key={index} style={{marginTop:10}}>
                <Image source={recipe.recipeImage ? { uri: recipe.recipeImage } : defaultImage} style={{width:175, height:140, borderRadius:15}} />
                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                  <Text>{recipe.recipeName}</Text>
                  <TouchableOpacity style={{ marginEnd: 5 }} onPress={() => toggleCheck(recipe._id)}>
                    {isAddedToPlan[recipe._id] ? checkIcon : checkIconEmpty}
                  </TouchableOpacity>
                </View>
            </View>
          ))}
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.saveButton} onPress={addToWeeklyPlan}>
        <Text style={{color: "white"}}>Haftalık plana ekle</Text>
      </TouchableOpacity>
      </>
  )}
</>
    </SafeAreaView>
  )
}

const styles=StyleSheet.create({
    container:{ 
      flex:1,
      width:'100%',
      height:'100%',
      backgroundColor: colors.bg
    },
    searchBar:{
      flexDirection:'row', 
      width:'90%',
      height:50,
      alignSelf:"center",
      justifyContent:'flex-start',
      borderWidth:1, 
      marginTop: '10%', 
      margin:10, 
      padding:10,
      borderColor:colors.fg,
      backgroundColor:colors.fg,
      borderRadius:10,
    },
    saveButton: {
      alignSelf:"center",
      alignItems:"center",
      justifyContent:'center',
      width:"75%",
      height:40,
      marginBottom:10, 
      marginTop:5,
      borderRadius:20,
      borderWidth: 1,
      borderColor:colors.primary,
      backgroundColor:colors.primary,
    },
})