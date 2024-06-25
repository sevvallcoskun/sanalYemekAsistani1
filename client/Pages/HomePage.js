import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SliderBox from '../components/SliderBox';
import moment from 'moment';
import 'moment/locale/tr';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from './Loading';
import { colors } from '../theme/colors';

export default function HomePage({ navigation }) {
  const currentDate = moment();
  const formattedDate = currentDate.format("DD.MM.YYYY");
  const startOfWeek = currentDate.clone().startOf('week');
  const [date, setDate] = useState('');
  const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf('week'));
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState("");
  const [highestRatedRecipes, setHighestRatedRecipes] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [surveyCategories, setSurveyCategories] = useState([]);
  const [categoryRecipes, setCategoryRecipes] = useState({});
  
  moment.locale('tr');

  useEffect(() => {
    async function fetchData() {
      await getData(); 
      await fetchHighestRatedRecipes();
    }
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 saniye
  
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (userData) {
      fetchRecommendedRecipes(userData._id);
    }
  }, [userData]);

  const weeklyCalendar = startOfWeek => {
    let weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = startOfWeek.clone().add(i, 'days');
      const isCurrentDate = date.isSame(currentDate, "day");
      weekDates.push(
        <View key={i} style={styles.dayContainer}>
          <TouchableOpacity>
            <Text style={styles.dayText}>{date.format("ddd")}</Text>
            <View style={isCurrentDate && styles.currentDateContainer}>
              <Text style={styles.dayNumber}>{date.format("DD")}</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
    return weekDates;
  }

  const renderWeeks = numWeeks => {
    let weeks = [];
    for (let i = 0; i < numWeeks; i++) {
      weeks.push(
        <View key={i}>
          <View style={styles.dayContainer}>
            {weeklyCalendar(startOfWeek.clone().add(i * 7, "days"))}
          </View>
        </View>
      );
    }
    return weeks;
  }

  const navigateToRecipeDetails = (recipeId) => {
    navigation.navigate('RecipeDetails', { recipeId });
  };

  async function getData() {
    const token = await AsyncStorage.getItem('token');
    console.log(token);
    await axios
      .post('http://192.168.56.1:3030/userdata', { token: token })
      .then(res => {
        console.log(res.data);
        setUserData(res.data.data);
      });
  }

  const fetchRecommendedRecipes = async (userId) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const surveyResponse = await axios.get(`http://192.168.56.1:3030/survey/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const surveyData = surveyResponse.data.data;
      console.log("surveyData", surveyData);

      // Store the categories from survey data
      setSurveyCategories(surveyData.favoriteCategories || []);

      const response = await axios.get('http://192.168.56.1:3030/recipes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const recipes = response.data.data;
      console.log("recipes", recipes);

      let filteredRecipes = [];
      surveyData.favoriteCategories.forEach(categoryId => {
        const categoryRecipes = recipes.filter(recipe => recipe.categories.some(category => category._id === categoryId));
        filteredRecipes.push(...categoryRecipes);
      });

      // Randomly select 6 recipes
      const selectedRecipes = filteredRecipes.sort(() => 0.5 - Math.random()).slice(0, 6);
      setRecommendedRecipes(selectedRecipes);
      console.log("selectedRecipes", selectedRecipes);

      setCategoryRecipes(filteredRecipes);
    } catch (error) {
      console.error('Error fetching recommended recipes:', error);
    }
  };  

  async function fetchHighestRatedRecipes() {
    try {
      const response = await axios.get('http://192.168.56.1:3030/highest-rated-recipe');
      console.log('Highest Rated Recipes:', response.data.data);  // Konsola yazdırma
      setHighestRatedRecipes(response.data.data);
    } catch (error) {
      console.error("Error fetching highest rated recipes:", error);
    }
  }

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
    <SafeAreaView style={styles.container}>
      <>
      {loading ? (
          <View style={{alignItems:'center',marginTop:'90%', backgroundColor:colors.bg}}><Loading isLoading={loading}/></View>
        ) : (
    <>
      <View style={styles.firstCont}>
        <View style={styles.welcome}>
          <Text style={{ marginTop: 10, fontSize: 20, fontWeight: "500" }}>
            Merhaba, {userData.name ? userData.name.charAt(0).toUpperCase() + userData.name.slice(1).toLowerCase() : 'Kullanıcı'}
          </Text>
          <Text>{formattedDate}</Text>
        </View>
        <View style={styles.icon}>
          <TouchableOpacity onPress={() => navigation.navigate('ChatBot')}>
            <Image style={{ marginRight: 5 }} source={require('../assets/bot.png')} />
          </TouchableOpacity>
        </View>
      </View> 
      <View>
        <Pressable style={styles.calendar} onPress={() => navigation.navigate('MealPlanner')}>
          <Text style={{ fontSize: 24, fontWeight: 500 }}>
            Takvim
          </Text>
          <View>
            {renderWeeks(1)}
          </View>
        </Pressable>
      </View>
      <Text style={{ marginTop: 10, fontSize: 16, fontWeight: "500", paddingStart: 10 }}>Sevdiğin kategorilere göre</Text>
      <ScrollView horizontal >
            {recommendedRecipes.map(recipe => (
              <TouchableOpacity key={recipe._id} onPress={() => handleRecipePress(
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
                <View style={styles.recipeCard}>
                  <Image source={{ uri: recipe.recipeImage }} style={styles.recipeImage} />
                  <Text style={styles.recipeTitle}>{recipe.recipeName}</Text>
                </View>
              </TouchableOpacity>
            ))}
      </ScrollView>
      <Text style={{ marginTop: 10, fontSize: 16, fontWeight: "500", paddingStart: 10 }}>Bu hafta en yüksek puan alan tarifler</Text>
      <ScrollView horizontal>
        {highestRatedRecipes.map((recipe) => (
          <TouchableOpacity key={recipe._id} onPress={() => handleRecipePress(
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
            <View style={styles.recipeCard}> 
              <Image source={{ uri: recipe.recipeImage }} style={styles.recipeImage} />
              <Text style={styles.recipeTitle}>{recipe.recipeName}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </>
  )}
</>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg
  },
  firstCont: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    margin: 10,
    fontSize: 16,
    fontWeight: "500"
  },
  welcome: {
    width: '70%',
  },
  calendar: {
    paddingHorizontal: 10,
    margin: 10,
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    marginHorizontal: 5,
    paddingHorizontal: 10
  },
  currentDateContainer: {
    backgroundColor: colors.fg,
    alignItems: 'center',
    width: 30,
    height: 30
  },
  dayText: {
    fontWeight: '300',
    marginBottom: 10
  },
  dayNumber: {
    fontSize: 20,
  },
  icon: {
    flexDirection: 'row',
  }, 
  boldText: {
    fontSize: 24,
    fontWeight: '500',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: colors.fg
  },
  recipeCard: {
    margin: 10,
    alignItems: 'center'
  },
  recipeImage: {
    aspectRatio: 5 / 6,
    height: 170,
    marginRight: 10,
    borderRadius: 6,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    overflow: 'hidden',
    
  },
  recipeTitle: {
    marginTop: 5,
    alignItems: 'center', 
    justifyContent: 'center'
  }
});
