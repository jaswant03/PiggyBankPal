import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerPicker: {
        width: 120
    },
    greeting: {
        fontSize: 24,
        textAlign: 'center',
        marginVertical: 10
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    label: {
        fontSize: 16,
        marginRight: 10
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
    spacer: {
        height: 10
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
    manualContainer: {
        marginVertical: 10
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5
    },
    budgetItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    budgetText: {
        fontSize: 16
    },
    updateContainer: {
        marginVertical: 10
    },
    picker: {
        flex: 1
    },
    imagePreview: {
        width: 300,
        height: 300,
        marginVertical: 10
    },
    resultBox: {
        marginTop: 20, padding: 10,
        borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
        width: '100%'
    }
});
