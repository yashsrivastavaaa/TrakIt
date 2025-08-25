// components/ThemedAlert.tsx
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ThemedAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
}

const ThemedAlert: React.FC<ThemedAlertProps> = ({ visible, title, message, onClose }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default ThemedAlert;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: 'rgb(16,25,45)', // matches your dark theme
        borderRadius: 20,
        padding: 25,
        width: '80%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#ccc',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#3D5AFE',
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 25,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});
