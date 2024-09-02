import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Image, Text, ActivityIndicator } from 'react-native';
import InfoCard from './InfoCard';
import supabase from './supabaseClient';  // Ensure this is the correct path to your Supabase client
import { useUser } from './UserContext';  // Ensure this is the correct path to your UserContext

const Matches = ({ navigation }) => {
  const { user } = useUser(); // Get the user from context
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouses = async () => {
      if (user) {
        try {
          // Fetch all matches where seeker_id is equal to the user's id
          const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select('house_id')
            .eq('seeker_id', user.id);

          if (matchesError) {
            throw matchesError;
          }

          // Extract house IDs from the matches data
          const houseIds = matchesData.map(match => match.house_id);

          if (houseIds.length > 0) {
            // Fetch house information for the matched house IDs
            const { data: housesData, error: housesError } = await supabase
              .from('houses')
              .select('*')
              .in('id', houseIds);

            if (housesError) {
              throw housesError;
            }

            setHouses(housesData);
          } else {
            setHouses([]);
          }
        } catch (error) {
          // console.error('Error fetching matches or houses:', error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchHouses();
  }, [user]);

  const buttons = [
    { icon: require('./assets/HeartFilled.png'), target: "SeekerFavorites" },
    { icon: require('./assets/Map.png'), target: "SeekerMap" },
    { icon: require('./assets/House.png'), target: "SeekerMain" },
    { icon: require('./assets/Chat.png'), target: "SeekerChat" },
    { icon: require('./assets/Profile.png'), target: "SeekerProfile" }
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          style={styles.loading}
          source={require('./assets/Loading.gif')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
      showsVerticalScrollIndicator={false} 
      >
        {houses.length === 0 ? (
          <Text style={styles.noMatchesText}>No matches found</Text>
        ) : (
          houses.map((house) => (
            <InfoCard key={house.id} house={house} navigation={navigation} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default Matches;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 0,
  },
  loading: {
    width: 110,
    height: 110,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00274C',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
  },
  logo: {
    width: 135,
    height: 135,
    top: 15,
    left: 5,
    resizeMode: 'contain',
    position: 'absolute'
  },
  buttonRow: {
    backgroundColor: '#70349E',
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
      backgroundColor: '#00274C',
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
  noMatchesText: {
    color: 'white',
    fontSize: 18,
    marginTop: 100,
  }
});
