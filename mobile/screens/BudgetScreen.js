import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function BudgetScreen() {
    const { token } = useContext(AuthContext);
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
            <Text style={styles.title}>Budgets</Text>
            <View style={styles.form}>
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
            </View>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 22, marginBottom: 10, textAlign: 'center' },
    form: { marginBottom: 20 },
    input: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
        padding: 10, marginBottom: 10
    },
    subtitle: { fontSize: 18, marginBottom: 5 },
    budgetItem: {
        padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc'
    },
    budgetText: { fontSize: 16 }
});
