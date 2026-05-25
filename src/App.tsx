import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import ChildRoom from './pages/ChildRoom'
import ClassRoom2Page from './pages/ClassRoom2Page'
import ChildRoom4 from './pages/ChildRoom4'
import ChildRoom3 from './pages/ChildRoom3'
import ChildRoom5 from './pages/ChildRoom5'
import ChildRoom10 from './pages/ChildRoom10'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/child-room" element={<ChildRoom />} />
      <Route path="/child-room-2" element={<ClassRoom2Page />} />
      <Route path="/child-room-3" element={<ChildRoom3 />} />
      <Route path="/child-room-4" element={<ChildRoom4 />} />
      <Route path="/child-room-5" element={<ChildRoom5 />} />
      <Route path="/child-room-10" element={<ChildRoom10 />} />
    </Routes>
  )
}
