import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function LoginTopBox() {
    return (
        <View style={styles.container}>
            <View style={styles.logoWrapper}>
                <Image
                    source={require('../assets/images/TrakIt.png')}
                    style={styles.logo}
                    resizeMode="contain"
                    height={70}
                    width={70}
                />
            </View>

            <Text style={styles.title}>TrakIt</Text>
            <Text style={styles.tagline}>
                Track your job applications in one place.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 100,
        alignItems: 'center',
    },
    logoWrapper: {
        width: 80,
        height: 80,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',

    },
    logo: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    title: {
        textAlign: 'center',
        fontSize: 30,
        marginTop: 10,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    tagline: {
        fontSize: 13,
        color: '#757575',
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 30,
    },
});
