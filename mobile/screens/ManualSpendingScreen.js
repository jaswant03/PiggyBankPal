// mobile/screens/ManualSpendingScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, FlatList, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';

export default function ManualSpendingScreen({ navigation }) {
    const { token } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [spendingAmount, setSpendingAmount] = useState('');

    // Fetch the full budget summary (which includes merged spending)
    const fetchBudgetSummary = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/budgets', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                setSummary(data);
                if (data.budgets && data.budgets.length > 0 && !selectedCategory) {
                    setSelectedCategory(data.budgets[0].category);
                }
            } else {
                Alert.alert('Error', data.error || 'Unknown error');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not connect to server');
        }
    };

    useEffect(() => {
        fetchBudgetSummary();
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
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    category: selectedCategory,
                    amount: parseFloat(spendingAmount),
                }),
            });
            const data = await res.json();
            if (res.ok) {
                Alert.alert('Success', 'Manual spending added');
                setSpendingAmount('');
                fetchBudgetSummary();
            } else {
                Alert.alert('Error', data.error || 'Unknown error');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not connect to server');
        }
    };

    return (
        <View style={msStyles.container}>
            <Text style={msStyles.title}>Add Manual Spending</Text>

            <Text style={msStyles.label}>Select Category:</Text>
            {summary && summary.budgets && summary.budgets.length > 0 ? (
                <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                    style={msStyles.input}
                    mode="dropdown"
                >
                    {summary.budgets.map((b) => (
                        <Picker.Item key={b.category} label={b.category} value={b.category} />
                    ))}
                </Picker>
            ) : (
                <Text>No budget categories found.</Text>
            )}

            <TextInput
                style={msStyles.input}
                placeholder="Enter spending amount"
                keyboardType="numeric"
                value={spendingAmount}
                onChangeText={setSpendingAmount}
            />
            <Button title="Add Spending" onPress={handleAddSpending} />

            <View style={msStyles.spacer} />
            <Button title="Go Home" onPress={() => navigation.navigate('Home')} />

            <Text style={msStyles.subtitle}>Current Budgets:</Text>
            {summary && summary.budgets && summary.budgets.length > 0 ? (
                <View style={msStyles.table}>
                    <View style={msStyles.tableHeader}>
                        <Text style={[msStyles.tableCell, msStyles.headerText]}>Category</Text>
                        <Text style={[msStyles.tableCell, msStyles.headerText]}>Allocated</Text>
                        <Text style={[msStyles.tableCell, msStyles.headerText]}>Spent</Text>
                        <Text style={[msStyles.tableCell, msStyles.headerText]}>Remaining</Text>
                    </View>
                    {summary.budgets.map((b, idx) => (
                        <View key={idx} style={msStyles.tableRow}>
                            <Text style={msStyles.tableCell}>{b.category}</Text>
                            <Text style={msStyles.tableCell}>${b.allocatedAmount}</Text>
                            <Text style={msStyles.tableCell}>${b.spent}</Text>
                            <Text style={msStyles.tableCell}>${b.remaining}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text>No budgets found.</Text>
            )}
        </View>
    );
}

const msStyles = StyleSheet.create({
    container: {
        flex: 1, padding: 20, backgroundColor: '#f3f4f7',
    },
    title: {
        fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center',
    },
    label: {
        fontSize: 16, marginBottom: 5,
    },
    input: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
        padding: 10, marginBottom: 10, width: '100%',
    },
    spacer: { height: 10 },
    subtitle: {
        fontSize: 18, fontWeight: '600', marginVertical: 10,
    },
    table: {
        width: '100%', marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row', backgroundColor: '#f0f0f0',
        padding: 8,
    },
    tableRow: {
        flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee',
        padding: 8,
    },
    headerText: {
        fontWeight: 'bold',
    },
    tableCell: {
        flex: 1, fontSize: 14,
    },
});
