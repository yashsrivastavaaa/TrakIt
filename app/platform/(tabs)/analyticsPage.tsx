import { jobs } from '@/config/jobs';
import { jobSchema } from '@/config/jobSchema';
import { AuthContext } from '@/context/AuthContext';
import { AntDesign } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useContext, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

import {
    BarChart,
    LineChart,
    PieChart,
} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const statusList = [
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
] as const;

type StatusType = typeof statusList[number];
type Job = typeof jobSchema.$inferSelect;

export default function AnalyticsPage() {
    const { userData } = useContext(AuthContext);

    const [loading, setLoading] = useState<boolean>(true);

    const [totalApplications, setTotalApplications] = useState<number>(0);
    const [appliedThisWeek, setAppliedThisWeek] = useState<number>(0);
    const [appliedThisMonth, setAppliedThisMonth] = useState<number>(0);

    const [statusCounts, setStatusCounts] = useState<Record<StatusType, number>>(
        statusList.reduce((acc, st) => {
            acc[st] = 0;
            return acc;
        }, {} as Record<StatusType, number>)
    );

    const [monthlyTrend, setMonthlyTrend] = useState<{ label: string; count: number }[]>([]);
    const [topCompanies, setTopCompanies] = useState<{ company: string; count: number }[]>([]);
    const [topRoles, setTopRoles] = useState<{ role: string; count: number }[]>([]);
    const [techFreq, setTechFreq] = useState<Record<string, number>>({});
    const [ctcStats, setCtcStats] = useState<{ avg: number; min: number; max: number } | null>(null);
    const [ctcRangeCounts, setCtcRangeCounts] = useState<Record<string, number>>({});
    const [locationBreakdown, setLocationBreakdown] = useState<{ location: string; count: number }[]>([]);

    useFocusEffect(
        useCallback(() => {
            async function fetchAnalytics() {
                try {
                    setLoading(true);

                    const jobsList: Job[] = await jobs
                        .select()
                        .from(jobSchema)
                        .where(eq(jobSchema.user_email, userData.email));

                    setTotalApplications(jobsList.length);

                    const now = new Date();
                    const day = now.getDay();
                    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(diff);
                    startOfWeek.setHours(0, 0, 0, 0);

                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    startOfMonth.setHours(0, 0, 0, 0);

                    const countThisWeek = jobsList.filter((j: Job) => new Date(j.date_applied) >= startOfWeek).length;
                    setAppliedThisWeek(countThisWeek);

                    const countThisMonth = jobsList.filter((j: Job) => new Date(j.date_applied) >= startOfMonth).length;
                    setAppliedThisMonth(countThisMonth);

                    const sc: Record<StatusType, number> = { ...statusCounts };
                    statusList.forEach(st => sc[st] = 0);
                    jobsList.forEach((j: Job) => {
                        const st = j.status as StatusType;
                        if (statusList.includes(st)) {
                            sc[st] += 1;
                        }
                    });
                    setStatusCounts(sc);

                    const monthly: { label: string; count: number }[] = [];
                    for (let i = 5; i >= 0; i--) {
                        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        const monthLabel = d.toLocaleString('default', { month: 'short', year: 'numeric' });
                        const start = new Date(d.getFullYear(), d.getMonth(), 1);
                        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
                        const count = jobsList.filter((j: Job) => {
                            const da = new Date(j.date_applied);
                            if (isNaN(da.getTime())) {
                                return false;
                            }
                            return da >= start && da < end;
                        }).length;
                        monthly.push({ label: monthLabel, count });
                    }
                    setMonthlyTrend(monthly);

                    const companyMap: Record<string, number> = {};
                    const roleMap: Record<string, number> = {};
                    jobsList.forEach((j: Job) => {
                        companyMap[j.company_name] = (companyMap[j.company_name] || 0) + 1;
                        roleMap[j.role] = (roleMap[j.role] || 0) + 1;
                    });
                    setTopCompanies(Object.entries(companyMap)
                        .map(([company, count]) => ({ company, count }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 5));
                    setTopRoles(Object.entries(roleMap)
                        .map(([role, count]) => ({ role, count }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 5));

                    const tf: Record<string, number> = {};
                    jobsList.forEach((j: Job) => {
                        if (Array.isArray(j.techstacks)) {
                            j.techstacks.forEach((tech) => {
                                if (tech) tf[tech] = (tf[tech] || 0) + 1;
                            });
                        }
                    });
                    setTechFreq(tf);

                    const ctcVals: number[] = jobsList
                        .map(j => j.ctc)
                        .filter(ctc => ctc !== null && ctc !== undefined)
                        .map(ctc => Number(ctc))
                        .filter(num => !isNaN(num));

                    if (ctcVals.length) {
                        const sum = ctcVals.reduce((a, b) => a + b, 0);
                        setCtcStats({
                            avg: sum / ctcVals.length,
                            min: Math.min(...ctcVals),
                            max: Math.max(...ctcVals),
                        });

                        const ranges: Record<string, number> = { '0-5': 0, '5-10': 0, '10-15': 0, '15-20': 0, '20-25': 0, '25+': 0 };
                        ctcVals.forEach(val => {
                            if (val < 5) ranges['0-5']++;
                            else if (val < 10) ranges['5-10']++;
                            else if (val < 15) ranges['10-15']++;
                            else if (val < 20) ranges['15-20']++;
                            else if (val < 25) ranges['20-25']++;
                            else ranges['25+']++;
                        });
                        setCtcRangeCounts(ranges);
                    } else {
                        setCtcStats(null);
                        setCtcRangeCounts({});
                    }

                    const locMap: Record<string, number> = {};
                    jobsList.forEach((j: Job) => {
                        const loc = j.location || 'Unknown';
                        locMap[loc] = (locMap[loc] || 0) + 1;
                    });
                    setLocationBreakdown(Object.entries(locMap)
                        .map(([location, count]) => ({ location, count }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 5));

                } catch (err) {
                    console.error('Analytics fetch error:', err);
                } finally {
                    setLoading(false);
                }
            }
            fetchAnalytics();
        }, [userData.email])
    );

    function getColorForStatus(status: StatusType): string {
        switch (status) {
            case 'Yet to Apply': return '#adb5bd';
            case 'Applied': return '#4dabf7';
            case 'Shortlisted': return '#51cf66';
            case 'Assessment Completed': return '#fcc419';
            case 'Interview Scheduled': return '#ff922b';
            case 'Interviewing': return '#3b82f6';
            case 'Offered': return '#38d9a9';
            case 'Accepted': return '#20c997';
            case 'Rejected': return '#ff6b6b';
            case 'Withdrawn': return '#868e96';
            default: return '#adb5bd';
        }
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Loading Analytics...</Text>
            </SafeAreaView>
        );
    }

    // Helper function for truncating labels
    const truncateLabel = (label: string, length: number = 13) => {
        if (label.length > length) {
            return `${label.substring(0, length)}...`;
        }
        return label;
    };

    const prepareChartData = (dataPoints: number[], labels: string[]) => {
        const maxVal = dataPoints.length > 0 ? Math.max(...dataPoints) : 0;

        let segments = 5;
        if (maxVal > 0 && maxVal < 4) {
            segments = Math.ceil(maxVal);
        } else if (maxVal === 0) {
            segments = 1;
        }

        return {
            chartData: {
                labels: labels,
                datasets: [{ data: dataPoints }],
            },
            segments,
        };
    };

    const monthlyTrendInfo = prepareChartData(monthlyTrend.map(m => m.count), monthlyTrend.map(m => m.label));
    const topCompaniesInfo = prepareChartData(topCompanies.map(c => c.count), topCompanies.map(c => truncateLabel(c.company)));
    const topRolesInfo = prepareChartData(topRoles.map(r => r.count), topRoles.map(r => truncateLabel(r.role)));
    const statusFunnelInfo = prepareChartData(statusList.map(st => statusCounts[st] || 0), statusList.map(st => truncateLabel(st)));
    const sortedTech = Object.entries(techFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const techFreqInfo = prepareChartData(sortedTech.map(([, count]) => count), sortedTech.map(([tech]) => truncateLabel(tech)));
    const locationInfo = prepareChartData(locationBreakdown.map(l => l.count), locationBreakdown.map(l => truncateLabel(l.location)));

    const allCtcRangeLabels = ['0-5', '5-10', '10-15', '15-20', '20-25', '25+'];
    const filteredCtcRanges = allCtcRangeLabels
        .map(label => ({ label, count: ctcRangeCounts[label] || 0 }))
        .filter(item => item.count > 0);
    const ctcRangeInfo = prepareChartData(filteredCtcRanges.map(item => item.count), filteredCtcRanges.map(item => item.label));

    let ctcStatsInfo = { chartData: { labels: [], datasets: [{ data: [] }] }, segments: 4 };
    if (ctcStats) {
        //@ts-ignore
        ctcStatsInfo = prepareChartData([ctcStats.min, ctcStats.avg, ctcStats.max], ['Min', 'Average', 'Max']);
    }

    const chartConfig = {
        backgroundGradientFrom: "#1E293B",
        backgroundGradientTo: "#0A1124",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(200, 200, 200, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: { r: "4", strokeWidth: "2", stroke: "#4dabf7" },
        propsForLabels: { dx: 0 },
        // **FIXED**: New Y-axis label formatting logic to handle both integers and decimals cleanly.
        formatYLabel: (yValue: any) => {
            const num = Number(yValue);
            if (num % 1 === 0) {
                return num.toString();
            }
            return num.toFixed(1);
        },
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.header}>Application Analytics</Text>

                <View style={styles.statsContainer}>
                    <View style={styles.card}>
                        <AntDesign name="calendar" size={28} color="#fcc419" style={styles.icon} />
                        <Text style={styles.value}>{appliedThisWeek}</Text>
                        <Text style={styles.label}>Applied This Week</Text>
                    </View>
                    <View style={styles.card}>
                        <AntDesign name="calendar" size={28} color="#51cf66" style={styles.icon} />
                        <Text style={styles.value}>{appliedThisMonth}</Text>
                        <Text style={styles.label}>Applied This Month</Text>
                    </View>
                    <View style={[styles.card, styles.cardFullWidth]}>
                        <AntDesign name="profile" size={28} color="#4dabf7" style={styles.icon} />
                        <Text style={styles.value}>{totalApplications}</Text>
                        <Text style={styles.label}>Total Applications</Text>
                    </View>
                </View>

                <Text style={styles.subHeader}>Applications by Status</Text>
                <PieChart data={statusList.map(st => ({ name: st, count: statusCounts[st] || 0, color: getColorForStatus(st), legendFontColor: '#E5E7EB', legendFontSize: 12 })).filter(d => d.count > 0)} width={screenWidth - 40} height={220} chartConfig={chartConfig} accessor="count" backgroundColor="transparent" paddingLeft="15" absolute />

                <Text style={styles.subHeader}>Monthly Applications (Last 6 Months)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}><LineChart data={monthlyTrendInfo.chartData} width={Math.max(screenWidth + 40, monthlyTrendInfo.chartData.labels.length * 60)} height={300} chartConfig={chartConfig} style={styles.chartStyle} fromZero={true} segments={monthlyTrendInfo.segments} /></ScrollView>

                <Text style={styles.subHeader}>Top 5 Companies Applied To</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <
                        // @ts-ignore
                        BarChart
                        data={topCompaniesInfo.chartData} width={Math.max(screenWidth, topCompaniesInfo.chartData.labels.length * 80)} height={300} chartConfig={chartConfig} verticalLabelRotation={30} fromZero={true} style={styles.chartStyle} segments={topCompaniesInfo.segments} /></ScrollView>
                <View style={styles.legendContainer}>
                    {topCompanies
                        .filter(item => item.company.length > 10)
                        .map((item, index) => (
                            <Text key={index} style={styles.legendText}>
                                <Text style={{ fontWeight: 'bold' }}>{truncateLabel(item.company)}</Text>: {item.company}
                            </Text>
                        ))}
                </View>

                <Text style={styles.subHeader}>Top 5 Roles Applied To</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}><
                    //@ts-ignore
                    BarChart data={topRolesInfo.chartData} width={Math.max(screenWidth, topRolesInfo.chartData.labels.length * 100)} height={320} chartConfig={chartConfig} verticalLabelRotation={0} fromZero={true} style={{ ...styles.chartStyle, paddingRight: 20 }} segments={topRolesInfo.segments} /></ScrollView>
                <View style={styles.legendContainer}>
                    {topRoles
                        .filter(item => item.role.length > 10)
                        .map((item, index) => (
                            <Text key={index} style={styles.legendText}>
                                <Text style={{ fontWeight: 'bold' }}>{truncateLabel(item.role)}</Text>: {item.role}
                            </Text>
                        ))}
                </View>

                <Text style={styles.subHeader}>Application Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}><
                    //@ts-ignore
                    BarChart data={statusFunnelInfo.chartData} width={statusFunnelInfo.chartData.labels.length * 80} height={300} chartConfig={chartConfig} verticalLabelRotation={30} fromZero={true} style={{ ...styles.chartStyle, paddingRight: 20, paddingBottom: 2 }} segments={statusFunnelInfo.segments} /></ScrollView>
                <View style={styles.legendContainer}>
                    {statusList
                        .filter(st => st.length > 10)
                        .map((st, index) => (
                            <Text key={index} style={styles.legendText}>
                                <Text style={{ fontWeight: 'bold' }}>{truncateLabel(st)}</Text>: {st}
                            </Text>
                        ))}
                </View>

                <Text style={styles.subHeader}>Top 5 Technology Frequency</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <
                        //@ts-ignore
                        BarChart data={techFreqInfo.chartData} width={Math.max(screenWidth - 40, techFreqInfo.chartData.labels.length * 80)} height={220} chartConfig={chartConfig} style={styles.chartStyle} fromZero={true} segments={techFreqInfo.segments} />
                </ScrollView>
                <View style={styles.legendContainer}>
                    {sortedTech
                        .filter(([tech]) => tech.length > 10)
                        .map(([tech], index) => (
                            <Text key={index} style={styles.legendText}>
                                <Text style={{ fontWeight: 'bold' }}>{truncateLabel(tech)}</Text>: {tech}
                            </Text>
                        ))}
                </View>

                <Text style={styles.subHeader}>CTC Statistics (LPA)</Text>
                {ctcStats ? (<><Text style={styles.listItem}>Avg: {ctcStats.avg.toFixed(2)}, Min: {ctcStats.min.toFixed(2)}, Max: {ctcStats.max.toFixed(2)}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <
                        //@ts-ignore
                        BarChart data={ctcStatsInfo.chartData} width={screenWidth - 40} height={220} chartConfig={chartConfig} style={styles.chartStyle} fromZero={true} segments={ctcStatsInfo.segments} /></ScrollView><Text style={styles.subHeader}>CTC Distribution (LPA)</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <
                            //@ts-ignore
                            BarChart data={ctcRangeInfo.chartData} width={Math.max(screenWidth - 40, ctcRangeInfo.chartData.labels.length * 70)} height={220} chartConfig={chartConfig} style={styles.chartStyle} fromZero={true} segments={ctcRangeInfo.segments} /></ScrollView></>) : (<Text style={styles.listItem}>No CTC data</Text>)}

                <Text style={styles.subHeader}>Top 5 Applications by Location</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}><
                    //@ts-ignore
                    BarChart data={locationInfo.chartData} width={Math.max(screenWidth, locationInfo.chartData.labels.length * 60)} height={220} chartConfig={chartConfig} style={styles.chartStyle} fromZero={true} segments={locationInfo.segments} /></ScrollView>
                <View style={styles.legendContainer}>
                    {locationBreakdown
                        .filter(item => item.location.length > 13)
                        .map((item, index) => (
                            <Text key={index} style={styles.legendText}>
                                <Text style={{ fontWeight: 'bold' }}>{truncateLabel(item.location)}</Text>: {item.location}
                            </Text>
                        ))}
                </View>

                <View style={{ marginBottom: 50 }}></View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0A1124', paddingHorizontal: 20, paddingTop: 20 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1124' },
    loadingText: { marginTop: 10, fontSize: 18, color: '#FFFFFF' },
    header: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 20, letterSpacing: 0.5, marginTop: 20 },
    subHeader: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginTop: 20, marginBottom: 10 },
    statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: { backgroundColor: 'rgba(30,41,59,0.95)', borderRadius: 16, padding: 20, marginBottom: 20, width: '47%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 6 }, shadowRadius: 8, elevation: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    cardFullWidth: { width: '100%' },
    icon: { marginBottom: 10 },
    value: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
    label: { fontSize: 14, color: '#E5E7EB', marginTop: 6, textAlign: 'center' },
    listItem: { color: '#E5E7EB', fontSize: 16, marginVertical: 4 },
    chartStyle: { marginVertical: 8, borderRadius: 16 },
    legendContainer: { paddingHorizontal: 10, marginTop: 8 },
    legendText: { marginBottom: 6, fontSize: 12, color: 'white' },
});