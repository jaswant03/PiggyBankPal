import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginBottom: 10,
    },
    buttonContainer: {
        marginBottom: 10,
    },
    infoBox: {
        marginVertical: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10
    },
    infoTitle: {
        fontWeight: 'bold',
        marginBottom: 5
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 5
    },
    budgetItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    budgetText: {
        fontSize: 16
    }
});
