import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
    const { user, token, logout } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);

    const fetchSummary = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/budgets', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setSummary(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {user?.name}</Text>
            {summary && (
                <View style={styles.infoBox}>
                    <Text>Monthly Income: ${summary.monthlyIncome.toFixed(2)}</Text>
                    <Text>Total Spent: ${summary.totalSpent.toFixed(2)}</Text>
                    <Text>Remaining Income: ${summary.remainingIncome.toFixed(2)}</Text>
                </View>
            )}
            <Button title="Budgets" onPress={() => navigation.navigate('Budget')} />
            <Button title="Upload Receipt" onPress={() => navigation.navigate('Receipt')} />
            <Button title="Log Out" onPress={logout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    infoBox: {
        marginVertical: 20, padding: 10,
        borderWidth: 1, borderColor: '#ccc', borderRadius: 4
    }
});
