import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import Geocoder from 'react-native-geocoding';
import supabase from './supabaseClient';  // Ensure this is the correct path to your Supabase client
import { useUser } from './UserContext';  // Ensure this is the correct path to your UserContext
import uuid from 'react-native-uuid';

// Initialize the Geocoder with your Google API key 
// deleted because pushing to githubx

const ProfileInformation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { house } = route.params;
  const { user } = useUser();

  const [coordinates, setCoordinates] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMatched, setIsMatched] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const geoResult = await Geocoder.from(house.address);
        const location = geoResult.results[0].geometry.location;
        setCoordinates({
          latitude: location.lat,
          longitude: location.lng,
        });
      } catch (error) {
        // console.error('Error fetching coordinates:', error.message);
      } finally {
        setLoading(false);
      }
    };

    const checkMatch = async () => {
      try {
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('seeker_id', user.id)
          .eq('house_id', house.id)
          .single();

        if (matchError && matchError.code !== 'PGRST116') {
          throw matchError;
        }

        setIsMatched(!!matchData);
      } catch (error) {
        // console.error('Error checking match:', error.message);
      }
    };

    const fetchDescription = async () => {
      try {
        const { data, error } = await supabase
          .from('houses')
          .select('description')
          .eq('id', house.id)
          .single();

        if (error) {
          throw error;
        }

        setDescription(data.description);
      } catch (error) {
        // console.error('Error fetching description:', error.message);
      }
    };

    fetchCoordinates();
    checkMatch();
    fetchDescription();
  }, [house.address, user.id, house.id]);

  const handleNextImage = () => {
    if (currentIndex < house.images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleMatch = async () => {
    try {
      if (isMatched) {
        const { error } = await supabase
          .from('matches')
          .delete()
          .eq('seeker_id', user.id)
          .eq('house_id', house.id);

        if (error) {
          throw error;
        }

        setIsMatched(false);
      } else {
        const { error } = await supabase
          .from('matches')
          .insert({
            id: uuid.v4(),
            house_id: house.id,
            renter_id: house.renter_id,
            seeker_id: user.id,
            chatted: false
          });
        if (error) {
          throw error;
        }

        setIsMatched(true);
      }
    } catch (error) {
      // console.error('Error updating match:', error.message);
      // Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBanner}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Image source={require('./assets/BackButton.png')} style={styles.backIcon} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">{house.address}</Text>
          </View>
        <TouchableOpacity 
          style={styles.matchButton}
          onPress={handleMatch}>
          <Image 
            source={isMatched ? require('./assets/HeartFilled.png') : require('./assets/Heart.png')}
            style={styles.matchIcon}
          />
        </TouchableOpacity>
      </View>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: house.images[currentIndex] }}
          style={styles.imageTop}
        />
        <View style={styles.pagination}>
          {house.images.map((_, index) => (
            <View 
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
        {currentIndex > 0 && (
          <TouchableOpacity style={[styles.arrowButton, styles.leftArrow]} onPress={handlePrevImage}>
            <Image source={require('./assets/LeftArrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>
        )}
        {currentIndex < house.images.length - 1 && (
          <TouchableOpacity style={[styles.arrowButton, styles.rightArrow]} onPress={handleNextImage}>
            <Image source={require('./assets/RightArrow.png')} style={styles.arrowIcon} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.card}>
        <View style={styles.upperCard}>
          <Text style={styles.detailText}> ${house.rent}</Text>
          <Text style={styles.detailText}> {house.bedrooms}</Text>
          <Text style={styles.detailText}> {house.bathrooms}</Text>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('ProfileFriend', { userId: house.renter_id })}>
              <Image source={require('./assets/Profile.png')} style={styles.profileIcon} />
          </TouchableOpacity>
        </View>
        <Text style={styles.descriptionText}>{description}</Text>
      </View>
    </ScrollView>
    {coordinates && (
      <View style={styles.mapContainer}>
        <LinearGradient
          colors={['#00274C', 'rgba(0, 39, 76, 0.3)', 'transparent']}
          style={styles.gradient}
        >
          <MapView
            style={styles.mapStyle}
            initialRegion={{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={coordinates}
              title={house.address}
              description={`Rent: ${house.rent}`}
            >
              <View style={styles.pinContainer}>
                <View style={styles.pin}>
                  <Image
                    source={require('./assets/Goog.png')}
                    style={styles.markerImage}
                  />
                </View>
                <View style={styles.pinTip} />
              </View>
            </Marker>
          </MapView>
        </LinearGradient>
      </View>
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 310, // Adjust this value if needed
    backgroundColor: '#141414',
    alignItems: 'center',
  },
  imageContainer: {
    top: 75,
    // right: 20,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#70349E',
  },
  wholeContainer: {
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBanner: {
    position: 'absolute',
    width: '100%',
    height: 95,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    top: 0,
    zIndex: 1,
    padding: 10,
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: '#70349E',
  },
  titleText: {
    //width: 300,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
    top: 36,
  },
  titleContainer: {
    width: 300,
    justifyContent: 'center',
    alignContent: 'center',
    bottom: 13,
  },
  matchButton: {
    width: 25,
    height: 25,
    position: 'absolute',
    left: 345,
    top: 57,
  },
  matchIcon: {
    resizeMode: 'contain',
    height: 25,
    width: 25,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    width: 20,
    height: 20,
  },
  backIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imageTop: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height / 3,
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: Dimensions.get('window').height / 3,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    alignSelf: 'center',
    top: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: 'white',
  },
  inactiveDot: {
    backgroundColor: 'gray',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    zIndex: 1,
    width: 40,
    height: 40,
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
  arrowIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain'
  },
  card: {
    zIndex: 1,
    marginLeft: 5,
    marginRight: 5,
    marginTop: 100,
    width: 375,
    backgroundColor: '#141414',
    borderRadius: 10,
  },
  upperCard: {
    width: 375,
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    padding: 10,
    bottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#70349E',
  },
  bedIcon: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  bathIcon: {
    width: 30,
    height: 30,
  },
  profileIcon: {
    width: 25,
    height: 25,
    marginRight: 10
  },
  detailText: {
    fontSize: 22,
    marginBottom: 5,
    marginRight: 50,
    color: '#fff',
  },
  descriptionText: {
    fontSize: 16,
    color: '#fff',
  },
  boldText: {
    fontWeight: 'bold',
  },
  mapContainer: {
    width: '100%',
    height: 300,
    marginTop: 10,
    borderTopColor: '#70349E',
    borderTopWidth: 2,
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  mapStyle: {
    flex: 1,
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
    borderRadius: 7.5, // Half of the width/height to make it circular
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
});

export default ProfileInformation;
