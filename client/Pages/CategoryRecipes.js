import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors } from '../theme/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RecipeBox from '../components/RecipeBox';
import Loading from './Loading';

export default function CategoryRecipes({ navigation, route }) {
  const { categoryId, categoryName } = route.params;
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchRecipes().then(() => setLoading(false));
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get('http://192.168.56.1:3030/recipes');
      const allRecipes = response.data.data;
      const sharedRecipes = allRecipes.filter(recipe => recipe.isShared);
      const categoryRecipes = sharedRecipes.filter(recipe => {
        const recipeCategoryIds = recipe.categories.map(category => category._id);
        return recipeCategoryIds.includes(categoryId);
      });
      setRecipes(categoryRecipes);
    } catch (error) {
      console.error('Tarifleri alma hatası:', error);
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

  if (loading) {
    return <Loading isLoading={loading} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.headerText}>{categoryName} ({recipes.length})</Text>
        <View style={styles.categoriesContainer}>
          {recipes.length === 0 ? (
            <View style={styles.noRecipeContainer}>
              <Image source={require('../assets/norecipe.png')} style={styles.images} /> 
              <Text style={styles.noRecipeText}>Bu kategoriye ait tarif bulunamadı</Text>
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
                <RecipeBox recipeName={recipe.recipeName} recipeImage={recipe.recipeImage} />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
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
  header: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    marginTop: '10%',
    marginHorizontal: '5%',
    fontSize: 22,
    fontWeight: '400',
    color: 'black',
  },
  noRecipeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
    marginTop:'35%'
  },
  noRecipeText: {
    textAlign: "center",
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 16,
    fontWeight: '300',
    marginTop: 20,
  },
  categoriesContainer: {
    margin: 10,
    marginTop: 10
  },
  images: {
    width:150,
    height:150
  }
});
 