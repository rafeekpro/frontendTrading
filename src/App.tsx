import { ThemeProvider } from './components/ThemeProvider';
import ComponentShowcase from './pages/ComponentShowcase';

function App() {
  return (
    <ThemeProvider>
      <ComponentShowcase />
    </ThemeProvider>
  );
}

export default App;
