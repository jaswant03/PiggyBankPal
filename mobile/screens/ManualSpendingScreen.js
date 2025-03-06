import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/styles';

export default function ManualSpendingScreen({ navigation }) {
    const { token } = useContext(AuthContext);
    const [budgets, setBudgets] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [spendingAmount, setSpendingAmount] = useState('');

    // Fetch the existing budget categories
    const fetchBudgets = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/budgets', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setBudgets(data.budgets || []);
                if (data.budgets && data.budgets.length > 0 && !selectedCategory) {
                    setSelectedCategory(data.budgets[0].category);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    const handleAddSpending = async () => {
        if (!selectedCategory) {
            Alert.alert('Error', 'Please select a category');
            return;
        }
        if (!spendingAmount) {
            Alert.alert('Error', 'Please enter an amount');
            return;
        }
        try {
            const res = await fetch('http://localhost:3000/api/spending', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    category: selectedCategory,
                    amount: parseFloat(spendingAmount)
                })
            });
            const data = await res.json();
            if (res.ok) {
                Alert.alert('Success', 'Manual spending added');
                setSpendingAmount('');
                fetchBudgets(); // refresh budgets if needed
            } else {
                Alert.alert('Error', data.error || 'Unknown error');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not connect to server');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add Manual Spending</Text>

            <Text style={styles.label}>Select Category:</Text>
            <Picker
                selectedValue={selectedCategory}
                onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                style={styles.input}
                mode="dropdown"
            >
                {budgets.map((b) => (
                    <Picker.Item key={b.category} label={b.category} value={b.category} />
                ))}
            </Picker>

            <TextInput
                style={styles.input}
                placeholder="Enter spending amount"
                keyboardType="numeric"
                value={spendingAmount}
                onChangeText={setSpendingAmount}
            />
            <Button title="Add Spending" onPress={handleAddSpending} />
            <View style={styles.spacer} />
            <Button title="Go Home" onPress={() => navigation.navigate('Home')} />

            {/* Optionally show current manual spendings if desired */}
            <Text style={styles.subtitle}>Existing Budgets:</Text>
            <FlatList
                data={budgets}
                keyExtractor={(item) => item.category}
                renderItem={({ item }) => (
                    <View style={styles.budgetItem}>
                        <Text style={styles.budgetText}>
                            {item.category}: Allocated ${item.allocatedAmount}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
}

