import { AuthContext } from '@/context/AuthContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileScreen() {
    const router = useRouter();
    const { userData, setUserData } = useContext(AuthContext);

    const [error, setError] = useState<string | null>(null);

    const handleSignOut = async () => {
        try {
            await AsyncStorage.removeItem('userData');
            setUserData('test');
            router.replace('/signin');
        } catch (e) {
            setError('Error signing out. Please try again later.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <AntDesign name="user" size={40} color="#3D5AFE" />
                    </View>
                    <Text style={styles.username}>{userData.name}</Text>
                    <Text style={styles.email}>{userData.email}</Text>
                </View>

                <View style={styles.grid}>
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push('/platform/screens/editProfileScreen')}
                    >
                        <MaterialIcons name="edit" size={24} color="#3D5AFE" />
                        <Text style={styles.cardText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => router.push('/platform/screens/changePassword')}
                    >
                        <AntDesign name="lock" size={24} color="#3D5AFE" />
                        <Text style={styles.cardText}>Change Password</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.card, styles.logoutCard]}
                    onPress={handleSignOut}
                >
                    <AntDesign name="logout" size={24} color="#FF4D4D" />
                    <Text style={[styles.cardText, { color: '#FF4D4D' }]}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* 🔔 Themed Alert */}
            <Modal
                transparent
                visible={!!error}
                animationType="fade"
                onRequestClose={() => setError(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.alertBox}>
                        <Text style={styles.alertTitle}>⚠️ Error</Text>
                        <Text style={styles.alertMessage}>{error}</Text>
                        <TouchableOpacity
                            style={styles.alertButton}
                            onPress={() => setError(null)}
                        >
                            <Text style={styles.alertButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#10192D',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 30,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#3D5AFE',
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    email: {
        fontSize: 14,
        color: '#AAAAAA',
        marginTop: 4,
    },
    grid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 20,
    },
    card: {
        width: 140,
        height: 140,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    logoutCard: {
        width: '80%',
        height: 80,
        marginTop: 10,
        borderColor: '#FF4D4D',
        borderWidth: 1,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardText: {
        color: '#FFFFFF',
        fontSize: 14,
        marginTop: 10,
        textAlign: 'center',
    },
    // 🎨 Alert Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBox: {
        width: '80%',
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    alertTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF4D4D',
        marginBottom: 10,
    },
    alertMessage: {
        fontSize: 14,
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 20,
    },
    alertButton: {
        backgroundColor: '#3D5AFE',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    alertButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});
