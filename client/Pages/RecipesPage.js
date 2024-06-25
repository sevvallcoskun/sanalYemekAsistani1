import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, StatusBar, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { colors } from '../theme/colors';
import RoundedSliderBox from '../components/RoundedSliderBox';
import RecipeBox from '../components/RecipeBox';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from './Loading';

const pencil=<Ionicons name="pencil" size={20} color={colors.primary} />
const trash=<FontAwesome6 name="trash-can" size={20} color={colors.primary} />;
const addIcon=<Ionicons name="add-circle" size={50} color={colors.primary} />; 
const Tab = createMaterialTopTabNavigator();
 
function MyRecipeBookScreen({ navigation }) {
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 saniye
  
  
    return () => clearTimeout(timer);
  }, []);

  const fetchCategories= async () => {
    try {
      // setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.56.1:3030/category', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }); 
      console.log("category:",response.data); 
      const allCategories = [{ _id: 'all', name: 'Tümü', categoryImage: '' }, ...response.data.data];
      setCategories(allCategories);
      // setLoading(false);
    } catch (error) {
      //setLoading(false);
      console.error('Tarifleri alma hatası:Mfc', error);
    } 
  }

  const fetchRecipes = async () => {
    try {
      //setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.56.1:3030/userRecipes', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }); 
      console.log("my:",response.data); 
      setRecipes(response.data.data);
      //setLoading(false);
    } catch (error) {
      //setLoading(false);
      console.error('Tarifleri alma hatası:Mfr', error);
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
      console.log("recimm", recipeImage)
  };

  const handleDeleteRecipe = async (recipeId) => {
    try { 
        const token = await AsyncStorage.getItem('token');
        await axios.delete(`http://192.168.56.1:3030/deleteRecipe/${recipeId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
         fetchRecipes(); 
        console.log("recipe successfully deleted:", recipeId);
    } catch (error) {
        console.error('tarifi silme hatası:', error);
    }
  };

  const handleCategoryPress = async (categoryId) => {
    setSelectedCategoryId(categoryId);
    if (categoryId === 'all') {
      // Tümü kategorisi seçildiğinde tüm tarifleri göster
      fetchRecipes();
    } else {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get('http://192.168.56.1:3030/userRecipes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const allUserRecipes = response.data.data;
        const categoryRecipes = allUserRecipes.filter(recipe => {
          const recipeCategoryIds = recipe.categories.map(category => category._id);
          return recipeCategoryIds.includes(categoryId);
        });
        setRecipes(categoryRecipes);
      } catch (error) {
        console.error('Tarifleri alma hatası:', error);
      }
    }
  };
  
  return ( 
    <View style={styles.container}>
      <>
      {loading ? (
          <View style={{alignItems:'center',marginTop:'10%', backgroundColor:colors.bg}}><Loading isLoading={loading}/></View>
        ) : (
    <>
      <ScrollView>
  <ScrollView horizontal>
    <View style={styles.categoryContainer}>
      {categories.map((category, index) => (
        <Pressable key={category._id} onPress={() => handleCategoryPress(category._id)}>
          <RoundedSliderBox categoryName={category.name} categoryImage={category.categoryImage} onPress={() => handleCategoryPress(category._id)} />
        </Pressable>
      ))}
    </View>
  </ScrollView>
  {recipes.length === 0 ? (
    <View style={styles.noRecipeContainer}>
      <Image source={require('../assets/norecipe.png')} style={styles.noRecipeImage} />
    </View>
  ) : (
    recipes.map(recipe => (
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
        <RecipeBox 
          recipeName={recipe.recipeName} 
          recipeImage= {recipe.recipeImage} 
          showTrashIcon={true}
          onDeletePress={() => handleDeleteRecipe(recipe._id)}
        />
      </Pressable>        
    ))
  )}
</ScrollView>

      <Pressable style={styles.addIconContainer} onPress={() => navigation.navigate('AddRecipe1')}>
        {addIcon} 
      </Pressable>
      </>
  )}
</>
    </View>
  );
} 

function LikedRecipesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  
  useEffect(() => {
    fetchFavoriteRecipes();
    fetchCategories(); 
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 saniye
  
  
    return () => clearTimeout(timer);
  }, []);

  const fetchCategories= async () => {
    try {
      // setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.56.1:3030/category', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }); 
      const allCategories = [{ _id: 'all', name: 'Tümü', categoryImage: '' }, ...response.data.data];
      setCategories(allCategories);  
    } catch (error) {
      //setLoading(false);
      console.error('Tarifleri cat alma hatası:lfc', error);
    }
  }
 
  const fetchFavoriteRecipes = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get('http://192.168.56.1:3030/userFavorites/favoriteRecipes', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const favoriteRecipes = response.data.favoriteRecipes.flat();
        setFavoriteRecipes(favoriteRecipes);
        console.log("favrec", favoriteRecipes);
    } catch (error) {
        // Check if the error is due to the absence of favorite recipes
        if (error.response && error.response.status === 404) {
            // No favorite recipes found, set an empty array
            setFavoriteRecipes([]);
            console.log("No favorite recipes found.");
        } else {
            console.error('favori tarifleri alma hatası:', error);
        }
    }
};


  const handleRecipePress = (recipeId, recipeName, recipeImage, category, ingredients, steps, servicesCount, cookingTime, preparationTime) => {
    console.log("recname",recipeName)
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
 
  const handleCategoryPress = async (categoryId) => {
    setSelectedCategoryId(categoryId);
    if (categoryId === 'all') {
        fetchFavoriteRecipes();
    } else {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('http://192.168.56.1:3030/userFavorites/favoriteRecipes', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const favoriteRecipes = response.data.favoriteRecipes.flat();
            console.log("favv", favoriteRecipes);
            const categoryRecipes = favoriteRecipes.filter(recipe => {
                if (recipe.categories && Array.isArray(recipe.categories)) {
                    const recipeCategoryIds = recipe.categories.map(category => category._id);
                    return recipeCategoryIds.includes(categoryId);
                }
                return false;
            });
            setFavoriteRecipes(categoryRecipes);
        } catch (error) {
            console.error('Tarifleri alma hatası:', error);
        }
    }
};

  
  
  
  
  return ( 
    <View style={styles.container}>
{/*       {loading && <Loading isLoading={loading} />}*/}   
      <>
        {loading ? (
            <View style={{alignItems:'center',marginTop:'10%', backgroundColor:colors.bg}}><Loading isLoading={loading}/></View>
          ) : (
      <>
      <ScrollView>
        <ScrollView horizontal>
          <View style={styles.categoryContainer}>
            {categories.map((category, index) => (
              <Pressable key={category._id} onPress={() => handleCategoryPress(category._id)}>
                <RoundedSliderBox categoryName={category.name} categoryImage={category.categoryImage} onPress={() => handleCategoryPress(category._id)} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
          {favoriteRecipes.length === 0 ? (
            <View style={styles.noRecipeContainer}>
              <Image source={require('../assets/norecipe.png')} style={styles.noRecipeImage} />
            </View>
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
              </Pressable>   
            ))
          )}
        </ScrollView>
      </>
        )}
      </>
    </View>
  );
}

export default function RecipesPage({ navigation }) {
  return (
    <SafeAreaView style= {{flex:1}}>
      <StatusBar backgroundColor={colors.bg} barStyle="dark-content" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold' },
          tabBarStyle: { backgroundColor: colors.bg},
          tabBarIndicatorStyle: { backgroundColor: colors.primary },
        }}
      >
        <Tab.Screen name="Tarif Defterim">
          {() => <MyRecipeBookScreen navigation={navigation} />}
        </Tab.Screen>
        <Tab.Screen name="Beğendiklerim">
          {() => <LikedRecipesScreen navigation={navigation} />}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    width:'100%',
    height:'100%',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor: colors.bg
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconContainer:{
    position: 'absolute',
    bottom: 20,
    right: 20, 
  },
  noRecipeText: {
    textAlign:"center",
    justifyContent:'center',
    alignItems:'center',
    fontSize: 16,
    fontWeight: '300',
  },
  noRecipeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:'35%'
  },
  noRecipeImage: {
    width: 100,
    height: 100,
  },
})
