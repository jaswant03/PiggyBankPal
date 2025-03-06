// mobile/screens/HomeScreen.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/styles'; // your shared styles, if any

export default function HomeScreen({ navigation }) {
    const { user, token, logout } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);

    // Action dropdown state
    const [actionOpen, setActionOpen] = useState(false);
    const [actionValue, setActionValue] = useState(null);
    const [actionItems, setActionItems] = useState([
        { label: 'Scan Receipt', value: 'scanReceipt' },
        { label: 'Add Manual Spending', value: 'manualSpending' },
        { label: 'Update Budget Settings', value: 'updateBudget' },
        { label: 'Logout', value: 'logout' },
    ]);

    // Timeline dropdown state
    const [timelineOpen, setTimelineOpen] = useState(false);
    const [timelineValue, setTimelineValue] = useState(user?.budgetFrequency || 'monthly');
    const [timelineItems, setTimelineItems] = useState([
        { label: 'Weekly', value: 'weekly' },
        { label: 'Bi-Weekly', value: 'bi-weekly' },
        { label: 'Monthly', value: 'monthly' },
    ]);

    // Fetch budget summary from backend (using timeline query)
    const fetchSummary = async (duration) => {
        try {
            const res = await fetch(`http://localhost:3000/api/budgets?timeline=${duration}`, {
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
        if (user && user.income && user.budgetFrequency) {
            fetchSummary(timelineValue);
        }
    }, [user, timelineValue]);

    // Handle header dropdown actions
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
        setActionValue(null); // reset dropdown to placeholder
    };

    return (
        <View style={stylesApp.screen}>
            {/* Header Bar */}
            <View style={stylesApp.headerBar}>
                <Text style={stylesApp.headerTitle}>PiggyBankPal</Text>
                <View style={stylesApp.actionDropdownContainer}>
                    <DropDownPicker
                        open={actionOpen}
                        value={actionValue}
                        items={actionItems}
                        setOpen={setActionOpen}
                        setValue={setActionValue}
                        setItems={setActionItems}
                        placeholder="Select Action"
                        style={stylesApp.actionDropdown}
                        dropDownContainerStyle={stylesApp.actionDropdownMenu}
                        onChangeValue={(val) => val && handleAction(val)}
                        zIndex={3000}
                        zIndexInverse={1000}
                    />
                </View>
            </View>

            {/* Main Content */}
            <View style={stylesApp.contentWrapper}>
                <Text style={stylesApp.greeting}>Welcome, {user?.name || 'User'}</Text>

                <View style={stylesApp.card}>
                    {(!user?.income || !user?.budgetFrequency) ? (
                        <Button title="Start Budgeting" onPress={() => navigation.navigate('Budget')} />
                    ) : (
                        <>
                            <Text style={stylesApp.subTitle}>Budget Snapshot</Text>
                            {/* Timeline Dropdown */}
                            <View style={stylesApp.timelineDropdownContainer}>
                                <DropDownPicker
                                    open={timelineOpen}
                                    value={timelineValue}
                                    items={timelineItems}
                                    setOpen={setTimelineOpen}
                                    setValue={setTimelineValue}
                                    setItems={setTimelineItems}
                                    placeholder="Select Timeline"
                                    style={stylesApp.timelineDropdown}
                                    dropDownContainerStyle={stylesApp.timelineDropdownMenu}
                                    zIndex={2500}
                                    zIndexInverse={1200}
                                    onChangeValue={(val) => setTimelineValue(val)}
                                />
                            </View>
                            {summary ? (
                                <View style={stylesApp.tableContainer}>
                                    <Text style={stylesApp.infoText}>
                                        {timelineValue.charAt(0).toUpperCase() + timelineValue.slice(1)} Income: $
                                        {summary.effectiveIncome.toFixed(2)}
                                    </Text>
                                    <Text style={stylesApp.infoText}>
                                        Total Spent: ${summary.totalSpent.toFixed(2)}
                                    </Text>
                                    <Text style={stylesApp.infoText}>
                                        Remaining Income: ${summary.remainingIncome.toFixed(2)}
                                    </Text>
                                    {/* Table Header */}
                                    <View style={stylesApp.tableHeader}>
                                        <Text style={[stylesApp.tableCell, stylesApp.tableHeaderText]}>
                                            Category
                                        </Text>
                                        <Text style={[stylesApp.tableCell, stylesApp.tableHeaderText]}>
                                            Allocated
                                        </Text>
                                        <Text style={[stylesApp.tableCell, stylesApp.tableHeaderText]}>
                                            Spent
                                        </Text>
                                        <Text style={[stylesApp.tableCell, stylesApp.tableHeaderText]}>
                                            Remaining
                                        </Text>
                                    </View>
                                    {summary.budgets.map((b, idx) => (
                                        <View key={idx} style={stylesApp.tableRow}>
                                            <Text style={stylesApp.tableCell}>{b.category}</Text>
                                            <Text style={stylesApp.tableCell}>${b.allocatedAmount}</Text>
                                            <Text style={stylesApp.tableCell}>${b.spent}</Text>
                                            <Text style={stylesApp.tableCell}>${b.remaining}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={stylesApp.infoText}>Loading snapshot...</Text>
                            )}
                        </>
                    )}
                </View>
            </View>
        </View>
    );
}

const stylesApp = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F3F4F7',
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0D6EFD',
        paddingHorizontal: 15,
        paddingVertical: 15,
        zIndex: 3000,
    },
    headerTitle: {
        flex: 1,
        fontSize: 22,
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    actionDropdownContainer: {
        position: 'relative',
        zIndex: 3000,
        width: 160,
    },
    actionDropdown: {
        borderColor: '#FFFFFF',
    },
    actionDropdownMenu: {
        borderColor: '#FFFFFF',
    },
    contentWrapper: {
        flex: 1,
        padding: 20,
    },
    greeting: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333333',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        zIndex: 1,
    },
    subTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#0D6EFD',
    },
    timelineDropdownContainer: {
        marginBottom: 15,
        position: 'relative',
        zIndex: 2500,
    },
    timelineDropdown: {
        borderColor: '#CCCCCC',
    },
    timelineDropdownMenu: {
        borderColor: '#CCCCCC',
    },
    infoText: {
        fontSize: 16,
        marginVertical: 4,
        color: '#444444',
    },
    tableContainer: {
        marginTop: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        padding: 8,
    },
    tableRow: {
        flexDirection: 'row',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    tableHeaderText: {
        fontWeight: 'bold',
    },
    tableCell: {
        flex: 1,
        fontSize: 14,
        color: '#444444',
    },
});
