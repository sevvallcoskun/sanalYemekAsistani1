import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Button, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from "../theme/colors";
import * as Progress from 'react-native-progress';
import axios from  'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome6 } from '@expo/vector-icons';
import BackButton from '../components/BackButton';

export default function AddRecipe4({ navigation, route }) {
    const progressBar=<Progress.Bar progress={1} width={300} color={colors.primary}/>
    const [units, setUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState("");
    const [ingredientAmount, setIngredientAmount] = useState("");
    const [ingredientList, setIngredientList]= useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState("");
    const [addedIngredients, setAddedIngredients] = useState([]);
    const [selectedIngredientInfo, setSelectedIngredientInfo] = useState({ id: "", amount: "", unit: "" });

    const trash=<FontAwesome6 name="trash-can" size={20} color={colors.primary} />;

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

    const handleSearch = (text) => {
        setSearchTerm(text);
        const filteredIngredients = ingredientList.filter(ingredient =>
          ingredient.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredIngredients(filteredIngredients);
      };

    const handleIngredientSelect = (ingredientId, itemName) => {
        setSelectedIngredient(ingredientId);
        console.log("Seçilen malzeme:", ingredientId);
        setSearchTerm(itemName);
        setFilteredIngredients([]);
    };

    const addIngredient = () => {
        if (selectedIngredient && ingredientAmount && selectedUnit) {
            const ingredient = {
                id: selectedIngredient,
                amount: ingredientAmount,
                unit: selectedUnit,
            };
            setAddedIngredients([...addedIngredients, ingredient]);
            setSelectedIngredient("");
            setIngredientAmount("");
            setSelectedUnit("");
        }        
        console.log("Eklenecek malzeme:", selectedIngredient);
        console.log("Miktar:", ingredientAmount);
        console.log("Birim:", selectedUnit);
    };

    const handleIngredientContainerPress = (ingredient) => {
        setSelectedIngredientInfo({
            id: ingredient.id,
            amount: ingredient.amount,
            unit: ingredient.unit
        });
        console.log("inglist", selectedIngredientInfo)
    };
    
    const addOrUpdateIngredient = () => {
        if (selectedIngredientInfo.id && ingredientAmount && selectedUnit) {
            const ingredient = {
                id: selectedIngredientInfo.id,
                amount: ingredientAmount,
                unit: selectedUnit,
            };
            const updatedIngredients = addedIngredients.map(item => {
                if (item.id === selectedIngredientInfo.id) {
                    return ingredient;
                }
                return item;
            });
            setAddedIngredients(updatedIngredients);
            setIngredientAmount("");
            setSelectedUnit("");
            setSelectedIngredientInfo({ id: "", amount: "", unit: "" });
        } else {
            addIngredient();
        }
    };

    const removeIngredient = (ingredientId) => {
        const updatedIngredients = addedIngredients.filter(item => item.id !== ingredientId);
        setAddedIngredients(updatedIngredients);
    };

    const saveRecipe = () => {
        const selectedIngredients = addedIngredients.map(ingredient => ({
            ingredientId: ingredient.id,
            unitId: ingredient.unit,
            amount: ingredient.amount,
            name: `${ingredient.amount} ${units.find(unit => unit._id === ingredient.unit)?.name} ${ingredientList.find(item => item._id === ingredient.id)?.name}`,
        }));        
        console.log("sel", selectedIngredients);
        navigation.navigate('AddRecipe3', { selectedIngredients: selectedIngredients });
    };

  return (
    <SafeAreaView style={styles.container}>
        <View style={{ marginTop:'3%', flexDirection:'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ marginRight: 10 }}>
            <BackButton/>
          </View>
          <View >
            {progressBar}
          </View> 
        </View>
      <View style={styles.searchContainer}>
        <TextInput
            style={[styles.input, { width: '90%' }]}
            placeholder="Malzeme adı ara"
            value={searchTerm}
            onChangeText={handleSearch}
        />
        <View style={styles.searchIngredients}>
                {searchTerm !== '' && filteredIngredients.length > 0 && (
                    filteredIngredients.map((ingredient, index) => (
                        <View key={ingredient._id}>
                            <TouchableOpacity
                                style={styles.searchIngredient}
                                onPress={() => handleIngredientSelect(ingredient._id, ingredient.name)}
                            >
                                <Text>{ingredient.name}</Text>
                            </TouchableOpacity>
                            {index < filteredIngredients.length - 1 && <View style={styles.separator} />}
                        </View>
                    ))
                )}
            </View>
      </View>

      <View style={styles.amountPickerContainer}>
        <TextInput
            style={[styles.input, { width: '50%' }]}
            placeholder="Miktar"
            value={ingredientAmount}
            onChangeText={setIngredientAmount}
        />
        <Picker
            selectedValue={selectedUnit}
            style={[styles.input, { width: '50%', borderColor: colors.primary }]}
            onValueChange={(itemValue, itemIndex) => setSelectedUnit(itemValue)}
            >
            <Picker.Item label="Seçiniz" value="" />
            {units.map(unit => (
                <Picker.Item key={unit._id} label={unit.name} value={unit._id} />
            ))}
        </Picker> 
      </View>
      <TouchableOpacity style={styles.button} onPress={addOrUpdateIngredient}>
        <Text style={{color:'white'}}>Malzemeyi Ekle</Text>
      </TouchableOpacity> 
      <TouchableOpacity style={styles.button} onPress={saveRecipe}>
        <Text style={{color:'white'}}>Kaydet</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.addedIngredientsContainer} onPress={() => setSelectedIngredientInfo({ id: "", amount: "", unit: "" })}>
        {addedIngredients.map(ingredient => (
            <TouchableOpacity key={ingredient.id} onPress={() => handleIngredientContainerPress(ingredient)} style={styles.addedIngredient}>
                <View style={{ justifyContent: 'flex-start', flexDirection: 'row' }}>
                    <Text style={{ marginHorizontal: 5 }}>{ingredient.amount}</Text>
                    <Text>{units.find(unit => unit._id === ingredient.unit)?.name}</Text>
                </View>
                <Text>{ingredientList.find(item => item._id === ingredient.id)?.name}</Text>
                <TouchableOpacity onPress={() => removeIngredient(ingredient.id)}>{trash}</TouchableOpacity>
            </TouchableOpacity>
        ))}
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        width:'100%',
        height:'100%',
        alignItems:'center',
        backgroundColor: colors.bg
    }, 
    input:{
        height:50,
        paddingLeft: 10,
        marginVertical:10,
        borderRadius:5,
        borderWidth:1,
        borderColor:colors.primary,
        backgroundColor:"#FFF4"
    },
    searchContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    button:{
        width:"90%",
        height:45,
        alignItems:'center',
        justifyContent:'center',
        marginBottom:5,
        borderRadius:20,
        borderWidth: 1,
        borderColor:colors.primary,
        backgroundColor:colors.primary,
        marginBottom:10, 
    },
    item: {
        paddingLeft: 10,
        marginVertical:5,
    },
    separator: {
        marginTop: 5,
        borderBottomWidth: 0.4,
        borderColor: 'gray',
        width:"100%",
    },

    searchIngredients: {
        backgroundColor: '#FFF4',
        justifyContent: "flex-start",
        alignItems:'flex-start',
        width:"90%",

    },
    addedIngredientsContainer: {
        alignItems: 'center',
        marginTop: 20,
        width: '100%',
        height:50,
        paddingHorizontal: 10,

    },
    addedIngredient: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: colors.fg,
        width:"95%",
        height:40,
        padding: 10,
        borderRadius: 20,
    },
    amountPickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
      },
      amountInput: {
        marginRight: 10,
      },
      picker: {
        width: 150,
        borderRadius:5,
        borderWidth:1,
        borderColor:colors.primary,
        backgroundColor:"#FFF4"
      },
})