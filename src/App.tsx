import { Outlet } from 'react-router-dom';
import Header from './components/common/Header';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto md:px-4 md:py-8 py-4">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
