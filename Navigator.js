import React from "react";
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { UserProvider } from './UserContext'; // Ensure this is the correct path to your UserContext file
import LogIn from './LogIn';
import SignUp from './SignUp';
import CreateAccount from './CreateAccount';
import CreateProfile from './CreateProfile';
import Main from './Main';
import Preferences from './Preferences';
import Matches from './Matches';
import Map from './Map';
import Chat from './Chat';
import ProfileUser from './ProfileUser';
import Flight from './Flight';
import GoogleScreen from './GoogleScreen';
import FacebookScreen from './FacebookScreen';
import IOSScreen from './IOSScreen';
import ProfileInformation from './ProfileInformation';
import ChatScreen from './ChatScreen';
import EditProfile from './EditProfile';  
import Settings from './Settings';
import Notifications from './Notifications';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import ProfileFriend from './ProfileFriend';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={LogIn} />
          <Stack.Screen name="LogIn" component={LogIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="GoogleScreen" component={GoogleScreen} />
          <Stack.Screen name="FacebookScreen" component={FacebookScreen} />
          <Stack.Screen name="IOSScreen" component={IOSScreen} />
          <Stack.Screen name="CreateAccount" component={CreateAccount} options={{ animationEnabled: false }} />
          <Stack.Screen name="CreateProfile" component={CreateProfile} />
          <Stack.Screen name="Main" component={Main} options={{ animationEnabled: false }} />
          <Stack.Screen name="Preferences" component={Preferences} />
          <Stack.Screen name="Matches" component={Matches} />
          <Stack.Screen name="Map" component={Map} options={{ animationEnabled: false }} />
          <Stack.Screen name="Chat" component={Chat} options={{ animationEnabled: false }} />
          <Stack.Screen name="ProfileUser" component={ProfileUser} options={{ animationEnabled: false }} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="ProfileInformation" component={ProfileInformation} />
          <Stack.Screen name="Flight" component={Flight} options={{ animationEnabled: false }} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
          <Stack.Screen name="TermsOfService" component={TermsOfService} />
          <Stack.Screen name="ProfileFriend" component={ProfileFriend} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}

export default AppNavigator;
