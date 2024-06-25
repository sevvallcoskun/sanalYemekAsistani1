import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, Picker } from 'react-native'
import React, { useState, useEffect } from 'react'
import { colors } from '../theme/colors';
import RecipeSteps from '../components/RecipeSteps';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

export default function StartRecipeSteps({ route, navigation }) {
    const { recipeId, cookingTime: initialCookingTime } = route.params;
    const [cookingTime, setCookingTime] = useState(initialCookingTime);
    const [steps, setSteps]= useState([]);
    const [currentStepIndex, setCurrentStepIndex]= useState(0);
    const nextIcon= <MaterialIcons name="navigate-next" size={70} color="black" />
    const prevIcon= <MaterialIcons name="navigate-before" size={70} color="black" />
    const timerIcon= <MaterialIcons name="timer" size={30} color="white" />

    useEffect(() => {
        fetchSteps();
    }, [recipeId]); 

    useEffect(() => { 
        if (route.params && route.params.cookingTime) {
          const cookingTime = route.params.cookingTime;
          setCookingTime(route.params.cookingTime);
          console.log("Cooking Time:", cookingTime);
        }
      }, [cookingTime]); 


    const fetchSteps = async () => {
        try {
            const response = await axios.get(`http://192.168.56.1:3030/instruction?recipeId=${recipeId}`);
            setSteps(response.data.data);
            const stepsData = response.data.data;
            console.log("Adımlar1:", stepsData);
        } catch (error) {
            console.error('Adımları alma hatası:', error);
        }
    };

    const goToNextStep = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };
    const goToPreviousStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {steps.map((step, index) => (
                    index === currentStepIndex &&
                    <RecipeSteps key={index} step={step} />
                ))}
            </ScrollView>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={goToPreviousStep}>
                    {prevIcon}
                </TouchableOpacity>
                <TouchableOpacity onPress={goToNextStep}>
                    {nextIcon}
                </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer2}>
                <TouchableOpacity style={styles.endButton} onPress={() => navigation.navigate('Rating', { recipeId: recipeId })}>
                    <Text style={styles.buttonText}>Tarifi bitir</Text>
                </TouchableOpacity>
            </View>
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
    },
    buttonContainer2: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 0,
        paddingBottom: 20,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    buttonText: {
        color:'white', 
        justifyContent:'center', 
        alignItems:'center', 
        fontSize:16
    },
    endButton: {
        width:"90%" ,
        height: 40,
        borderRadius:20,
        borderWidth: 1,
        marginBottom:10,
        justifyContent:'center', 
        alignItems:'center', 
        backgroundColor:colors.secondary,
    },
    timerButton: {
        borderRadius:20,
        borderWidth: 1,
        backgroundColor:colors.secondary,
        height:45,
        width:45,
        marginBottom: 10,
        alignItems:'center',
        justifyContent:'center'
    }

})