import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const InfoCard = ({ house, navigation }) => {
    return (
        <ScrollView horizontal={false}>
            <TouchableOpacity
                style={styles.wholeCard}
                onPress={() => navigation.navigate('ProfileInformation', { house: house })}
                activeOpacity={0.95}
            >
                <View style={styles.card}>
                    <Image style={styles.photoBox}
                        source={{ uri: house.images[0] }}
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.5)', 'transparent']}
                        style={styles.gradientOverlay}
                    />
                    <View style={styles.detailsContainer}>
                        <Text style={styles.addressText}>{house.address}</Text>
                        <View style={styles.iconTextRow}>
                            <Ionicons name="cash-outline" size={18} color="white" />
                            <Text style={styles.detailsText}>Rent: {house.rent}</Text>
                        </View>
                        <View style={styles.iconTextRow}>
                            <Ionicons name="bed-outline" size={18} color="white" />
                            <Text style={styles.detailsText}>Bedrooms: {house.bedrooms}</Text>
                        </View>
                        <View style={styles.iconTextRow}>
                            <Text style={styles.detailsText}>Bathrooms: {house.bathrooms}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    wholeCard: {
        marginTop: 10,
        right: -10,
        width: 350,
        height: 200
    },
    toilet: {
        width: 18,
        height: 18
    },
    card: {
        marginTop: 20,
        width: 325,
        height: 180,
        backgroundColor: 'white',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        position: 'relative',
        overflow: 'hidden',
    },
    photoBox: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        borderRadius: 20,
    },
    gradientOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    addressText: {
        fontSize: 16,
        fontWeight: 'bold',
        //marginBottom: 5,
        color: 'white',
        bottom: 35,
        flexWrap: 'wrap',
        marginRight: 30,
    },
    detailsText: {
        fontSize: 14,
        color: 'white',
        marginLeft: 5,
    },
    detailsContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
    },
    iconTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    }
});

export default InfoCard;
