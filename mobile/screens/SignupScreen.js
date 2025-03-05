import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function SignupScreen({ navigation }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [monthlyIncome, setMonthlyIncome] = useState('');

    const handleSignup = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    monthlyIncome: parseFloat(monthlyIncome) || 0
                })
            });
            const data = await res.json();
            if (res.ok) {
                Alert.alert('Success', 'User created, please log in.');
                navigation.navigate('Login');
            } else {
                Alert.alert('Signup failed', data.error || 'Unknown error');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not connect to server');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>PiggyBankPal - Signup</Text>
            <TextInput style={styles.input} placeholder="Name" onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} />
            <TextInput style={styles.input} placeholder="Monthly Income" keyboardType="numeric" onChangeText={setMonthlyIncome} />
            <Button title="Sign Up" onPress={handleSignup} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    input: {
        borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
        padding: 10, marginBottom: 10
    }
});
