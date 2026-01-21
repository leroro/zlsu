import { Outlet } from 'react-router-dom';
import Header from './components/common/Header';
import ScrollToTop from './components/common/ScrollToTop';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      <Header />
      <main className="max-w-4xl mx-auto md:px-4 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
