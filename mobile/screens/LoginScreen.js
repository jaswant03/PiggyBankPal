import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import styles from '../styles/styles';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                login(data.token, data.user);
                navigation.replace('Home');
            } else {
                Alert.alert('Login failed', data.error || 'Unknown error');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not connect to server');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>PiggyBankPal - Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                onChangeText={setPassword}
            />
            <View style={styles.buttonContainer}>
                <Button title="Login" onPress={handleLogin} />
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Go to Signup" onPress={() => navigation.navigate('Signup')} />
            </View>
        </View>
    );
}


