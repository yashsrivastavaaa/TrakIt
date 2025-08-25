import { jobs } from '@/config/jobs';
import { jobSchema } from '@/config/jobSchema';
import { eq, sql } from 'drizzle-orm';
import { router } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthContext } from '@/context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';



export default function ViewJobsScreen() {
    const insets = useSafeAreaInsets();

    const [jobList, setJobList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    const statusColors: { [key: string]: string } = {
        Applied: '#4CAF50',
        Interviewing: '#2196F3',
        Offered: '#FF9800',
        Rejected: '#F44336',
        Accepted: '#9C27B0',
    };

    const { userData } = useContext(AuthContext);

    const ThemedAlert = ({ visible, message, onClose }: { visible: boolean; message: string; onClose: () => void }) => {
        return (
            <Modal transparent visible={visible} animationType="fade">
                <View style={styles.alertOverlay}>
                    <View style={styles.alertBox}>
                        <Text style={styles.alertMessage}>{message}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.alertButton}>
                            <Text style={styles.alertButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const fetchJobs = async () => {
        const userEmail = userData.email;
        if (!userEmail) {
            setJobList([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const data = await jobs
                .select()
                .from(jobSchema)
                .where(eq(jobSchema.user_email, userEmail)).orderBy(sql`${jobSchema.job_id} DESC`);

            setJobList(data);
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setAlertTitle('Success');
            setAlertMessage('Job details deleted successfully.');
            setAlertVisible(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchJobs();
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchJobs();
        }, [])
    );

    const filteredJobs = jobList.filter((job) => {
        const query = searchQuery.toLowerCase();
        return (
            job.company_name.toLowerCase().includes(query) ||
            job.role.toLowerCase().includes(query)
        );
    });

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => {
                router.push({
                    pathname: './editScreen',
                    params: {
                        email: userData.email,
                        company_name: item.company_name,
                        status: item.status,
                        role: item.role,
                        date_applied: item.date_applied,
                        notes: item.notes,
                        ctc: item.ctc,
                        location: item.location,
                        techstacks: JSON.stringify(item.techstacks),
                        id: item.job_id,
                    },
                });
            }}
        >
            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.company}>{item.company_name}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: statusColors[item.status] || '#666' },
                        ]}
                    >
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>
                <Text style={styles.role}>{item.role}</Text>
                <Text style={styles.date}>Applied on: {item.date_applied}</Text>
                {item.notes ? <Text style={styles.notes}>📝 {item.notes}</Text> : null}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView
            edges={['top', 'bottom']}
            style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        >
            <Text style={styles.header}>My Job Applications</Text>

            <TextInput
                placeholder="Search by company or role"
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchBox}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#3D5AFE" />
            ) : filteredJobs.length === 0 ? (
                <Text style={styles.empty}>No jobs found. Pull to refresh.</Text>
            ) : (
                <FlatList
                    data={filteredJobs}
                    keyExtractor={(item) => item.job_id.toString()}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                    }
                    contentContainerStyle={{ paddingBottom: 30 }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#10192D',
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        alignSelf: 'center',
        marginTop: 20,
    },
    searchBox: {
        backgroundColor: '#1E293B',
        color: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 100,
        marginBottom: 15,
        fontSize: 16,
    },
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    company: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    role: {
        fontSize: 16,
        color: '#ccc',
        marginTop: 5,
    },
    date: {
        fontSize: 14,
        color: '#888',
        marginTop: 5,
    },
    notes: {
        fontSize: 14,
        color: '#aaa',
        marginTop: 10,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    empty: {
        color: '#aaa',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    }, alertOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    alertBox: {
        width: '80%',
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    alertMessage: { color: '#E5E7EB', fontSize: 16, textAlign: 'center', marginBottom: 15 },
    alertButton: {
        backgroundColor: '#3D5AFE',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    alertButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
