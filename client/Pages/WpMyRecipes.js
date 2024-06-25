import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { colors } from '../theme/colors';
import RoundedSliderBox from '../components/RoundedSliderBox';
import RecipeBox from '../components/RecipeBox';
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from './Loading';
 
const trash=<FontAwesome6 name="trash-can" size={24} color="black" />
const addIcon=<Ionicons name="add-circle" size={50} color={colors.primary} />; 
const Tab = createMaterialTopTabNavigator();
const checkIconEmpty=<AntDesign name="checkcircleo" size={20} color={colors.primary} />;
const checkIcon=<AntDesign name="checkcircle" size={20} color={colors.primary} />

function MyRecipeBookScreen({ navigation, route }) {
  const [isAddedToPlan, setIsAddedToPlan] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [userId, setUserId] = useState("");
  const { selectedDate } = route.params;
  const [loading, setLoading] = useState(false);

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
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.56.1:3030/userRecipes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("my:",response.data); 
      const initialIsAddedToPlan = {};
          response.data.data.forEach(recipe => {
            initialIsAddedToPlan[recipe._id] = recipe.isAddedToPlan;
          });
          setIsAddedToPlan(initialIsAddedToPlan);
          setRecipes(response.data.data);
    } catch (error) {
      console.error('Tarifleri alma hatası:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoMealPlanner = () => {
    navigation.navigate('MealPlanner');
  };

  const addToWeeklyPlan = async () => {
    console.log("pressed");
    console.log("route",route.params);
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
    }  
  };

  const handleRecipePress = (recipeId, recipeName, recipeImage, category, ingredients, steps, servicesCount, cookingTime, preparationTime) => {
    navigation.navigate(
      'RecipeDetails', 
      { 
        recipeId: recipeId, 
        recipeName: recipeName,
        recipeImage: recipeImage,
        category: category,
        ingredients: ingredients,
        steps: steps,
        servicesCount: servicesCount,
        cookingTime: cookingTime,
        preparationTime: preparationTime
      });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Loading isLoading={loading} />
      ) : (
        <View style={styles.container}>
          <ScrollView>
            {/* <RoundedSliderBox/> */}
            {recipes.map(recipe => (
              <Pressable key={recipe._id} onPress={() => 
                handleRecipePress(
                  recipe._id, 
                  recipe.recipeName, 
                  recipe.recipeImage,
                  recipe.category,
                  recipe.ingredients,
                  recipe.steps,
                  recipe.servicesCount,
                  recipe.cookingTime,
                  recipe.preparationTime
                )}>
                <RecipeBox recipeName={recipe.recipeName} recipeImage={recipe.recipeImage} />
                <TouchableOpacity style={styles.checkIcon} onPress={() => toggleCheck(recipe._id)}>
                  {isAddedToPlan[recipe._id] ? checkIcon : checkIconEmpty}
                </TouchableOpacity>
              </Pressable>        
            ))} 
          </ScrollView>
        <TouchableOpacity style={styles.saveButton} onPress={addToWeeklyPlan}>
          <Text style={{color: "white"}}>Haftalık plana ekle</Text>
        </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function LikedRecipesScreen({ navigation, route }) {
  const [isAddedToPlan, setIsAddedToPlan] = useState({});
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false); 
  const { selectedDate } = route.params;

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
    fetchFavoriteRecipes();
  }, []);

  useEffect(() => {
    console.log("favoriteRecipes:", favoriteRecipes);
  }, [favoriteRecipes]);

  useEffect(() => {
    setIsAddedToPlan({});
  }, [favoriteRecipes]);

  const toggleCheck = async (recipeId) => {
    try {
        const response = await axios.put(`http://192.168.56.1:3030/recipes/${recipeId}/addedToPlan`, { isAddedToPlan: !isAddedToPlan[recipeId] });
        setIsAddedToPlan({ ...isAddedToPlan, [recipeId]: !isAddedToPlan[recipeId] });
    } catch (error) {
        console.error('plana eklenme durumu güncelleme hatası:', error);
    }
  };

  const fetchFavoriteRecipes = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.56.1:3030/userFavorites/favoriteRecipes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFavoriteRecipes(response.data.favoriteRecipes);
    } catch (error) {
      console.error('favori tarifleri alma hatası:', error);
    } finally {
      setLoading(false);
    }
  }; 

  const addToWeeklyPlan = async () => {
    console.log("pressed");
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
      navigation.goBack();  // Instead of navigation.navigate
    } catch (error) {
      console.error('Tarifleri haftalık programa eklerken bir hata oluştu:', error);
      Alert.alert("Hata", "Tarifleri haftalık programa eklerken bir hata oluştu.");
    }  
  };

  const handleRecipePress = (recipeId, recipeName, recipeImage, category, ingredients, steps, servicesCount, cookingTime, preparationTime) => {
    navigation.navigate(
      'RecipeDetails', 
      { 
        recipeId: recipeId, 
        recipeName: recipeName,
        recipeImage: recipeImage,
        category: category,
        ingredients: ingredients,
        steps: steps,
        servicesCount: servicesCount,
        cookingTime: cookingTime,
        preparationTime: preparationTime
      });
  };

  return ( 
    <View style={styles.container}>
      {loading ? (
        <Loading isLoading={loading} />
      ) : (
        <View style={styles.container}>
          <ScrollView>
            {favoriteRecipes.length === 0 ? (
              <Text style={styles.noRecipeText}>Beğenilen tarif bulunamadı.</Text>
            ) : (
              favoriteRecipes.map((recipe, index) => (
                <Pressable key={recipe._id} onPress={() => 
                  handleRecipePress( 
                    recipe._id, 
                    recipe.recipeName, 
                    recipe.recipeImage,
                    recipe.category,
                    recipe.ingredients,
                    recipe.steps,
                    recipe.servicesCount,
                    recipe.cookingTime,
                    recipe.preparationTime
                  )}>
                  <RecipeBox recipeName={recipe.recipeName} recipeImage={recipe.recipeImage}/>
                  <TouchableOpacity style={styles.checkIcon} onPress={() => toggleCheck(recipe._id)}>
                    {isAddedToPlan[recipe._id] ? checkIcon : checkIconEmpty}
                  </TouchableOpacity>
                </Pressable>  
              ))
            )}
          </ScrollView>
          <TouchableOpacity style={styles.saveButton} onPress={addToWeeklyPlan}>
            <Text style={{color: "white"}}>Haftalık plana ekle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}


export default function WpMyRecipes({ navigation, route }) {
  const { selectedDate } = route.params;
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold', marginTop:'5%' },
        tabBarStyle: { backgroundColor: colors.bg},
        tabBarIndicatorStyle: { backgroundColor: colors.primary },
      }} 
    >
      <Tab.Screen name="Tarif Defterim">
        {() => <MyRecipeBookScreen route={route} navigation={navigation} />}
      </Tab.Screen>
      <Tab.Screen name="Beğendiklerim">
        {() => <LikedRecipesScreen route={route} navigation={navigation} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles=StyleSheet.create({
  container:{ 
    flex:1,
    width:'100%',
    height:'100%',
    backgroundColor: colors.bg
  },
  checkIcon: { 
    marginEnd: 5, 
    position: 'absolute',  
    zIndex: 1 ,
    bottom: '4%',
    right: '2%',
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