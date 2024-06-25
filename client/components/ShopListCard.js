import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

export default function ShopListCard({ id, itemName, amount, unit, ingredientNames, unitNames, onDelete, onAmountChange, recipeName, recipeNames }) {
  const checkIcon = <Feather name="check-circle" size={24} color={colors.primary} />;
  const emptyCircleIcon = <Feather name="circle" size={24} color={colors.primary} />;
  const plusIcon = <AntDesign name="plus" size={20} color="black" />;
  const minusIcon = <AntDesign name="minus" size={20} color="black" />;
  const [isChecked, setIsChecked] = useState(false);
  const displayedItemName = ingredientNames[itemName] || itemName;
  const displayedUnitName = unitNames[unit] || unit;
  const displayedRecipeName = recipeNames[recipeName] || recipeName;

  const handleIncrementAmount = () => {
    onAmountChange(amount + 1);
  };

  const handleDecrementAmount = () => {
    if (amount > 0) {
      onAmountChange(amount - 1);
    }
  };
 
  const handleCheckBoxPress = () => {
    setIsChecked(!isChecked);
    if (!isChecked) {
      onDelete();
      setIsChecked(isChecked);
    }
  };

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ margin: 8, backgroundColor: colors.fg, width: 360, height: 40, borderRadius: 15, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Text style={{ marginLeft: 5 }}>{displayedItemName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10, justifyContent: 'center', flex: 1 }}>
              <Pressable onPress={handleDecrementAmount}>
                <Text>{minusIcon}</Text>
              </Pressable>
              <Text>{amount} {displayedUnitName}</Text>
              <Pressable onPress={handleIncrementAmount}>
                <Text>{plusIcon}</Text>
              </Pressable>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
            <Pressable onPress={handleCheckBoxPress}>
              <Text>{isChecked ? checkIcon : emptyCircleIcon}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
