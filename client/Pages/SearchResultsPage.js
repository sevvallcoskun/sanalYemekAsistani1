import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  FlatList,
  Image,
  Pressable,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SearchResultsPage({ navigation, route }) {
  const { searchQuery: initialSearchQuery } = route.params;
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = filterRecipes(allRecipes, searchQuery);
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes([]);
    }
  }, [searchQuery]);

  const fetchRecipes = async () => {
    try {
      const response = await axios.get('http://192.168.56.1:3030/recipes');
      const allRecipes = response.data.data;
      setAllRecipes(allRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
    setLoading(false);
  };

  const filterRecipes = (allRecipes, searchText) => {
    const searchWords = searchText.toLowerCase().split(' ');

    return allRecipes.filter((recipe) => {
      const recipeName = recipe.recipeName ? recipe.recipeName.toLowerCase() : '';
      return searchWords.every((word) => recipeName.includes(word));
    });
  };

  const handleRecipePress = (
    recipeId,
    recipeName,
    recipeImage,
    category,
    ingredients,
    steps,
    servicesCount,
    cookingTime,
    preparationTime
  ) => {
    navigation.navigate('RecipeDetails', {
      recipeId,
      recipeName,
      recipeImage,
      category,
      ingredients,
      steps,
      servicesCount,
      cookingTime,
      preparationTime,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <AntDesign name="search1" size={24} color={colors.primary} />
        <TextInput
          placeholder="Ara.."
          placeholderTextColor={colors.primary}
          style={{ flex: 1 }}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>
      {loading ? (
        <View style={{ alignItems: 'center', marginTop: '90%', backgroundColor: colors.bg }}>
          <Text>Loading...</Text>
        </View>
      ) : (
        <>
          {searchQuery.trim() === '' ? (
            <View style={styles.imageContainer}>
              <Image source={require('../assets/recipe.png')} style={styles.image} />
            </View>
          ) : filteredRecipes.length > 0 ? (
            <FlatList
              data={filteredRecipes}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() =>
                    handleRecipePress(
                      item._id,
                      item.recipeName,
                      item.recipeImage,
                      item.category,
                      item.ingredients,
                      item.steps,
                      item.servicesCount,
                      item.cookingTime,
                      item.preparationTime
                    )
                  }
                  style={styles.recipeRow}
                >
                  <Image
                    source={item.recipeImage ? { uri: item.recipeImage } : require('../assets/gray.png')}
                    style={styles.recipeImage}
                  />
                  <Text style={styles.recipeText}>{item.recipeName}</Text>
                </Pressable>
              )}
              keyExtractor={(item) => item._id}
            />
          ) : (
            <Text style={styles.emptyText}>No recipes found</Text>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg,
  },
  searchBar: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    marginTop: '10%',
    marginBottom: '5%',
    padding: 10,
    borderColor: colors.fg,
    backgroundColor: colors.fg,
    borderRadius: 10,
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.fg,
  },
  recipeImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  recipeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: colors.primary,
  },
  imageContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 140,
    height: 140,
    justifyContent:'center',
    alignItems:'center',
  },
});
