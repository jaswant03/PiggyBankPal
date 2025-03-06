import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import styles from '../styles/styles';
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
            {(!user.income || !user.budgetFrequency) ? (
                <View style={styles.buttonContainer}>
                    <Button title="Start Budgeting" onPress={() => navigation.navigate('Budget')} />
                </View>
            ) : (
                <>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoTitle}>Budget Snapshot:</Text>
                        {user.budgetFrequency === 'weekly' && (
                            <Text>Weekly Budget: ${Number(user.income).toFixed(2)}</Text>
                        )}
                        {user.budgetFrequency === 'bi-weekly' && (
                            <Text>Bi-Weekly Budget: ${Number(user.income).toFixed(2)}</Text>
                        )}
                        {user.budgetFrequency === 'monthly' && (
                            <Text>Monthly Budget: ${Number(user.income).toFixed(2)}</Text>
                        )}
                    </View>
                    {summary && (
                        <View style={styles.infoBox}>
                            <Text>Total Spent: ${summary.totalSpent.toFixed(2)}</Text>
                            <Text>Remaining Income: ${summary.remainingIncome.toFixed(2)}</Text>
                            {summary.budgets.map((b, idx) => (
                                <Text key={idx}>
                                    {b.category}: Allocated ${b.allocatedAmount}, Spent ${b.spent}, Remaining ${b.remaining}
                                </Text>
                            ))}
                        </View>
                    )}
                </>
            )}
            <Button title="Log Out" onPress={logout} />
        </View>
    );
}

