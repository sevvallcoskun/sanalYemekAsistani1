import { View, Text, StyleSheet, TextInput, SafeAreaView, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WpSearchResultsPage({ navigation, route }) {
  const { searchQuery: initialSearchQuery, selectedDate } = route.params;
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [isAddedToPlan, setIsAddedToPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const defaultImage = require('../assets/gray.png');

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
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get('http://192.168.56.1:3030/recipes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const allRecipes = response.data.data;
      setAllRecipes(allRecipes);

      // Tüm tariflerin varsayılan olarak seçili olmamasını sağlamak için initialIsAddedToPlan boş bırakılıyor.
      const initialIsAddedToPlan = {};
      allRecipes.forEach((recipe) => {
        initialIsAddedToPlan[recipe._id] = false;
      });
      setIsAddedToPlan(initialIsAddedToPlan);
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

  const toggleCheck = (recipeId) => {
    setIsAddedToPlan((prev) => ({ ...prev, [recipeId]: !prev[recipeId] }));
  };

  const addToWeeklyPlan = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const selectedRecipeIds = Object.keys(isAddedToPlan).filter(recipeId => isAddedToPlan[recipeId]);

      await axios.post('http://192.168.56.1:3030/weeklyPlan/addRecipeToPlan', {
        date: selectedDate,
        selectedRecipeIds,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigation.navigate('MealPlanner');
    } catch (error) {
      console.error('Error adding recipes to weekly plan:', error);
      Alert.alert("Hata", "Tarifleri haftalık plana eklerken bir hata oluştu.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBar}>
        <AntDesign name="search1" size={24} color={colors.primary} />
        <TextInput
          placeholder=" Ara.."
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
          {filteredRecipes.length > 0 || searchQuery.length === 0 ? (
            <FlatList
              data={filteredRecipes}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => toggleCheck(item._id)} style={styles.recipeRow}>
                  <Image source={item.recipeImage ? { uri: item.recipeImage } : defaultImage} style={styles.recipeImage} />
                  <Text style={styles.recipeText}>{item.recipeName}</Text>
                  <AntDesign
                    name={isAddedToPlan[item._id] ? 'checkcircle' : 'checkcircleo'}
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item._id}
            />
          ) : (
            <Text style={styles.emptyText}>No recipes found</Text>
          )}
          <TouchableOpacity style={styles.saveButton} onPress={addToWeeklyPlan}>
            <Text style={{ color: "white" }}>Haftalık plana ekle</Text>
          </TouchableOpacity>
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
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.fg,
    backgroundColor: colors.fg,
    borderRadius: 10,
  },
  recipeImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  recipeText: {
    flex: 1,
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: colors.primary,
  },
  saveButton: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: '75%',
    height: 40,
    marginBottom: 10,
    marginTop: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
});
