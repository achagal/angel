import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, Image, Alert, TextInput, Keyboard } from 'react-native';
import Slider from '@react-native-community/slider';
import supabase from './supabaseClient';
import { useUser } from './UserContext';

const windowWidth = Dimensions.get('window').width;

const Preferences = ({ navigation }) => {
  const { user } = useUser(); // Get the user from context
  const [series, setSeries] = useState('S');  // S = Seed, A, B, C
  const [investMin, setInvestMin] = useState(0);
  const [investMax, setInvestMax] = useState(100000);
  const [industry, setIndustry] = useState('');


  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('preferences')
          .select('series', 'investMin', 'investMax', 'industry') // need to change supa to match this
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) { // set users prefs 
          setSeries(data.series || 'S');
          setInvestMin(data.invest_min || 0);
          setInvestMax(data.invest_max || 100000);
          setIndustry(data.industry || '');
        }
      } catch (error) {
        Alert.alert('Error fetching preferences:', error.message);
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
          series: series,
          invest_min: investMin,
          invest_max: investMax,
          industry: industry
        }, { onConflict: ['id'] });

      if (error) {
        throw error;
      }

      // Alert.alert('Preferences updated successfully!');

      // this will update preferences in Main cuz useFocusEffect block
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

  // ** commented out for now cuz don't need - will need if number input is a type of filter
  // const handleRentChange = (text) => {
  //   const numericValue = text.replace(/[^0-9]/g, ''); acters
  //   if (numericValue.length <= 5) {
  //     setRent(parseInt(numericValue) || 0);
  //   }
  // };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Series</Text>
        {['S', 'A', 'B', 'C'].map(value => (
          <TouchableOpacity
            key={value}
            style={[styles.button, series === value && styles.buttonSelected]}
            onPress={() => setSeries(value)}
          >
            <Text style={[styles.buttonText, series === value && styles.buttonTextSelected]}>
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Investment Range</Text>
        <Text style={styles.label}>{`Min: $${investMin} - Max: $${investMax}`}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={500000}
          step={1000}
          value={investMin}
          onValueChange={value => setInvestMin(value)}
        />
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={500000}
          step={1000}
          value={investMax}
          onValueChange={value => setInvestMax(value)}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Industry</Text>
        <TextInput
          style={styles.textInput}
          value={industry}
          onChangeText={setIndustry}
          placeholder="Enter Industry"
        />
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
