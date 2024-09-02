import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, TextInput, Text, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import supabase from './supabaseClient';
import { useUser } from './UserContext';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// Initialize the Geocoder with your Google API key
Geocoder.init('AIzaSyDVIGSrjBq35Kwj-0gKPYeRF2rheWHny-M');

const schoolLocations = {
    'University of Michigan': { latitude: 42.278043, longitude: -83.738224 },
    'University of Wisconsin': { latitude: 43.073051, longitude: -89.401230 },
    'Penn State University': { latitude: 40.798213, longitude: -77.859909 },
    'University of Chicago': { latitude: 41.788610, longitude: -87.598713 },
    'Indiana University': { latitude: 39.171005, longitude: -86.518604 },
    'University of Colorado': { latitude: 40.007581, longitude: -105.265942 },
    'Michigan State University': { latitude: 42.731939, longitude: -84.482171 },
    'University of Texas': { latitude: 30.284918, longitude: -97.734057 },
    'Tulane University': { latitude: 29.939590, longitude: -90.121787 },
    'University of Miami': { latitude: 25.721630, longitude: -80.279303 },
    'Ohio State University': { latitude: 40.007581, longitude: -83.030914 },
    'University of Southern California': { latitude: 34.022351, longitude: -118.285117 },
    'New York University': { latitude: 40.729513, longitude: -73.996461 }
};

const Map = ({ navigation }) => {
    const { user } = useUser(); // Get the user from context
    const [searchQuery, setSearchQuery] = useState('');
    const [region, setRegion] = useState({
        latitude: 42.279594,
        longitude: -83.732124,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [markers, setMarkers] = useState([]);
    const [preferences, setPreferences] = useState({});
    const [showFavorites, setShowFavorites] = useState(false);

    const buttons = [
        { icon: require('./assets/Plane.png'), target: "Flight" },
        { icon: require('./assets/FriendsFilled.png'), target: "Map" },
        { icon: require('./assets/House.png'), target: "Main" },
        { icon: require('./assets/Chat.png'), target: "Chat" },
        { icon: require('./assets/Profile.png'), target: "Profile" }
    ];

    useEffect(() => {
        const fetchPreferences = async () => {
            if (user) {
                const { data, error } = await supabase
                    .from('preferences')
                    .select('max_rent, bedrooms, bathrooms')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    // console.error('Error fetching preferences:', error.message);
                } else {
                    setPreferences(data);
                }
            }
        };

        fetchPreferences();
    }, [user]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('school')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    // console.error('Error fetching profile:', error.message);
                } else {
                    const school = data.school;
                    if (schoolLocations[school]) {
                        setRegion({
                            ...region,
                            latitude: schoolLocations[school].latitude,
                            longitude: schoolLocations[school].longitude
                        });
                    }
                }
            }
        };

        fetchProfile();
    }, [user]);

    useEffect(() => {
        const fetchHouses = async () => {
            if (preferences.max_rent !== undefined) {
                try {
                    const { data, error } = await supabase
                        .from('houses')
                        .select('id, address, images, rent, bedrooms, bathrooms, renter_id')
                        .lte('rent', preferences.max_rent)
                        .gte('bedrooms', preferences.bedrooms)
                        .gte('bathrooms', preferences.bathrooms); // Filter houses based on max_rent, bedrooms, and bathrooms

                    if (error) {
                        throw error;
                    }

                    const geocodedMarkers = await Promise.all(data.map(async (house) => {
                        try {
                            const geoResult = await Geocoder.from(house.address);
                            if (geoResult.results.length === 0) {
                                // console.error(`No results for address: ${house.address}`);
                                return null; // Skip this marker if no geocoding results
                            }

                            const location = geoResult.results[0].geometry.location;

                            return {
                                ...house,
                                coordinates: {
                                    latitude: location.lat,
                                    longitude: location.lng,
                                }
                            };
                        } catch (geoError) {
                            // console.error(`Geocoding error for address ${house.address}:`, geoError);
                            return null; // Skip this marker if geocoding fails
                        }
                    }));

                    setMarkers(geocodedMarkers.filter(marker => marker !== null)); // Filter out null markers
                } catch (fetchError) {
                    // console.error('Error fetching houses:', fetchError.message);
                    // Alert.alert('Error', 'Failed to fetch houses. Please try again later.');
                }
            }
        };

        const fetchFavoriteHouses = async () => {
            if (user && preferences.max_rent !== undefined) {
                try {
                    const { data: matchesData, error: matchesError } = await supabase
                        .from('matches')
                        .select('house_id')
                        .eq('seeker_id', user.id);

                    if (matchesError) {
                        throw matchesError;
                    }

                    const houseIds = matchesData.map(match => match.house_id);

                    const { data: houseData, error: houseError } = await supabase
                        .from('houses')
                        .select('id, address, images, rent, bedrooms, bathrooms, renter_id')
                        .in('id', houseIds)
                        .lte('rent', preferences.max_rent)
                        .gte('bedrooms', preferences.bedrooms)
                        .gte('bathrooms', preferences.bathrooms); // Filter favorite houses based on max_rent, bedrooms, and bathrooms

                    if (houseError) {
                        throw houseError;
                    }

                    const geocodedMarkers = await Promise.all(houseData.map(async (house) => {
                        try {
                            const geoResult = await Geocoder.from(house.address);
                            if (geoResult.results.length === 0) {
                                // console.error(`No geocoding results for address: ${house.address}`);
                                return null; // Skip this marker if no geocoding results
                            }

                            const location = geoResult.results[0].geometry.location;

                            return {
                                ...house,
                                coordinates: {
                                    latitude: location.lat,
                                    longitude: location.lng,
                                }
                            };
                        } catch (geoError) {
                            // console.error(`Geocoding error for address ${house.address}:`, geoError);
                            return null; // Skip this marker if geocoding fails
                        }
                    }));

                    setMarkers(geocodedMarkers.filter(marker => marker !== null)); // Filter out null markers
                } catch (fetchError) {
                    // console.error('Error fetching favorite houses:', fetchError.message);
                    // Alert.alert('Error', 'Failed to fetch favorite houses. Please try again later.');
                }
            }
        };

        if (showFavorites) {
            fetchFavoriteHouses();
        } else {
            fetchHouses();
        }
    }, [preferences, showFavorites]);

    const handleSearch = () => {
        Geocoder.from(searchQuery)
            .then(json => {
                const location = json.results[0].geometry.location;
                setRegion({
                    latitude: location.lat,
                    longitude: location.lng,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                });
            })
            // .catch(error => console.warn(error));
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('./assets/LogoWords.png')}
                style={styles.logo}
            />
            <View style={styles.searchContainer}>
                <GooglePlacesAutocomplete
                    placeholder='Search'
                    onPress={(data, details = null) => {
                        const location = details.geometry.location;
                        setRegion({
                            latitude: location.lat,
                            longitude: location.lng,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        });
                    }}
                    query={{
                        key: 'AIzaSyDVIGSrjBq35Kwj-0gKPYeRF2rheWHny-M',
                        language: 'en',
                    }}
                    fetchDetails={true}
                    styles={{
                        textInput: styles.searchInput,
                        listView: { backgroundColor: 'white' },
                    }}
                />
                <TouchableOpacity style={styles.favoritesButton} onPress={() => setShowFavorites(!showFavorites)}>
                    <Image source={showFavorites ? require('./assets/HeartFilled.png') : require('./assets/Heart.png')} style={styles.favoritesIcon} />
                </TouchableOpacity>
            </View>
            <MapView
                style={styles.map}
                region={region}
            >
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        coordinate={marker.coordinates}
                        title={marker.address}
                        description={`Rent: $${marker.rent}`}
                        onPress={() => navigation.navigate('ProfileInformation', { house: marker })}
                    >
                        <View style={styles.pinContainer}>
                            <View style={styles.pin}>
                                <Image
                                    source={{ uri: marker.images[0] }}
                                    style={styles.markerImage}
                                />
                            </View>
                            <View style={styles.pinTip} />
                        </View>
                    </Marker>
                ))}
            </MapView>
            <View style={styles.buttonRow}>
                {buttons.map((button, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.button}
                        onPress={() => navigation.navigate(button.target)}
                    >
                        <Image source={button.icon} style={styles.bottomRow} />
                    </TouchableOpacity>
                ))}
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Preferences')}
                    style={styles.preferences}>
                    <Image
                        source={require('./assets/Preferences.png')}
                        style={styles.preferencesIcon}
                    />
                </TouchableOpacity>
        </View>
    );
};

export default Map;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#141414',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: 135,
        height: 135,
        top: 15,
        left: 5,
        resizeMode: 'contain',
        position: 'absolute'
    },
    searchContainer: {
        flexDirection: 'row',
        position: 'absolute',
        width: 370,
        top: 135,
        left: 10,
        right: 20,
        zIndex: 1,
    },
    searchInput: {
        flex: 1,
        height: 45,
        borderColor: 'black',
        borderWidth: 2,
        borderRadius: 25,
        paddingHorizontal: 10,
        backgroundColor: 'white',
    },
    searchButton: {
        backgroundColor: '#0000FF',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    map: {
        position: 'absolute',
        top: 200,
        left: 0,
        right: 0,
        bottom: 86,
        borderWidth: 0,
        borderColor: '#ffffff',
        borderRadius: 5
    },
    pinContainer: {
        alignItems: 'center',
    },
    pin: {
        width: 30, // Outer size of the pin
        height: 30,
        borderRadius: 15, // Half of the width/height to make it circular
        borderWidth: 2,
        borderColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#141414',
    },
    markerImage: {
        width: 20, // Size of the inner image
        height: 20,
        borderRadius: 30, // Half of the width/height to make it circular
        resizeMode: 'contain',
    },
    pinTip: {
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#141414',
        marginTop: -1,
    },
    buttonRow: {
        backgroundColor: '#141414',
        height: 100,
        position: 'absolute',
        bottom: -10,
        borderTopWidth: 1,
        borderTopColor: 'grey',
        flexDirection: 'row',
        width: 390,
        justifyContent: 'space-evenly',
        padding: 5,
    },
    button: {
        backgroundColor: '#141414',
        padding: 10,
        width: 45,
        height: 45,
        marginLeft: 15,
        marginRight: 15,
    },
    bottomRow: {
        width: '100%',
        height: '100%',
    },
    icon: {
        width: 40,
        height: 40,
        resizeMode: 'contain'
    },
    preferencesIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain'
      },
      preferences: {
        top: 65,
        right: 20,
        zIndex: 1,
        position: 'absolute'
      },
    favoritesButton: {
        top: 7.5,
        width: 30,
        height: 30,
        marginLeft: 15,
        marginRight: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoritesIcon: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    }
});
