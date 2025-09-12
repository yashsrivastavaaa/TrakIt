import { AuthContext } from '@/context/AuthContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
    Alert,
    Linking, // Import Linking API
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// --- ICONS MAPPING ---
const ICONS = {
    // Account
    edit: <MaterialIcons name="edit" size={22} color="#A9B2C3" />,
    lock: <AntDesign name="lock" size={22} color="#A9B2C3" />,

    // Upcoming
    ai: <Feather name="cpu" size={22} color="#A9B2C3" />,           // AI Integration
    feedback: <Feather name="message-square" size={22} color="#A9B2C3" />, // Company Feedback
    briefcase: <Feather name="briefcase" size={22} color="#A9B2C3" />,     // Job Posting Update

    // Credits
    user: <Feather name="user" size={22} color="#A9B2C3" />,
    mail: <Feather name="mail" size={22} color="#A9B2C3" />,
    github: <Feather name="github" size={22} color="#A9B2C3" />,

    // Danger Zone
    delete: <MaterialIcons name="delete-sweep" size={22} color="#FF5A5F" />,

    // General
    chevron: <Feather name="chevron-right" size={22} color="#56698F" />,
    logout: <AntDesign name="logout" size={20} color="#FF5A5F" />,
};


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

    const handleDeleteData = async () => {
        Alert.alert(
            'Delete All Data',
            'This will remove all your saved data from this device. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            setUserData(null);
                            router.replace('/signin');
                        } catch (e) {
                            setError('Failed to delete data.');
                        }
                    },
                },
            ]
        );
    };

    // Helper to open links safely
    const openLink = async (url: string) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert(`Don't know how to open this URL: ${url}`);
        }
    };

    // Helper component for list items to keep the main return clean
    const ProfileListItem = ({ icon, label, onPress, isDestructive = false }: any) => (
        <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
            <View style={styles.rowLeft}>
                {icon}
                <Text style={[styles.rowLabel, isDestructive && styles.destructiveText]}>
                    {label}
                </Text>
            </View>
            {/* Show chevron only for tappable, non-destructive items */}
            {onPress && !isDestructive && ICONS.chevron}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <AntDesign name="user" size={40} color="#E2E8F0" />
                    </View>
                    <Text style={styles.username}>{userData.name}</Text>
                    <Text style={styles.email}>{userData.email}</Text>
                </View>

                {/* --- Account Section --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.sectionBody}>
                        <ProfileListItem
                            icon={ICONS.edit}
                            label="Edit Profile"
                            onPress={() => router.push('/platform/screens/editProfileScreen')}
                        />
                        <View style={styles.divider} />
                        <ProfileListItem
                            icon={ICONS.lock}
                            label="Change Password"
                            onPress={() => router.push('/platform/screens/changePassword')}
                        />
                    </View>
                </View>

                {/* --- Upcoming Features Section --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Upcoming Features</Text>
                    <View style={styles.sectionBody}>
                        <ProfileListItem icon={ICONS.ai} label="AI Integration" />
                        <View style={styles.divider} />
                        <ProfileListItem icon={ICONS.feedback} label="Company Feedback" />
                        <View style={styles.divider} />
                        <ProfileListItem icon={ICONS.briefcase} label="Job Posting Update" />
                    </View>
                </View>


                {/* --- Credit & Contact Section --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Credit & Contact</Text>
                    <View style={styles.sectionBody}>
                        <ProfileListItem icon={ICONS.user} label="Yash Srivastava" />
                        <View style={styles.divider} />
                        <ProfileListItem
                            icon={ICONS.mail}
                            label="yashsrivns@gmail.com"
                            onPress={() => openLink('mailto:yashsrivns@gmail.com')}
                        />
                        <View style={styles.divider} />
                        <ProfileListItem
                            icon={ICONS.github}
                            label="GitHub Profile"
                            onPress={() => openLink('https://github.com/yashsrivastavaaa/')}
                        />
                    </View>
                </View>

                {/* --- Danger Zone Section --- */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Danger Zone</Text>
                    <View style={styles.sectionBody}>
                        <ProfileListItem
                            icon={ICONS.delete}
                            label="Clear All Data"
                            onPress={handleDeleteData}
                            isDestructive
                        />
                    </View>
                </View>

                {/* --- Logout Button --- */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                    {ICONS.logout}
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>

                <View style={{ marginBottom: 50 }}></View>

                {/* Error Alert Modal (Unchanged) */}
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
            </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A', // A darker, richer blue
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginVertical: 30,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 3,
        borderColor: '#38BDF8', // A brighter accent color
    },
    username: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F1F5F9', // Off-white for better readability
    },
    email: {
        fontSize: 16,
        color: '#94A3B8', // Lighter gray for subtext
        marginTop: 6,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        marginBottom: 12,
        marginLeft: 4,
    },
    sectionBody: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 18,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowLabel: {
        fontSize: 16,
        color: '#E2E8F0',
        marginLeft: 16,
    },
    destructiveText: {
        color: '#FF5A5F', // A slightly softer red
    },
    divider: {
        height: 1,
        backgroundColor: '#334155',
        marginHorizontal: 16,
    },
    logoutButton: {
        marginTop: 10,
        backgroundColor: '#1E293B',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF5A5F',
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF5A5F',
        marginLeft: 10,
    },

    // --- Modal Styles (Slightly polished) ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBox: {
        width: '85%',
        maxWidth: 350,
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
        borderTopWidth: 4,
        borderTopColor: '#FF5A5F',
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F1F5F9',
        marginBottom: 12,
    },
    alertMessage: {
        fontSize: 15,
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    alertButton: {
        backgroundColor: '#38BDF8',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
    },
    alertButtonText: {
        color: '#0F172A',
        fontSize: 16,
        fontWeight: 'bold',
    },
});