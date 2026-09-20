import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center bg-background text-primary p-4">
        <div className="max-w-md w-full bg-surface shadow-sm rounded-lg p-8 border border-border">
          <h1 className="text-3xl font-bold mb-2">Hello Anoir</h1>
          <p className="text-muted">Welcome to the frontend setup for ft_transcendence.</p>
        </div>
      </div>
    </Router>
  )
}

export default App
