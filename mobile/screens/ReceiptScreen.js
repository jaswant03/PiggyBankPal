import React, { useState, useContext } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';

export default function ReceiptScreen() {
    const { token } = useContext(AuthContext);
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);

    const pickImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            Alert.alert('Permission needed', 'Allow gallery access to pick an image.');
            return;
        }
        const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true });
        if (!res.canceled && res.assets?.length > 0) {
            setImage(res.assets[0].uri);
        }
    };

    const uploadReceipt = async () => {
        if (!image) {
            Alert.alert('No image selected', 'Pick an image first');
            return;
        }
        const formData = new FormData();
        formData.append('receipt', {
            uri: image,
            name: 'receipt.jpg',
            type: 'image/jpeg'
        });

        try {
            const res = await fetch('http://localhost:3000/api/receipts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setResult(data);
            } else {
                Alert.alert('Error', data.error || 'Server error');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not connect to server');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Upload Receipt</Text>
            <Button title="Pick Image" onPress={pickImage} />
            {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
            <Button title="Upload" onPress={uploadReceipt} />
            {result && (
                <View style={styles.resultBox}>
                    <Text>Receipt ID: {result.receiptId}</Text>
                    <Text>Total: ${result.totalAmount.toFixed(2)}</Text>
                    {result.items.map((item, idx) => (
                        <Text key={idx}>
                            {item.name} - ${item.price.toFixed(2)} ({item.category})
                        </Text>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, alignItems: 'center' },
    title: { fontSize: 22, marginVertical: 10 },
    imagePreview: { width: 300, height: 300, marginVertical: 10 },
    resultBox: {
        marginTop: 20, padding: 10,
        borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
        width: '100%'
    }
});
