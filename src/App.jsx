import { BrowserRouter, Routes, Route } from 'react-router'
import Home from './Home.jsx'
import About from './About.jsx'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* English */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Taiwan Manderin */}
        <Route path="/zh-tw" element={<Home />} />
        <Route path="/zh-tw/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
