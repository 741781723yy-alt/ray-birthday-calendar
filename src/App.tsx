import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import ChildRoom from './pages/ChildRoom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/child-room" element={<ChildRoom />} />
    </Routes>
  )
}
