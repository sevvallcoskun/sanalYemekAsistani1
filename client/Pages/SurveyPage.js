import { View, Text, StyleSheet, TouchableOpacity, Pressable, Image, TextInput, FlatList, SafeAreaView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { colors } from "../theme/colors";
import { Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import RadioForm from 'react-native-simple-radio-button';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const forwardIcon = <Ionicons name="arrow-forward" size={50} color={colors.primary} />;
const addIcon = <Ionicons name="add-circle" size={30} color={colors.primary} />;

export default function SurveyPage({ navigation, route }) {
  const [userData, setUserData] = useState("");
  const [step, setStep] = useState(1);
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
  const progress = (step + 1) / 5;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post('http://192.168.56.1:3030/userdata', { token: token });
      if (response.data.status === "ok") {
        setUserData(response.data.data);
        console.log("token", token);
      } else {
        console.error("Kullanıcı verileri alınamadı");
      }
    } catch (error) {
      console.error("Kullanıcı verileri alınamadı:", error);
    }
  };

  useEffect(() => {
    const fetchDiets = async () => {
      try {
        const response = await axios.get('http://192.168.56.1:3030/diets');
        setDiets(response.data.data);
        console.log("diets", response.data.data);
      } catch (error) {
        console.log("Diyetler alınamadı.", error);
      }
    }
    fetchDiets();
  }, []);

  useEffect(() => {
    const fetchAllergies = async () => {
      try {
        const response = await axios.get('http://192.168.56.1:3030/allergies');
        setAllergies(response.data.data);
        console.log("all", response.data.data);
      } catch (error) {
        console.log("Alerjiler alınamadı.", error);
      }
    }
    fetchAllergies();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://192.168.56.1:3030/category');
        setFavoriteCategories(response.data.data);
        console.log("fav", response.data.data);
      } catch (error) {
        console.log("Kategoriler alınamadı.", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await axios.get('http://192.168.56.1:3030/ingredient');
        setDislikedIngredients(response.data.data);
        setIngredientList(response.data.data);
        console.log("ing", response.data.data);
      } catch (error) {
        console.error('Malzemeler alınamadı:', error);
      }
    };
    fetchIngredients();
  }, []);

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleDietSelect = (diet) => {
    setSelectedDiet(Array.isArray(diet) ? diet : [diet]);
    console.log("diet", diet);
  };

  const handleAllergiesSelect = (allergy) => {
    if (selectedAllergies.includes(allergy)) {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== allergy));
      console.log("allergy1", allergy);
    } else {
      setSelectedAllergies([...selectedAllergies, allergy]);
      console.log("allergy", allergy);
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
      const selectedAllergyIds = selectedAllergies.map(allergy => allergy._id);
      const surveyData = {
        userId: userId,
        diets: selectedDietIds,
        allergies: selectedAllergyIds,
        dislikedIngredients: selectedIngredients,
        favoriteCategories: selectedCategories,
      };
      console.log("surveyData", surveyData);
      const response = await axios.post("http://192.168.56.1:3030/survey", surveyData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Anket başarıyla gönderildi:", response.data);
      navigation.navigate('Main');
    } catch (error) {
      console.error("Anket gönderilirken bir hata oluştu:", error);
      if (error.response.status === 401) {
        console.log("Token geçersiz");
      } else {
        console.error("Bilinmeyen bir hata oluştu:", error);
      }
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
      <View style={styles.progressBarContainer}>
        <Progress.Bar progress={progress} width={300} color={colors.primary} />
      </View>
      <Text style={styles.questionText}>
        {step === 1 && "Aşağıdaki beslenme türlerinden birini tercih ediyor musunuz?"}
        {step === 2 && "Herhangi bir alerjiniz veya intoleransınız var mı?"}
        {step === 3 && "Sevmediğiniz yiyecekler nelerdir?"}
        {step === 4 && "Sevdiğiniz yemek kategorileri nelerdir?"}
      </Text>
      <View style={styles.answersContainer}>
        {step === 1 && (
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
        )}
        {step === 2 && (
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
        )}
        {step === 3 && (
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
        )}
        {step === 4 && (
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
        )}
      </View>
      <Pressable style={styles.forwardButton} onPress={handleNextStep}>
        {forwardIcon}
      </Pressable>
      {step !== 3 && (
        <Image source={require('../assets/fruitsbg.png')} style={styles.backgroundImage} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: colors.bg
  },
  progressBarContainer: {
    marginTop: '15%'
  },
  questionText: {
    fontSize: 22,
    marginTop: '6%',
    textAlign: 'left',
    width: '100%',
    paddingLeft: '4%'
  },
  answersContainer: {
    marginTop: 10,
    fontSize: 14,
    width: '100%',
    paddingHorizontal: '3%'
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
  forwardButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  backgroundImage: {
    width: '90%',
    opacity: 1,
    height: 400,
    position: 'absolute',
    left: 0,
    bottom: 0
  },
});
