import React from 'react';
//import { WebView } from 'react-native-webview';

const GoogleScreen = () => {
  return (
    <WebView
      source={{ uri: 'https://accounts.google.com/ServiceLogin' }}
      style={{ flex: 1 }}
    />
  );
};

export default GoogleScreen;