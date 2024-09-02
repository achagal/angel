import React, { useEffect, useState } from 'react';
import { Button, Platform, View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import supabase from './supabaseClient'; // Ensure this is the correct path
import { useUser } from './UserContext'; // Import useUser from your context
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'; // Import GooglePlacesAutocomplete

const EditProfile = ({ navigation, route }) => {
  const { user } = useUser(); // Get the user from context
  const { houseId } = route.params; // Get houseId from navigation params
  const [house, setHouse] = useState(null);
  const [images, setImages] = useState(Array(9).fill(null)); // Initialize with empty array
  const [address, setAddress] = useState('');
  const [rent, setRent] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouse = async () => {
      if (user && houseId) {
        const { data, error } = await supabase
          .from('houses')
          .select('*')
          .eq('id', houseId)
          .single();

        if (error) {
          // console.error('Error fetching house:', error.message);
        } else {
          setHouse(data);
          setAddress(data.address);
          setRent(data.rent.toString()); // Convert to string
          setBedrooms(data.bedrooms.toString()); // Convert to string
          setBathrooms(data.bathrooms.toString()); // Convert to string
          setDescription(data.description);
          const initialImages = Array(9).fill(null);
          for (let i = 0; i < data.images.length && i < 9; i++) {
            initialImages[i] = data.images[i];
          }
          setImages(initialImages);
        }
        setLoading(false);
      }
    };

    fetchHouse();
  }, [user, houseId]);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const libraryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libraryStatus.status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }

        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== 'granted') {
          alert('Sorry, we need camera permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async (index) => {
    if (images[index] === null) {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            const newImages = [...images];
            
            // Find the first empty spot in the grid
            const emptyIndex = newImages.findIndex(image => image === null);

            // Place the image in the first empty spot or the selected spot if no empty spot is found
            if (emptyIndex !== -1) {
                newImages[emptyIndex] = uri;
            } else {
                newImages[index] = uri;
            }

            setImages(newImages);
        }
    } else {
        Alert.alert(
            'Remove?',
            '',
            [
                {
                    text: 'Remove',
                    onPress: () => {
                        const newImages = [...images];
                        newImages[index] = null;

                        // Move up images to fill the first spots
                        const filteredImages = newImages.filter(image => image !== null);
                        while (filteredImages.length < newImages.length) {
                            filteredImages.push(null);
                        }

                        setImages(filteredImages);
                    },
                    style: 'destructive'
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ],
            { cancelable: true }
        );
    }
};

  const handleSaveDetails = async () => {
    if (!address || !rent || !bedrooms || !bathrooms || !description) {
      Alert.alert("Please fill in all fields");
      return;
    }

    try {
      const { error } = await supabase
        .from('houses')
        .update({
          address,
          rent: parseInt(rent), // Convert back to int
          bedrooms: parseInt(bedrooms), // Convert back to int
          bathrooms: parseInt(bathrooms), // Convert back to int
          description,
          images,
        })
        .eq('id', houseId);

      if (error) {
        throw error;
      }

      Alert.alert('House information updated successfully!');
      navigation.navigate('Flight');
    } catch (error) {
      Alert.alert('Error updating house information:', error.message);
    }
  };

  const confirmDeleteListing = () => {
    Alert.alert(
      "Are you sure you want to delete this listing?",
      [
        {
          text: "No",
          // onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: handleDeleteListing
        }
      ]
    );
  };

  const handleDeleteListing = async () => {
    try {
      // Delete matches associated with the house
      const { error: matchesError } = await supabase
        .from('matches')
        .delete()
        .eq('house_id', houseId);

      if (matchesError) {
        throw matchesError;
      }

      // Delete the house
      const { error: houseError } = await supabase
        .from('houses')
        .delete()
        .eq('id', houseId);

      if (houseError) {
        throw houseError;
      }

      Alert.alert('Listing deleted successfully!');
      navigation.navigate('Flight');
    } catch (error) {
      Alert.alert('Error deleting listing:', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wholeContainer}>
      <View style={styles.topBanner}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                  <Image source={require('./assets/BackButton.png')} style={styles.backIcon} />
          </TouchableOpacity>
        <Text style={styles.titleText}>Edit Listing</Text>
        <TouchableOpacity onPress={confirmDeleteListing} style={styles.deleteButtonContainer}>
          <Image source={require('./assets/TrashIcon.png')} style={styles.trashIcon} />
        </TouchableOpacity>
      </View>
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps='handled' contentContainerStyle={styles.container} style={styles.scrollView} >
      <View style={styles.container}>
        <Text style={styles.photoText}>Photos</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {images.map((image, index) => (
          <TouchableOpacity key={`${index}-${images[index] || 'placeholder'}`} onPress={() => pickImage(index)} style={styles.imageContainer}>
            <Image source={image ? { uri: image } : require('./assets/RenterHousePhotos.png')} style={styles.photoStyle} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.container}>
        <Text style={styles.addressText}>Address</Text>
      </View>
      <GooglePlacesAutocomplete
        disableScroll={true}
        placeholder='Enter your address'
        onPress={(data, details = null) => {
          const location = details.geometry.location;
          setAddress(data.description);
        }}
        query={{
          key: 'AIzaSyDVIGSrjBq35Kwj-0gKPYeRF2rheWHny-M',
          language: 'en',
        }}
        fetchDetails={true}
        styles={{
          textInputContainer: styles.textInputContainer,
          textInput: styles.addressInputBox,
          listView: styles.listView,
        }}
      />
      <View style={styles.container}>
        <Text style={styles.rentText}>Monthly Rent</Text>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.minInputBox}
          placeholder="Rent $"
          autoCapitalize="words"
          autoCorrect={false}
          value={rent}
          onChangeText={setRent}
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.bedText}>Bedrooms</Text>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.bedInputBox}
          placeholder="Bedrooms"
          autoCapitalize="words"
          autoCorrect={false}
          value={bedrooms}
          onChangeText={setBedrooms}
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.bathText}>Bathrooms</Text>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.bathInputBox}
          placeholder="Bathrooms"
          autoCapitalize="words"
          autoCorrect={false}
          value={bathrooms}
          onChangeText={setBathrooms}
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.descriptionText}>Description</Text>
      </View>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.descriptionInputBox}
          placeholder="Description"
          autoCapitalize="words"
          autoCorrect={false}
          value={description}
          onChangeText={setDescription}
          multiline={true}
        />
      </View>
      <TouchableOpacity onPress={handleSaveDetails} style={styles.buttonContainer}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#161236',
  },
  wholeContainer: {
    backgroundColor: '#00274C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBanner: {
    position: 'absolute',
    width: '100%',
    height: 95,
    flexDirecton: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    top: 0,
    zIndex: 1,
    padding: 10,
    backgroundColor: '#00274C',
    borderBottomWidth: 1,
    borderBottomColor: 'gold',
  },
  titleText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
    top: 35,
  },
  deleteButtonContainer: {
    width: 25,
    height: 25,
    position: 'abosolute',
    left: 330,
    top: 13,
  },
  trashIcon: {
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
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imageContainer: {
    width: '32%',
    height: 150,
    padding: 5,
    left: 8,
  },
  buttonContainer: {
    backgroundColor: "gold",
    width: "100%",
    //width: 360,
    height: 45,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 150,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
  },
  photoStyle: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    top: 45,
    borderRadius: 10,
  },
  logo: {
    width: 135,
    height: 135,
    top: 0,
    left: 0,
    resizeMode: 'contain',
    position: 'absolute',
  },
  photoText: {
    right: 135,
    fontSize: 16,
    color: 'white',
    top: 65,
  },
  addressText: {
    right: 130,
    fontSize: 16,
    color: 'white',
    bottom: -30,
  },
  rentText: {
    right: 110,
    fontSize: 16,
    color: 'white',
    bottom: 20,
  },
  dashtxt: {
    right: 45,
    fontSize: 30,
    color: 'white',
    bottom: 135,
  },
  bedText: {
    right: 123,
    fontSize: 16,
    color: 'white',
    bottom: 60,
  },
  bathText: {
    right: 117,
    fontSize: 16,
    color: 'white',
    bottom: 105,
  },
  descriptionText: {
    bottom: 150,
    right: 115,
    fontSize: 16,
    color: 'white',
  },
  textInputContainer: {
    flex: 1,
    height: 50,
    //width: 360,
    width: "100%",
    borderColor: 'gray',
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 20,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  addressInputBox: {
    top: 7,
    right: 10,
    height: 30,
    width: '100%',
    backgroundColor: 'white',
  },
  listView: {
    backgroundColor: 'white',
  },
  minInputBox: {
    flex: 1,
    height: 50,
    width: '100%',
    borderColor: 'gray',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    bottom: 30,
  },
  bedInputBox: {
    flex: 1,
    height: 50,
    width: '100%',
    borderColor: 'gray',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    bottom: 75,
  },
  bathInputBox: {
    flex: 1,
    height: 50,
    width: '100%',
    borderColor: 'gray',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    bottom: 120
  },
  descriptionInputBox: {
    flex: 1,
    height: 200,
    width: "100%",
    //width: 360,
    borderColor: 'gray',
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 22,
    padding: 10,
    bottom: 165,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
    flexDirection: 'row',
  },
});
