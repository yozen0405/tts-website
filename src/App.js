import { Amplify } from 'aws-amplify';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import config from './amplifyconfiguration.json';
import MainApp from './MainApp';

Amplify.configure(config);

export default function App() {
  return (
    <Provider store={store}>
      <MainApp />
    </Provider>
  );
}