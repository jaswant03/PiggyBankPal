import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import BudgetScreen from './screens/BudgetScreen';
import ManualSpendingScreen from './screens/ManualSpendingScreen'; 
import ReceiptScreen from './screens/ReceiptScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Budget" component={BudgetScreen} />
                    <Stack.Screen name="ManualSpending" component={ManualSpendingScreen} />
                    <Stack.Screen name="Receipt" component={ReceiptScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </AuthProvider>
    );
}
