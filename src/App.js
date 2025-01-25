import { Amplify } from 'aws-amplify';
import { Hub, I18n } from 'aws-amplify/utils';
import { Authenticator } from '@aws-amplify/ui-react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import '@aws-amplify/ui-react/styles.css';
import config from './amplifyconfiguration.json';
import { zhDict } from './assets/zhDict'; 
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TextToSpeech from './pages/TextToSpeech';
import Home from './pages/Home';
import Navbar from './components/Navbar'; 
import './App.css';
import History from './pages/History'
import UserProfile from './pages/UserProfile'
import { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

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
          <Provider store={store}>
            <Router>
              <Navbar user={user} onSignOut={signOut} />
              <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/text-to-speech" element={<TextToSpeech />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<UserProfile />} />
              </Routes>
              <ToastContainer 
                position="top-center"
                hideProgressBar={true}
                pauseOnHover={true}
                autoClose={8000}
                theme='colored'
                className='custom-toast'
              />
            </Router>
          </Provider>
        )}
      </Authenticator>
    </div>
  );
}