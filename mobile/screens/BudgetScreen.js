import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/styles';

export default function BudgetScreen({ navigation }) {
    const { token, user, login } = useContext(AuthContext);
    const [income, setIncome] = useState(user?.income ? user.income.toString() : '');
    const [budgetFrequency, setBudgetFrequency] = useState(user?.budgetFrequency || 'monthly');
    const [category, setCategory] = useState('');
    const [allocatedAmount, setAllocatedAmount] = useState('');
    const [budgets, setBudgets] = useState([]);

    const getBudgets = async () => {
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
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getBudgets();
    }, []);

    const updateProfile = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/auth/updateProfile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    income: parseFloat(income),
                    budgetFrequency
                })
            });
            const data = await res.json();
            if (res.ok) {
                login(token, data.user);
                Alert.alert('Success', 'Profile updated');
            } else {
                Alert.alert('Error', data.error || 'Unknown error');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not connect to server');
        }
    };

    const handleSetBudget = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/budgets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    category,
                    allocatedAmount: parseFloat(allocatedAmount) || 0
                })
            });
            if (res.ok) {
                Alert.alert('Success', 'Budget set/updated');
                setCategory('');
                setAllocatedAmount('');
                getBudgets();
            } else {
                const data = await res.json();
                Alert.alert('Error', data.error || 'Unknown error');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not connect to server');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Budget Setup</Text>
            <Text style={styles.subtitle}>Set Your Income and Pay Frequency</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your income"
                keyboardType="numeric"
                value={income}
                onChangeText={setIncome}
            />
            <Text style={styles.label}>Pay Frequency:</Text>
            <Picker
                selectedValue={budgetFrequency}
                onValueChange={(itemValue) => setBudgetFrequency(itemValue)}
                style={styles.input}
                mode="dropdown">
                <Picker.Item label="Weekly" value="weekly" />
                <Picker.Item label="Bi-Weekly" value="bi-weekly" />
                <Picker.Item label="Monthly" value="monthly" />
            </Picker>
            <Button title="Update Profile" onPress={updateProfile} />

            <Text style={styles.subtitle}>Set Category Budgets</Text>
            <TextInput
                style={styles.input}
                placeholder="Category (e.g. Groceries)"
                value={category}
                onChangeText={setCategory}
            />
            <TextInput
                style={styles.input}
                placeholder="Allocated Amount"
                keyboardType="numeric"
                value={allocatedAmount}
                onChangeText={setAllocatedAmount}
            />
            <Button title="Set/Update Budget" onPress={handleSetBudget} />

            <Text style={styles.subtitle}>Current Budgets:</Text>
            <FlatList
                data={budgets}
                keyExtractor={(item) => item.category}
                renderItem={({ item }) => (
                    <View style={styles.budgetItem}>
                        <Text style={styles.budgetText}>
                            {item.category}: Allocated ${item.allocatedAmount}, Spent ${item.spent}, Remaining ${item.remaining}
                        </Text>
                    </View>
                )}
            />
            <Button title="Go Home" onPress={() => navigation.navigate('Home')} />
        </View>
    );
}


