import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
    const { user, token, logout } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);

    // Dropdown for top actions
    const [actionOpen, setActionOpen] = useState(false);
    const [actionValue, setActionValue] = useState(null);
    const [actionItems, setActionItems] = useState([
        { label: 'Scan Receipt', value: 'scanReceipt' },
        { label: 'Add Manual Spending', value: 'manualSpending' },
        { label: 'Update Budget', value: 'updateBudget' },
        { label: 'Logout', value: 'logout' },
    ]);

    // Dropdown for snapshot frequency
    const [freqOpen, setFreqOpen] = useState(false);
    const [freqValue, setFreqValue] = useState(user?.budgetFrequency || 'monthly');
    const [freqItems, setFreqItems] = useState([
        { label: 'Weekly', value: 'weekly' },
        { label: 'Bi-Weekly', value: 'bi-weekly' },
        { label: 'Monthly', value: 'monthly' },
    ]);

    const fetchSummary = async (freq) => {
        try {
            const res = await fetch(`http://localhost:3000/api/budgets?timeline=${freq}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
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
        if (user?.income && user?.budgetFrequency) {
            fetchSummary(freqValue);
        }
    }, [user, freqValue]);

    const handleAction = (val) => {
        switch (val) {
            case 'scanReceipt':
                navigation.navigate('Receipt');
                break;
            case 'manualSpending':
                navigation.navigate('ManualSpending');
                break;
            case 'updateBudget':
                navigation.navigate('Budget');
                break;
            case 'logout':
                logout();
                break;
            default:
                break;
        }
        setActionValue(null);
    };

    return (
        <View style={styles.screen}>
            {/* AppBar */}
            <View style={styles.appBar}>
                <Text style={styles.appBarTitle}>PiggyBankPal</Text>
                <View style={styles.actionDropdown}>
                    <DropDownPicker
                        open={actionOpen}
                        value={actionValue}
                        items={actionItems}
                        setOpen={setActionOpen}
                        setValue={setActionValue}
                        setItems={setActionItems}
                        placeholder="Actions"
                        style={styles.dropdownStyle}
                        dropDownContainerStyle={styles.dropdownContainer}
                        onChangeValue={(val) => handleAction(val)}
                        zIndex={3000}
                        zIndexInverse={1000}
                    />
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {!user?.income ? (
                    <Text style={styles.infoText}>
                        Please set your income in the Budget Setup first.
                    </Text>
                ) : (
                    <>
                        <View style={styles.headerRow}>
                            <Text style={styles.greeting}>
                                Hello, {user?.name || 'User'}
                            </Text>
                            <View style={{ width: 150 }}>
                                <DropDownPicker
                                    open={freqOpen}
                                    value={freqValue}
                                    items={freqItems}
                                    setOpen={setFreqOpen}
                                    setValue={setFreqValue}
                                    setItems={setFreqItems}
                                    placeholder="Snapshot"
                                    style={styles.freqDropdown}
                                    dropDownContainerStyle={styles.dropdownContainer}
                                    zIndex={2500}
                                    zIndexInverse={1200}
                                />
                            </View>
                        </View>

                        {/* Summary Card */}
                        {summary ? (
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>
                                    {freqValue.charAt(0).toUpperCase() + freqValue.slice(1)} Income: ${summary.effectiveIncome?.toFixed(2)}
                                </Text>
                                <Text style={styles.summaryText}>
                                    Total Spent: ${summary.totalSpent?.toFixed(2)}
                                </Text>
                                <Text style={styles.summaryText}>
                                    Remaining Income: ${summary.remainingIncome?.toFixed(2)}
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.infoText}>Loading your summary...</Text>
                        )}

                        {/* Category Cards */}
                        <View style={styles.categoryContainer}>
                            {summary?.budgets?.map((b, idx) => {
                                // For better clarity, scale allocated if you want
                                // e.g. let scaledAlloc = b.allocatedAmount * scaleFactor
                                // but let's just show the allocated, spent, remaining from the summary
                                return (
                                    <View key={idx} style={styles.categoryCard}>
                                        <Text style={styles.categoryTitle}>{b.category}</Text>
                                        <Text style={styles.categoryAllocated}>
                                            Allocated: ${b.allocatedAmount.toFixed(2)}
                                        </Text>
                                        <Text style={styles.categorySpent}>
                                            Spent: ${b.spent.toFixed(2)}
                                        </Text>
                                        <Text style={styles.categoryRemaining}>
                                            Remaining: ${b.remaining.toFixed(2)}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Add Spending Button */}
                        <TouchableOpacity
                            style={styles.addSpendingBtn}
                            onPress={() => navigation.navigate('ManualSpending')}
                        >
                            <Text style={styles.addSpendingBtnText}>Add Manual Spending</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F2F1FE',
    },
    appBar: {
        flexDirection: 'row',
        backgroundColor: '#7B61FF',
        paddingHorizontal: 15,
        paddingVertical: 15,
        alignItems: 'center',
        zIndex: 3000,
    },
    appBarTitle: {
        flex: 1,
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
    },
    actionDropdown: {
        width: 130,
        zIndex: 3000,
    },
    dropdownStyle: {
        borderColor: '#FFFFFF',
    },
    dropdownContainer: {
        borderColor: '#FFFFFF',
        zIndex: 9999,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        zIndex: 2500,
    },
    greeting: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    freqDropdown: {
        borderColor: '#ccc',
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 5,
        color: '#7B61FF',
    },
    summaryText: {
        fontSize: 16,
        marginVertical: 2,
        color: '#333',
    },
    infoText: {
        fontSize: 16,
        color: '#666',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        // shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#444',
    },
    categoryAllocated: {
        fontSize: 14,
        color: '#444',
    },
    categorySpent: {
        fontSize: 14,
        color: '#D9534F', // red-ish
    },
    categoryRemaining: {
        fontSize: 14,
        color: '#5CB85C', // green-ish
    },
    addSpendingBtn: {
        backgroundColor: '#7B61FF',
        borderRadius: 8,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    addSpendingBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
