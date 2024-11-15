import { Amplify } from 'aws-amplify';
import { Hub, I18n } from 'aws-amplify/utils';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import config from './amplifyconfiguration.json';
import { zhDict } from './auth/lang/zhDict'; 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TextToSpeech from './pages/TextToSpeech';
import Home from './pages/Home';
import Navbar from './components/Navbar'; 
import './App.css';
import History from './pages/History'
import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';

Amplify.configure(config);

I18n.setLanguage('zh-TW');
I18n.putVocabularies({ 'zh-TW': zhDict });

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const updateAuthStatus = (event) => {
      if (event.payload.event === "signedIn") {
        setIsAuthenticated(true);
      }
      if (event.payload.event === "signedOut") {
        setIsAuthenticated(false);
      }
    };
    Hub.listen('auth', updateAuthStatus);

    // Check current auth state on initial load
    getCurrentUser()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  return (
    <div className={isAuthenticated ? '' : 'auth-center-container'}>
      <Authenticator>
        {({ signOut, user }) => (
          <Router>
            <Navbar user={user} onSignOut={signOut} />
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/text-to-speech" element={<TextToSpeech />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </Router>
        )}
      </Authenticator>
    </div>
  );
}