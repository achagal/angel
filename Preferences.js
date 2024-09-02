import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, Image, Alert, TextInput, Keyboard } from 'react-native';
import Slider from '@react-native-community/slider';
import supabase from './supabaseClient';
import { useUser } from './UserContext';

const windowWidth = Dimensions.get('window').width;

const Preferences = ({ navigation }) => {
  const { user } = useUser(); // Get the user from context
  const [rent, setRent] = useState(1000);
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('preferences')
          .select('max_rent, bedrooms, bathrooms')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setRent(data.max_rent);
          if (data.bedrooms === 0) {
            setBedrooms('Any');
          } else if (data.bedrooms === 1) {
            setBedrooms(1);
          } else if (data.bedrooms === 2) {
            setBedrooms(2);
          } else if (data.bedrooms === 3) {
            setBedrooms(3);
          } else if (data.bedrooms === 4) {
            setBedrooms(4);
          } else if (data.bedrooms === 5) {
            setBedrooms(5);
          } else if (data.bedrooms === 6) {
            setBedrooms(6);
          } else if (data.bedrooms === 7) {
            setBedrooms(7);
          } else {
            setBedrooms('8+');
          }
          if (data.bathrooms === 0) {
            setBathrooms('Any');
          } else if (data.bathrooms === 1) {
            setBathrooms(1);
          } else if (data.bathrooms === 2) {
            setBathrooms(2);
          } else if (data.bathrooms === 3) {
            setBathrooms(3);
          } else if (data.bathrooms === 4) {
            setBathrooms(4);
          } else if (data.bathrooms === 5) {
            setBathrooms(5);
          } else if (data.bathrooms === 6) {
            setBathrooms(6);
          } else if (data.bathrooms === 7) {
            setBathrooms(7);
          } else {
            setBathrooms('8+');
          }
        }
      } catch (error) {
        // Alert.alert('Error fetching preferences:', error.message);
      }
    };

    fetchPreferences();
  }, [user.id]);

  const handleSavePreferences = async () => {
    try { 
      const { error } = await supabase
        .from('preferences')
        .upsert({
          id: user.id,
          max_rent: rent,
          bedrooms: bedrooms === 'Any' ? 0 : parseInt(bedrooms),
          bathrooms: bathrooms === 'Any' ? 0 : parseInt(bathrooms)
        }, { onConflict: ['id'] });

      if (error) {
        throw error;
      }

      // Alert.alert('Preferences updated successfully!');
      navigation.navigate('Main', { updated: true });
    } catch (error) {
      Alert.alert('Error saving preferences:', error.message);
    }
  };

  const CustomButton = ({ value, selectedValue, onPress }) => (
    <TouchableOpacity
      style={[styles.button, selectedValue === value && styles.buttonSelected]}
      onPress={() => onPress(value)}
    >
      <Text style={[styles.buttonText, selectedValue === value && styles.buttonTextSelected]}>
        {value}
      </Text>
    </TouchableOpacity>
  );

  const handleRentChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    if (numericValue.length <= 5) {
      setRent(parseInt(numericValue) || 0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBanner}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image source={require('./assets/BackButton.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.titleText}>Preferences</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Max Rent: ${rent}</Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={30000}
            step={100}
            value={rent}
            onValueChange={setRent}
          />
          <TextInput
            style={styles.rentInput}
            value={rent.toString()}
            keyboardType="numeric"
            returnKeyType="done"
            onChangeText={handleRentChange}
            onSubmitEditing={() => Keyboard.dismiss()}
          />
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Bedrooms</Text>
        <View style={styles.buttonContainer}>
          {['Any', 1, 2, 3, 4, 5, 6, 7, '8+'].map(value => (
            <CustomButton
              key={value}
              value={value}
              selectedValue={bedrooms}
              onPress={setBedrooms}
            />
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Bathrooms</Text>
        <View style={styles.buttonContainer}>
          {['Any', 1, 2, 3, 4, 5, 6, 7, '8+'].map(value => (
            <CustomButton
              key={value}
              value={value}
              selectedValue={bathrooms}
              onPress={setBathrooms}
            />
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSavePreferences}>
          <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  section: {
    marginTop: 5,
    marginBottom: 5,
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderColor: '#70349E',
    width: windowWidth * 0.9,
    alignSelf: 'center',
    top: 60,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    width: 85,
    height: 40,
    margin: 5,
    paddingVertical: 10,
    backgroundColor: '#141414',
    borderRadius: 30,
    borderColor: 'white',
    borderWidth: 1,
    alignItems: 'center',
  },
  buttonSelected: {
    backgroundColor: '#70349E',
    borderColor: 'black'
  },
  buttonText: {
    color: 'white',
  },
  buttonTextSelected: {
    color: 'black',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: 'white',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    width: windowWidth * 0.55,
    height: 40,
  },
  rentInput: {
    height: 40,
    width: windowWidth * 0.2,
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 10,
    marginLeft: 20,
    paddingHorizontal: 10,
    backgroundColor: 'white',
    color: 'black',
  },
  headerContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#141414',
    paddingVertical: 70,
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
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
    top: 25,
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
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  pickerWrapper: {
    borderColor: 'black',
    borderWidth: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 200,
    backgroundColor: 'white',
  },
  saveButton: {
    backgroundColor: '#70349E',
    width: 360,
    height: 45,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    top: 110,
  },
  saveButtonText: {
    color: 'black',
    fontSize: 16,
  },
});

export default Preferences;
