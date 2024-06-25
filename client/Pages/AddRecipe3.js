import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Button, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { colors } from "../theme/colors";
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context'
import BackButton from '../components/BackButton';
import { Ionicons } from '@expo/vector-icons'; 
import axios from  'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import Loading from './Loading';
 
export default function AddRecipe3({ navigation, route }) {
  const progressBar=<Progress.Bar progress={1} width={300} color={colors.primary}/>
  const addStepIcon=<Ionicons name="add-circle" size={30} color={colors.primary} />
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [stepCounter, setStepCounter] = useState(1);
  const [additionalSteps, setAdditionalSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [ingredientList, setIngredientList]= useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [recipeName, setRecipeName] = useState('');
  const [recipeImage, setRecipeImage] = useState('');
  const [servicesCount, setServicesCount] = useState(0);
  const [cookingTime, setCookingTime] = useState(0);
  const [preparationTime, setPreparationTime] = useState(0);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const getToken = async () => {
      const userToken = await AsyncStorage.getItem('token');
      setToken(userToken);
    };
    getToken();
  }, []);

  useEffect(() => {
    if (route.params && route.params.recipeName) {
      const recipeName = route.params.recipeName;
      setRecipeName(route.params.recipeName);
      console.log("Recipe Name:", recipeName);
    }
  }, [route.params]);

  useEffect(() => {
    if (route.params && route.params.recipeImage) {
      const recipeImage = route.params.recipeImage;
      setRecipeImage(route.params.recipeImage);
      console.log("Recipe image:", recipeImage);
    }
  }, [route.params]);
  
  useEffect(() => {
    if (route.params && route.params.servicesCount) {
      const servicesCount = route.params.servicesCount;
      setServicesCount(route.params.servicesCount);
      console.log("Services Count:", servicesCount);
    }
  }, [route.params]);
  
  useEffect(() => {
    if (route.params && route.params.cookingTime) {
      const cookingTime = route.params.cookingTime;
      setCookingTime(route.params.cookingTime);
      console.log("Cooking Time:", cookingTime);
    }
  }, [route.params]);
  
  useEffect(() => {
    if (route.params && route.params.preparationTime) {
      const preparationTime = route.params.preparationTime;
      setPreparationTime(route.params.preparationTime);
      console.log("Preparation Time:", preparationTime);
    }
  }, [route.params]);
  
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get('http://192.168.56.1:3030/unit');
        setUnits(response.data.data);
      } catch (error) {
        console.error('Birimleri alma hatası:', error);
      }
    };
    fetchUnits();
  }, []);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await axios.get('http://192.168.56.1:3030/ingredient');
        setIngredientList(response.data.data);
      } catch (error) {
        console.error('Malzemeleri alma hatası:', error);
      }
    };
    fetchIngredients();
  }, []);

  useEffect(() => {
    const fetchCategories= async() => {
      try {
        const response= await axios.get('http://192.168.56.1:3030/category');
        setCategories(response.data.data);
      } catch (error) {
        console.log("Kategorileri alaması.", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (route.params && route.params.selectedIngredients) {
      setIngredients(route.params.selectedIngredients);
      console.log("selIng3", route.params.selectedIngredients)
    }
  }, [route.params]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 saniye
  
  
    return () => clearTimeout(timer);
  }, []);

   
  const uploadImageToS3 = async (recipeId) => {
    console.log('Uploading image to S3...');
    console.log("recidd",recipeId)
    console.log("recim", recipeImage)
    try {
      const formData = new FormData();
      const fileName = `recipe_image_S3_${recipeId}.jpeg`;
      formData.append('image', {
        name: fileName,
        type: 'image/jpeg',
        uri: recipeImage, 
      });
      console.log("form", formData)
      const response = await axios.post('http://192.168.56.1:3030/upload', formData,{
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        const imageUrl = response.data.imageUrl;
        console.log("Server response:", response);
        console.log("Response data:", response.data);
        console.log("Response status:", response.status);
        return imageUrl;
    } catch (error) {
      console.error('Error uploading image to S3:', error);
      console.log("Error response:", error.response);
      throw error;
    }
  };
  
  
  const addStep = () => {
    if (currentStep.trim() !== "") {
      setAdditionalSteps([...additionalSteps, currentStep]);
      setCurrentStep('');
      setStepCounter(prev => prev + 1); 
    }
  };

  /* const addRecipeIngredient = async (recipeId, ingredientId, unitId, amount) => {
    try {
      const response = await axios.post("http://192.168.56.1:3030/recipeIngredients", {
        recipeId: recipeId,
        ingredientId: ingredientId,
        unitId: unitId,
        amount: amount
      });
      console.log("Recipe ingredient added:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding recipe ingredient:", error);
      throw error;
    }
  }; */
  
  /* const sendIngredientsToServer = async (recipeId) => {
    try {
      const response = await axios.post("http://192.168.56.1:3030/recipeIngredients", {
        ingredients: ingredients,
        recipeId: recipeId
      });
      console.log("Ingredients added:", response.data);
    } catch (error) {
      console.error("Error adding ingredients:", error);
    }
  }; */

  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      if (categoryId) {
        setSelectedCategories([...selectedCategories, categoryId]);
      }
    }
  };
  
  const handleResetScreen = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'RecipesPage' }],
    });
    navigation.navigate('RecipesPage')
};
  
  const handleAddIngredient= async () => {
    navigation.navigate('AddRecipe4')
  }
  
  const handleSave = async (isShared) => {
    try {
      setLoading(true); 
  
      if (ingredients.length === 0) {
        console.error("Malzemeler boş olamaz!");
        setLoading(false); 
        return;
      }
  
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log("Token not found");
        setLoading(false); 
        return;
      }  
  
      const res = await axios.post("http://192.168.56.1:3030/userdata", { 
        token: token,
        selectedCategories: selectedCategories,
      });
  
      if (res.data.status === "ok") { 
        const recipeData = { 
          recipeName: recipeName,
          recipeImage: recipeImage,
          ingredients: ingredients,
          servicesCount: servicesCount,
          cookingTime: cookingTime,
          preparationTime: preparationTime,
          isShared: isShared,
          instructionSteps: additionalSteps,
          selectedCategories: selectedCategories, 
          userId: userId, 
        }; 
  
        await AsyncStorage.setItem('recipeData', JSON.stringify(recipeData));
        const response = await axios.post("http://192.168.56.1:3030/addRecipe", recipeData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }); 
  
        if (response.data.status === "ok") {
          const recipeId = response.data.recipeId;
          await uploadImageToS3(recipeId);
  
          // Navigate to RecipesPage only after successful save
          handleResetScreen();
        }
      }
    } catch (error) {
      console.error("userData : Bir hata oluştu:", error.message);
      Alert.alert("Hata", "Bir hata oluştu. LÃ¼tfen tekrar deneyin.");
    } finally {
      setLoading(false); 
    }
  };
  
  const handlePrivateSave = async () => {
    await handleSave(false);
  };
  
  const handleSharedSave = async () => {
    await handleSave(true);
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginTop: '3%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ marginRight: 10 }}>
          <BackButton />
        </View>
        <View>
          {progressBar}
        </View> 
      </View>
      <ScrollView>
        <View style={styles.card}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.sectionTitle}>MALZEMELER</Text>
            <View style={{ width: '100%' }}>
              <TouchableOpacity onPress={handleAddIngredient}>
                <View style={styles.inputContainer}>
                  <Text style={styles.placeholderText}>
                    Tarifiniz için bir malzeme ekleyin
                  </Text>
                  {addStepIcon}
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.addedIngredientsContainer}>
              {ingredients.map((ingredient, index) => (
                <View key={index} style={styles.addedIngredient}>
                  <Text>{ingredient.name}</Text>
                  <Text>{ingredient.amount} {ingredient.unit}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.sectionTitle}>ADIMLAR</Text>
            {additionalSteps.map((step, index) => (
              <View key={index} style={styles.stepContainer}>
                <Text style={{ fontSize: 14, fontWeight: '500' }}>
                  ADIM {index + 1}
                </Text>
                <TextInput 
                  style={styles.stepInput} 
                  multiline 
                  value={step}
                  onChangeText={(text) => {
                    const newSteps = [...additionalSteps];
                    newSteps[index] = text;
                    setAdditionalSteps(newSteps);
                  }} 
                />
              </View>
            ))}
            <View style={styles.inputContainer}>
              <TextInput 
                style={[ { flex: 1 }]}
                placeholder="Tarifin yapılış adımlarını yazın"
                value={currentStep}
                onChangeText={setCurrentStep}
                multiline
              />
              <TouchableOpacity onPress={addStep} style={{ alignItems: 'center' }}>
                {addStepIcon}
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.sectionTitle}>ETİKETLER</Text>
            <View style={styles.categoriesContainer}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category._id}
                  style={[
                    styles.categoryButton,
                    selectedCategories.includes(category._id) && styles.selectedCategoryButton
                  ]}
                  onPress={() => toggleCategory(category._id)}>
                  <Text>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.container}>
          <TouchableOpacity style={styles.button} onPress={handleSharedSave}>
            <Text style={{ color: "white" }}>Yayınla</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handlePrivateSave}>
            <Text style={{ color: "white" }}>Tarif defterime kaydet</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    backgroundColor: colors.bg
  },
  card: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginHorizontal: 20,
    width: '90%', // Ensure consistent width
  },
  input: {
    height: 50,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "#FFF4"
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensure space between elements
    marginTop: 10,
    height: 50,
    width: '100%', // Ensure consistent width
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "#FFF4",
    paddingHorizontal: 10, // Add padding for consistency
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: "90%",
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    marginBottom: 10,
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
  addedIngredientsContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  addedIngredient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: colors.fg,
    width: "95%",
    height: 50,
    padding: 10,
    borderRadius: 5,
  },
  stepContainer: {
    marginBottom: 10,
  },
  stepInput: {
    height: 50,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    backgroundColor: "#FFF4",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    paddingTop: 15,
    paddingBottom: 15
  },
  placeholderText: {
    fontWeight: '300',
  },
});