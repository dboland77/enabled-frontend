import Link from '@mui/material/Link';
import { Provider } from 'react-redux';
import ThemeProvider from '@/theme';
import { store } from '@/store/store';
import './frontend/global.css';

export default function Home() {
  return (
    <Provider store={store}>
      <div className="row">
        <div className="col-12">
          <h1 className="header">Supabase Auth + Storage</h1>
          <p>
            Experience our Auth and Storage through a simple profile management example. Create a
            user profile and upload an avatar image. Fast, simple, secure.
          </p>
        </div>
        <div className="col-6 form-widget">
          <Link href="/login">Auth page</Link>
        </div>
      </div>
    </Provider>
  );
}
