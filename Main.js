import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import ProfileCard from './ProfileCard';
import SwipeStack from './SwipeStack';
import supabase from './supabaseClient';  // Ensure this is the correct path to your Supabase client
import { useUser } from './UserContext';  // Ensure this is the correct path to your UserContext
import { useFocusEffect } from '@react-navigation/native';
import uuid from 'react-native-uuid';

const Main = ({ navigation }) => {
  const { user } = useUser(); // Get the user from context
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0); // Move currentIndex and setCurrentIndex here

  const fetchPreferences = useCallback(async () => {
    if (user) {
      try {
        const { data: preferencesData, error: preferencesError } = await supabase
          .from('preferences')
          .select('max_rent, bedrooms, bathrooms')
          .eq('id', user.id)
          .single();

        if (preferencesError) {
          throw preferencesError;
        }

        setPreferences(preferencesData);
        return preferencesData;
      } catch (error) {
        console.error('Error fetching preferences:', error.message);
      }
    }
  }, [user]);

  const fetchHouses = useCallback(async (preferences) => {
    if (preferences?.max_rent !== null) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('school')
          .eq('id', user.id)
          .single();
  
        if (profileError) {
          throw profileError;
        }
  
        const { school } = profileData;
  
        // Create query filters for bedrooms and bathrooms
        const bedroomFilter = preferences.bedrooms === 'any' ? null : preferences.bedrooms;
        const bathroomFilter = preferences.bathrooms === 'any' ? null : preferences.bathrooms;
  
        // Build the query based on the filters
        let query = supabase
          .from('houses')
          .select('id, address, images, bedrooms, bathrooms, rent, description, swipes, likes, renter_id')
          .eq('school', school)
          .lte('rent', preferences.max_rent);
  
        if (bedroomFilter !== null) {
          if (bedroomFilter === 0) {
            query = query.gte('bedrooms', 0);
          } else if (parseInt(bedroomFilter) >= 8) {
            query = query.gte('bedrooms', 8);
          } else {
            query = query.eq('bedrooms', bedroomFilter);
          }
        }
  
        if (bathroomFilter !== null) {
          if (bathroomFilter === 0) {
            query = query.gte('bathrooms', 0);
          } else if (parseInt(bathroomFilter) >= 8) {
            query = query.gte('bathrooms', 8);
          } else {
            query = query.eq('bedrooms', bathroomFilter);
          }
        }
  
        const { data: houseData, error: houseError } = await query;
  
        if (houseError) {
          throw houseError;
        }
  
        setHouses(houseData);
      } catch (error) {
        console.error('Error fetching houses:', error.message);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);  

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPreferences().then((preferences) => fetchHouses(preferences));
    }, [fetchPreferences, fetchHouses])
  );

  const incrementHouseStats = async (houseId, fieldsToIncrement) => {
    const { data, error } = await supabase
      .from('houses')
      .select('swipes, likes')
      .eq('id', houseId)
      .single();

    // if (error) {
    //   console.error('Error fetching house stats:', error.message);
    //   return;
    // }

    const updates = {};
    fieldsToIncrement.forEach(field => {
      updates[field] = data[field] + 1;
    });

    const { error: updateError } = await supabase
      .from('houses')
      .update(updates)
      .eq('id', houseId);

    // if (updateError) {
    //   console.error('Error updating house stats:', updateError.message);
    // }
  };

  const onSwipeLeft = async (house) => {
    setCurrentIndex(0);
    await incrementHouseStats(house.id, ['swipes']);
  };

  const onSwipeRight = async (house) => {
    setCurrentIndex(0);
    await incrementHouseStats(house.id, ['swipes', 'likes']);
  
    if (user && house.renter_id) {  // Ensure both user and house.renter_id are defined
      try {
        // Check for existing match for the seeker and the house
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .eq('seeker_id', user.id)
          .eq('house_id', house.id)
          .single();
  
        if (matchError && matchError.code !== 'PGRST116') {
          throw matchError;
        }
  
        // If no existing match, create a new one
        if (!matchData) {
          const { error: insertError } = await supabase
            .from('matches')
            .insert({
              id: uuid.v4(),
              house_id: house.id,
              renter_id: house.renter_id,
              seeker_id: user.id,
              chatted: false
            });
  
          if (insertError) {
            throw insertError;
          }
        } else {
          // console.log('Match already exists');
        }
      } catch (error) {
        console.error('Error updating matches:', error.message);
      }
    } else {
      // console.error('Seeker or renter ID is undefined');
    }
  };

  const buttons = [
    { icon: require('./assets/Plane.png'), target: "Flight" },
    { icon: require('./assets/Friends.png'), target: "Map" },
    { icon: require('./assets/HouseFilled.png'), target: "Main" },
    { icon: require('./assets/Chat.png'), target: "Chat" },
    { icon: require('./assets/Profile.png'), target: "ProfileUser" }
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('./assets/LogoWords.png')}
          style={styles.logo}
        />
        <Image
          style={styles.loading}
          source={require('./assets/Loading.gif')}
        />
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/LogoWords.png')}
        style={styles.logo}
      />
      <TouchableOpacity onPress={() => navigation.navigate('Preferences')}
        style={styles.preferences}>
        <Image
          source={require('./assets/Preferences.png')}
          style={styles.preferencesIcon}
        />
      </TouchableOpacity>
      <SwipeStack
        data={houses}
        renderItem={({ item }) => <ProfileCard user={item} navigation={navigation} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />} // Pass currentIndex and setCurrentIndex as props
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
      />
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
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 135,
    height: 135,
    top: 15,
    left: 5,
    resizeMode: 'contain',
    position: 'absolute',
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
  animatedCard: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    width: 110,
    height: 110,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141414',
  },
});
