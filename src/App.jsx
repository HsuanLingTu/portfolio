import { BrowserRouter, Routes, Route } from 'react-router'
import Home from './Home.jsx'
import About from './About.jsx'
import Work from './Work.jsx'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* English */}
        <Route path="/" element={<Home />} />
        <Route path="/work" element={<Work />} />
        <Route path="/about" element={<About />} />

        {/* Taiwan Mandarin */}
        <Route path="/zh-tw" element={<Home />} />
        <Route path="/zh-tw/work" element={<Work />} />
        <Route path="/zh-tw/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
