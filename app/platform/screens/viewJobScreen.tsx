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

import { AuthContext } from '@/context/AuthContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ViewJobsScreen() {
    const insets = useSafeAreaInsets();

    const [jobList, setJobList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [statusFilterVisible, setStatusFilterVisible] = useState(false);

    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    const statuses = [
        'No Filter',
        'Yet to Apply',
        'Applied',
        'Shortlisted',
        'Assessment Completed',
        'Interview Scheduled',
        'Interviewing',
        'Offered',
        'Accepted',
        'Rejected',
        'Withdrawn',
    ];

    const statusColors: { [key: string]: string } = {
        'Yet to Apply': '#9E9E9E',
        'Applied': '#4CAF50',
        'Shortlisted': '#03A9F4',
        'Assessment Completed': '#FFC107',
        'Interview Scheduled': '#00BCD4',
        'Interviewing': '#3F51B5',
        'Offered': '#FF9800',
        'Accepted': '#8BC34A',
        'Rejected': '#F44336',
        'Withdrawn': '#795548',
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
                .where(eq(jobSchema.user_email, userEmail))
                .orderBy(sql`${jobSchema.job_id} DESC`);

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

    // Updated filter logic:
    const filteredJobs = jobList.filter((job) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            job.company_name.toLowerCase().includes(query) ||
            job.role.toLowerCase().includes(query);

        const matchesStatus =
            !selectedStatus || selectedStatus === 'No Filter'
                ? true
                : job.status === selectedStatus;

        return matchesSearch && matchesStatus;
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
                <View style={styles.rowBetween}>
                    <Text style={styles.role}>{item.role}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: statusColors[item.status] || '#666' },
                        ]}
                    >
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                </View>

                <View style={[styles.row, { marginTop: 8 }]}>
                    <FontAwesome name="briefcase" size={18} color="#3D5AFE" style={{ marginRight: 8 }} />
                    <Text style={styles.company}>{item.company_name}</Text>
                </View>

                {item.location ? (
                    <View style={[styles.row, { marginTop: 6 }]}>
                        <AntDesign name="enviromento" size={16} color="#999" style={{ marginRight: 6 }} />
                        <Text style={styles.location}>{item.location}</Text>
                    </View>
                ) : null}

                <View style={[styles.row, { marginTop: 6 }]}>
                    <AntDesign name="calendar" size={16} color="#999" style={{ marginRight: 6 }} />
                    <Text style={styles.date}>Applied on: {item.date_applied}</Text>
                </View>

                {item.notes ? (
                    <View style={styles.noteContainer}>
                        <Text style={styles.notes}>📝 {item.notes}</Text>
                    </View>
                ) : null}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView
            edges={['top', 'bottom']}
            style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        >
            {loading ? (
                <ActivityIndicator size="large" color="#3D5AFE" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredJobs}
                    keyExtractor={(item) => item.job_id.toString()}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
                    }
                    ListHeaderComponent={
                        <View>
                            <Text style={styles.header}>My Job Applications</Text>

                            <View style={styles.searchRow}>
                                <TextInput
                                    placeholder="Search by company or role"
                                    placeholderTextColor="#888"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    style={[styles.searchBox, { flex: 1 }]}
                                />
                                <TouchableOpacity
                                    onPress={() => setStatusFilterVisible(true)}
                                    style={styles.filterButton}
                                >
                                    <FontAwesome name="filter" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            {/* Optional: show active filter label */}
                            {selectedStatus && selectedStatus !== 'No Filter' && (
                                <TouchableOpacity
                                    onPress={() => setSelectedStatus(null)}
                                    activeOpacity={0.7}
                                    style={styles.clearFilterButton}
                                >
                                    <Text style={styles.clearFilterLabel}>Filter: {selectedStatus}</Text>
                                    <Text style={styles.clearFilterText}> ✖</Text>
                                </TouchableOpacity>
                            )}

                            {filteredJobs.length === 0 && (
                                <Text style={styles.empty}>No jobs found. Pull to refresh.</Text>
                            )}
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: 30 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Status Filter Modal */}
            <Modal
                transparent
                visible={statusFilterVisible}
                animationType="slide"
                onRequestClose={() => setStatusFilterVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Filter by Status</Text>
                        <FlatList
                            data={statuses}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        if (item === 'No Filter') {
                                            setSelectedStatus(null);
                                        } else {
                                            setSelectedStatus(item);
                                        }
                                        setStatusFilterVisible(false);
                                    }}
                                    style={[
                                        styles.statusOption,
                                        {
                                            backgroundColor:
                                                (selectedStatus === item ||
                                                    (item === 'No Filter' && selectedStatus === null))
                                                    ? statusColors[item] || '#3D5AFE'
                                                    : '#1E293B',
                                        },
                                    ]}
                                >
                                    <Text style={styles.statusOptionText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            onPress={() => setStatusFilterVisible(false)}
                            style={styles.modalCloseButton}
                        >
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ThemedAlert
                visible={alertVisible}
                message={alertMessage}
                onClose={() => setAlertVisible(false)}
            />
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
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        alignSelf: 'center',
        marginTop: 20,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    searchBox: {
        backgroundColor: '#1E293B',
        color: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 100,
        fontSize: 17,
    },
    filterButton: {
        marginLeft: 12,
        backgroundColor: '#3D5AFE',
        padding: 12,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#FF6B6B',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 10,
        shadowColor: '#FF6B6B',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
    },
    clearFilterText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
        marginRight: 6,
    },
    clearFilterLabel: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

    card: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 18,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    company: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#fff',
        flexShrink: 1,
        flexWrap: 'wrap',
        flex: 1,
    },

    role: {
        fontSize: 18,
        fontWeight: '600',
        color: '#D1D5DB',
        flexWrap: 'wrap',
        flexShrink: 1,
        flex: 1,
    },
    location: {
        fontSize: 15,
        color: '#999',
    },
    date: {
        fontSize: 15,
        color: '#888',
    },
    notes: {
        fontSize: 15,
        color: '#CBD5E1',
    },
    noteContainer: {
        backgroundColor: '#334155',
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '600',
    },
    empty: {
        color: '#aaa',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 17,
    },
    alertOverlay: {
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
    alertMessage: {
        color: '#E5E7EB',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 15,
    },
    alertButton: {
        backgroundColor: '#3D5AFE',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    alertButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        maxHeight: '70%',
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 15,
        alignSelf: 'center',
    },
    statusOption: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginVertical: 4,
        borderRadius: 8,
    },
    statusOptionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalCloseButton: {
        marginTop: 15,
        paddingVertical: 12,
        backgroundColor: '#3D5AFE',
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCloseText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
