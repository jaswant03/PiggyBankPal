import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';

export default function ManualSpendingScreen({ navigation }) {
    const { token } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [spendingAmount, setSpendingAmount] = useState('');

    // Fetch the full budget summary (which includes manual spending)
    const fetchBudgetSummary = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/budgets', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            console.log("Budget summary fetched:", data);
            if (res.ok) {
                setSummary(data);
                // If no category selected yet, default to first one (if available)
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
        const amountNumber = parseFloat(spendingAmount);
        if (isNaN(amountNumber)) {
            Alert.alert('Error', 'Invalid amount');
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
                    amount: amountNumber,
                }),
            });
            const data = await res.json();
            console.log("Manual spending response:", data);
            if (res.ok) {
                Alert.alert('Success', 'Manual spending added');
                setSpendingAmount('');
                // Refresh the summary so that the updated spending shows up
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
        <View style={styles.container}>
            <Text style={styles.title}>Add Manual Spending</Text>

            {summary && summary.budgets && summary.budgets.length > 0 ? (
                <>
                    <Text style={styles.label}>Select Category:</Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={selectedCategory}
                            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                            style={styles.picker}
                            mode="dropdown"
                        >
                            {summary.budgets.map((b) => (
                                <Picker.Item key={b.category} label={b.category} value={b.category} />
                            ))}
                        </Picker>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter spending amount"
                        keyboardType="numeric"
                        value={spendingAmount}
                        onChangeText={setSpendingAmount}
                    />
                    <View style={styles.btn}>
                        <Button title="Add Spending" onPress={handleAddSpending} color="#7B61FF" />
                    </View>

                    <View style={styles.btn}>
                        <Button title="Go Home" onPress={() => navigation.navigate('Home')} />
                    </View>

                    <Text style={styles.subtitle}>Updated Budgets:</Text>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableCell, styles.headerText]}>Category</Text>
                        <Text style={[styles.tableCell, styles.headerText]}>Allocated</Text>
                        <Text style={[styles.tableCell, styles.headerText]}>Spent</Text>
                        <Text style={[styles.tableCell, styles.headerText]}>Remaining</Text>
                    </View>
                    {summary.budgets.map((b, idx) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={styles.tableCell}>{b.category}</Text>
                            <Text style={styles.tableCell}>${b.allocatedAmount.toFixed(2)}</Text>
                            <Text style={styles.tableCell}>${b.spent.toFixed(2)}</Text>
                            <Text style={styles.tableCell}>${b.remaining.toFixed(2)}</Text>
                        </View>
                    ))}
                </>
            ) : (
                <Text>No budget categories found. Please set them first.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, padding: 20, backgroundColor: '#F2F1FE',
    },
    title: {
        fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333',
    },
    label: {
        fontSize: 16, marginBottom: 5, color: '#333',
    },
    pickerWrapper: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginBottom: 10,
    },
    picker: {
        width: '100%',
    },
    input: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
        padding: 10, marginBottom: 10,
    },
    btn: {
        marginVertical: 5,
    },
    subtitle: {
        fontSize: 18, fontWeight: '600', marginVertical: 10, color: '#7B61FF',
    },
    tableHeader: {
        flexDirection: 'row', backgroundColor: '#eee', padding: 8,
    },
    tableRow: {
        flexDirection: 'row', padding: 8, borderBottomWidth: 1, borderBottomColor: '#ddd',
    },
    headerText: {
        fontWeight: 'bold',
    },
    tableCell: {
        flex: 1, fontSize: 14, color: '#444',
    },
});
