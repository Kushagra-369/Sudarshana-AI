interface AndroidLocationBridge {
  saveAuthToken: (token: string) => void;
  startLocationTracking: () => void;
  stopLocationTracking: () => void;
}

interface Window {
  AndroidLocation?: AndroidLocationBridge;
  AndroidGoogleAuth?: any;
}