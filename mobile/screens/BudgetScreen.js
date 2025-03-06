import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function BudgetScreen({ navigation }) {
    const { token, user, login } = useContext(AuthContext);
    const [income, setIncome] = useState(user?.income ? user.income.toString() : '');
    const [budgetFrequency, setBudgetFrequency] = useState(user?.budgetFrequency || '');
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
                    budgetFrequency: budgetFrequency.toLowerCase()
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
            <Text style={styles.subtitle}>Set Your Income and Budget Frequency</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your income"
                keyboardType="numeric"
                value={income}
                onChangeText={setIncome}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter frequency: weekly, bi-weekly, or monthly"
                value={budgetFrequency}
                onChangeText={setBudgetFrequency}
            />
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
                            {item.category} - Allocated: ${item.allocatedAmount}, Spent: ${item.spent}, Remaining: ${item.remaining}
                        </Text>
                    </View>
                )}
            />
            <Button title="Go Home" onPress={() => navigation.navigate('Home')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 22, marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 18, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 10, marginBottom: 10 },
    budgetItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
    budgetText: { fontSize: 16 }
});
