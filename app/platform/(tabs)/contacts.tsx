import { contact } from '@/config/contact';
import { contactSchema } from '@/config/contactSchema';
import { AuthContext } from '@/context/AuthContext';
import Feather from '@expo/vector-icons/Feather';
import { eq } from 'drizzle-orm';
import { useFocusEffect, useRouter } from 'expo-router'; // 1. Import useFocusEffect
import React, { useCallback, useContext, useMemo, useState } from 'react'; // 2. Import useCallback
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// --- TYPE DEFINITION (based on contactSchema) ---
type Contact = {
    id: number;
    name: string;
    email: string;
    phone_number?: string | null;
    company?: string | null;
    user_email?: string | null;
};

// --- HELPER FUNCTION ---
// Creates initials from a name (e.g., "Yash Srivastava" -> "YS")
const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
};

export default function ContactsScreen() {
    const router = useRouter();
    const { userData } = useContext(AuthContext);

    const [isLoading, setIsLoading] = useState(true);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // --- 3. Replaced useEffect with useFocusEffect ---
    // This hook re-runs the data fetching logic every time the screen comes into focus.
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                if (!userData?.email) {
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);
                try {
                    const userContacts = await contact
                        .select()
                        .from(contactSchema)
                        .where(eq(contactSchema.user_email, userData.email));

                    setContacts(userContacts);
                } catch (error) {
                    console.error("Failed to fetch contacts:", error);
                    // Clear contacts on error to avoid showing stale data
                    setContacts([]);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchData();
        }, [userData]) // Dependency array ensures the function has the latest userData
    );

    const filteredContacts = useMemo(() => {
        if (!searchQuery) {
            return contacts;
        }
        return contacts.filter(contact =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchQuery.toLowerCase()) || contact.phone_number?.includes(searchQuery) || contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [contacts, searchQuery]);

    const renderContactItem = ({ item }: { item: Contact }) => (
        <TouchableOpacity
            style={styles.contactCard}
            onPress={() => {
                router.push({
                    pathname: '/platform/screens/editContacts', // Corrected pathname from previous context
                    params: {
                        contactData: JSON.stringify(item),
                    },
                });
            }}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
            </View>
            <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactDetail}>{item.email}</Text>
            </View>
            <Feather name="chevron-right" size={22} color="#56698F" />
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#38BDF8" />
                <Text style={styles.loadingText}>Loading Contacts...</Text>
            </View>
        );
    }

    if (contacts.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Contacts</Text>
                </View>
                <View style={styles.centerContent}>
                    <Feather name="users" size={80} color="#334155" />
                    <Text style={styles.emptyTitle}>No Contacts Found</Text>
                    <Text style={styles.emptySubtitle}>Add your first contact to get started.</Text>
                    <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/platform/screens/addContact')}>
                        <Feather name="plus-circle" size={20} color="#0F172A" />
                        <Text style={styles.emptyButtonText}>Add New Contact</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.title}>Contacts</Text>
            </View>

            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or email..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredContacts}
                renderItem={renderContactItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={[styles.centerContent, { paddingTop: 50 }]}>
                        <Text style={styles.emptySubtitle}>No contacts match your search.</Text>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab} onPress={() => router.push('/platform/screens/addContact')}>
                <Feather name="plus" size={28} color="#0F172A" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#94A3B8',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#F1F5F9',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        borderRadius: 12,
        marginHorizontal: 24,
        marginBottom: 10,
        paddingHorizontal: 16,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#F1F5F9',
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 80,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: '#E2E8F0',
        fontSize: 18,
        fontWeight: 'bold',
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#F1F5F9',
    },
    contactDetail: {
        fontSize: 14,
        color: '#94A3B8',
        marginTop: 4,
    },
    fab: {
        position: 'absolute',
        bottom: 90,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#38BDF8',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#F1F5F9',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#38BDF8',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#0F172A',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
});