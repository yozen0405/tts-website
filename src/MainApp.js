import { Hub, I18n } from 'aws-amplify/utils';
import { Authenticator } from '@aws-amplify/ui-react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getCurrentUser } from 'aws-amplify/auth';
import { resetHistoryState } from './redux/slices/audioHistorySlice';
import { resetUserState } from './redux/slices/userSlice';
import { zhDict } from './assets/zhDict';
import TextToSpeech from './pages/TextToSpeech';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import History from './pages/History';
import UserProfile from './pages/UserProfile';
import 'react-toastify/dist/ReactToastify.css';
import '@aws-amplify/ui-react/styles.css';
import { ToastContainer } from 'react-toastify';
import './App.css';
import { resetVoiceState } from './redux/slices/paramSlice';

I18n.setLanguage('zh-TW');
I18n.putVocabularies({ 'zh-TW': zhDict });

export default function MainApp() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        const updateAuthStatus = (event) => {
            if (event.payload.event === "signedIn") {
                setIsAuthenticated(true);
            } else if (event.payload.event === "signedOut") {
                setIsAuthenticated(false);
            }
            dispatch(resetHistoryState());
            dispatch(resetUserState());
            dispatch(resetVoiceState());
        };

        Hub.listen('auth', updateAuthStatus);

        getCurrentUser()
            .then(() => setIsAuthenticated(true))
            .catch(() => setIsAuthenticated(false));
    }, [dispatch]);

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
                            <Route path="/profile" element={<UserProfile />} />
                        </Routes>
                        <ToastContainer
                            position="top-center"
                            hideProgressBar={true}
                            pauseOnHover={true}
                            autoClose={8000}
                            closeOnClick={true}
                            theme='colored'
                            className='custom-toast'
                        />
                    </Router>
                )}
            </Authenticator>
        </div>
    );
}