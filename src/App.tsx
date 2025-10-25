import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Frontend Trading Application</h1>
        <p>React 19 + TypeScript + Vite</p>
        <div className="card">
          <button onClick={() => setCount(count => count + 1)}>
            count is {count}
          </button>
        </div>
        <p className="read-the-docs">
          Docker-first development environment with hot module replacement
        </p>
      </header>
    </div>
  );
}

export default App;
