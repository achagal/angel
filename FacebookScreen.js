import React from 'react';
//import { WebView } from 'react-native-webview';

const GoogleScreen = () => {
  return (
    <WebView
      source={{ uri: 'https://www.facebook.com/' }}
      style={{ flex: 1 }}
    />
  );
};

export default GoogleScreen;