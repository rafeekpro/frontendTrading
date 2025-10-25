import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Layout } from './components/layout';
import ComponentShowcase from './pages/ComponentShowcase';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Layout>
          <ComponentShowcase />
        </Layout>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
