import { HashRouter, Routes, Route } from 'react-router'
import Home from './Home.jsx'
import About from './About.jsx'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </HashRouter>
  )
}

export default App