import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, SafeAreaView, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { colors } from "../theme/colors";
import { Ionicons } from '@expo/vector-icons';
import RadioForm from 'react-native-simple-radio-button';
import axios from 'axios'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserSurveyPage({ navigation, route }) {
  const [userData, setUserData] = useState("");
  const [diets, setDiets] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [dislikedIngredients, setDislikedIngredients] = useState([]);
  const [favoriteCategories, setFavoriteCategories] = useState([]);
  const [selectedDiet, setSelectedDiet] = useState([]);
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ingredientList, setIngredientList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { userId } = route.params;

  useEffect(() => {
    fetchUserData();
    fetchSurveyData();
    fetchDiets();
    fetchAllergies();
    fetchCategories();
    fetchIngredients();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post('http://192.168.56.1:3030/userdata', { token: token });
      if (response.data.status === "ok") {
        setUserData(response.data.data);
      } else {
        console.error("Kullanıcı verileri alınamadı");
      }
    } catch (error) {
      console.error("Kullanıcı verileri alınamadı:", error);
    }
  };

  const fetchSurveyData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`http://192.168.56.1:3030/survey/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.status === "success") {
        const { diets, allergies, dislikedIngredients, favoriteCategories } = response.data.data;
        setSelectedDiet(diets);
        setSelectedAllergies(allergies);
        setSelectedIngredients(dislikedIngredients);
        setSelectedCategories(favoriteCategories);
        console.log("res diet", response.data.data)
      } else {
        console.error("Anket verileri alınamadı");
      }
    } catch (error) {
      console.error("Anket verileri alınamadı:", error);
    }
  };

  const fetchDiets = async () => {
    try {
      const response = await axios.get('http://192.168.56.1:3030/diets');
      setDiets(response.data.data);
    } catch (error) {
      console.log("Diyetler alınamadı.", error);
    }
  };

  const fetchAllergies = async () => {
    try {
      const response = await axios.get('http://192.168.56.1:3030/allergies');
      setAllergies(response.data.data);
    } catch (error) {
      console.log("Alerjiler alınamadı.", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://192.168.56.1:3030/category');
      setFavoriteCategories(response.data.data);
    } catch (error) {
      console.log("Kategoriler alınamadı.", error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await axios.get('http://192.168.56.1:3030/ingredient');
      setDislikedIngredients(response.data.data);
      setIngredientList(response.data.data);
    } catch (error) {
      console.error('Malzemeler alınamadı:', error);
    }
  };

  const handleDietSelect = (diet) => {
    setSelectedDiet(Array.isArray(diet) ? diet : [diet]);
  };

  const handleAllergiesSelect = (allergy) => {
    if (selectedAllergies.includes(allergy)) {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== allergy));
    } else {
      setSelectedAllergies([...selectedAllergies, allergy]);
    }
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    const filteredIngredients = ingredientList.filter(ingredient =>
      ingredient.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredIngredients(filteredIngredients);
  };

  const handleIngredientSelect = (ingredientId, itemName) => {
    if (!selectedIngredients.includes(ingredientId)) {
      setSelectedIngredients([...selectedIngredients, ingredientId]);
    }
    setSearchTerm(itemName);
    setFilteredIngredients([]);
  };

  const handleCategorySelect = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const selectedDietIds = selectedDiet ? selectedDiet.map(diet => diet._id) : [];
      const selectedAllergyIds = selectedAllergies ? selectedAllergies.map(allergy => allergy._id) : [];
      console.log("userId", userId)
      const surveyData = {
        userId: userId, 
        diets: selectedDietIds,
        allergies: selectedAllergyIds,
        dislikedIngredients: selectedIngredients,
        favoriteCategories: selectedCategories,
      };
      console.log("surveyData", surveyData)
      const response = await axios.put(`http://192.168.56.1:3030/survey/${userId}`, surveyData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.status === "success") {
        console.log("Anket başarıyla güncellendi:", response.data);
        navigation.navigate('Main');
      } else {
        console.error("Anket güncellenemedi");
      }
    } catch (error) {
      console.error("Anket güncellenirken bir hata oluştu:", error);
    }
  };

  const removeIngredient = (ingredientId) => {
    setSelectedIngredients(selectedIngredients.filter(id => id !== ingredientId));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      key={item._id}
      style={styles.searchResult}
      onPress={() => handleIngredientSelect(item._id, item.name)}
    >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <Text style={styles.questionText}>Anketi Güncelle</Text>
      <View style={styles.answersContainer}>
        <Text style={styles.label}>Beslenme Türü:</Text>
        <RadioForm
          radio_props={diets.map((diet, index) => ({ label: diet.dietType, value: diet, key: index }))}
          style={styles.answersContainer}
          initial={-1}
          buttonColor={colors.primary}
          onPress={handleDietSelect}
          selectedButtonColor={colors.primary}
          buttonSize={10}
          labelStyle={{ fontSize: 18 }}
        />
        <Text style={styles.label}>Alerjiler:</Text>
        <RadioForm
          radio_props={allergies.map((allergy, index) => ({ label: allergy.allergenName, value: allergy, key: index }))}
          style={styles.answersContainer}
          initial={-1}
          buttonColor={colors.primary}
          onPress={handleAllergiesSelect}
          selectedButtonColor={colors.primary}
          buttonSize={10}
          labelStyle={{ fontSize: 18 }}
        />
        <Text style={styles.label}>Sevmediğiniz Malzemeler:</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchIngredient}
            placeholder="Malzeme Ara"
            value={searchTerm}
            onChangeText={handleSearch}
          />
          <FlatList
            data={filteredIngredients}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            style={styles.searchIngredients}
          />
          <View style={styles.selectedIngredientsContainer}>
            {selectedIngredients.map((ingredientId) => {
              const ingredient = ingredientList.find((item) => item._id === ingredientId);
              return (
                <View key={ingredientId} style={styles.addedIngredient}>
                  <Text style={styles.ingredientName}>{ingredient?.name}</Text>
                  <TouchableOpacity onPress={() => removeIngredient(ingredientId)}>
                    <Ionicons name="remove-circle" size={22} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
        <Text style={styles.label}>Sevdiğiniz Kategoriler:</Text>
        <View style={styles.categoriesContainer}>
          {favoriteCategories.map((category) => (
            <TouchableOpacity
              key={category._id}
              style={[
                styles.categoryButton,
                selectedCategories.includes(category._id) && styles.selectedCategoryButton
              ]}
              onPress={() => handleCategorySelect(category._id)}
            >
              <Text>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Güncelle</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: 20
  },
  questionText: {
    fontSize: 22,
    marginTop: 20,
    textAlign: 'left',
    width: '100%'
  },
  label: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'left',
    width: '100%'
  },
  answersContainer: {
    width: '100%',
  },
  searchContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: '3%'
  },
  searchIngredient: {
    width: '100%',
    paddingLeft: 10,
    marginVertical: 5,
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "#FFF4"
  },
  searchIngredients: {
    backgroundColor: '#FFF4',
    width: "100%",
    maxHeight: 150,
    marginTop: 10
  },
  selectedIngredientsContainer: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  addedIngredient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: colors.fg,
    width: "95%",
    height: 40,
    padding: 10,
    borderRadius: 20,
  },
  ingredientName: {
    fontSize: 16,
    color: colors.text,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10
  },
  categoryButton: {
    margin: 5,
    marginEnd: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
  },
  selectedCategoryButton: {
    backgroundColor: colors.primary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    width: '100%'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
