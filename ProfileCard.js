import React, { useRef } from 'react';
import { Text, Image, ImageBackground, View, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';

const ProfileCard = ({ user, navigation, currentIndex, setCurrentIndex }) => {
    const { address, images, rent, bedrooms, bathrooms, description } = user;
    const shakeAnimation = useRef(new Animated.Value(0)).current;
    
    const handleNextImage = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            shakeCard();
        }
    };

    const handlePrevImage = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            shakeCard();
        }
    };

    const shakeCard = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 5, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -5, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 5, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const getRoomStyle = () => {
        if (rent < 1000) {
            return styles.roomsShort;
        } else if (rent > 9999) {
            return styles.roomsLong;
        } else {
            return styles.rooms;
        }
    };

    return (
        <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnimation }] }]}>
            <ImageBackground
                source={{ uri: images[currentIndex] }}
                style={styles.photo}
            >
                <TouchableOpacity style={styles.leftTouchable} onPress={handlePrevImage} />
                <TouchableOpacity style={styles.rightTouchable} onPress={handleNextImage} />
                <View style={styles.pagination}>
                    {images.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.paginationDot,
                                index === currentIndex ? styles.activeDot : styles.inactiveDot,
                            ]}
                        />
                    ))}
                </View>
                <View style={styles.cardInner}>
                    <TouchableOpacity onPress={() => navigation.navigate('ProfileInformation', { house: user })}>
                        <Image source={require('./assets/infoIcon.png')} style={styles.info} />
                    </TouchableOpacity>
                    <Text style={styles.address}>{address}</Text>
                    <Text style={styles.rent}>${rent}</Text>
                    <Text style={getRoomStyle()}>{bedrooms} bed</Text>
                    <Text style={getRoomStyle()}>{bathrooms} bath</Text>
                    <Text style={styles.description} numberOfLines={3} ellipsizeMode="tail">{description} </Text>
                </View>
            </ImageBackground>
        </Animated.View>
    );
};

export default ProfileCard;

const styles = StyleSheet.create({
    card: {
        width: '90%',
        height: Dimensions.get('window').height * 0.7,
        backgroundColor: '#161236',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.78,
        shadowRadius: 8.30,
        elevation: 13,
        bottom: 20,
        borderRadius: 15,
        overflow: 'hidden',
    },
    photo: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
    },
    leftTouchable: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: '50%',
    },
    rightTouchable: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: '50%',
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationDot: {
        width: 50,
        height: 5,
        borderRadius: 4,
        marginHorizontal: 4,
        opacity: 0.7,
    },
    activeDot: {
        backgroundColor: 'white',
    },
    inactiveDot: {
        backgroundColor: 'gray',
    },
    address: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 25,
    },
    rent: {
        color: 'white',
        fontSize: 20,
        lineHeight: 25,
        marginTop: 10,
    },
    roomsShort: {
        color: 'white',
        fontSize: 13,
        bottom: 30,
        left: 55,
    },
    rooms: {
        color: 'white',
        fontSize: 13,
        bottom: 29,
        left: 67,
    },
    roomsLong: {
        color: 'white',
        fontSize: 13,
        bottom: 30,
        left: 77,
    },
    cardInner: {
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    description: { /* added description style */
        marginTop: -25,
        color: 'white',
        fontSize: 16,
        // numberOfLines: 3,
        // ellipsizeMode: 'tail'
    },
    info: {
        width: 25,
        height: 25,
        position: 'absolute',
        right: 0,
    },
});
