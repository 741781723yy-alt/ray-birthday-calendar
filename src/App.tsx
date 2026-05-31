import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import ChildRoom from './pages/ChildRoom'
import ClassRoom2Page from './pages/ClassRoom2Page'
import ChildRoom4 from './pages/ChildRoom4'
import ChildRoom3 from './pages/ChildRoom3'
import ChildRoom5 from './pages/ChildRoom5'
import ChildRoom6 from './pages/ChildRoom6'
import ChildRoom7 from './pages/ChildRoom7'
import ChildRoom8 from './pages/ChildRoom8'
import ChildRoom9 from './pages/ChildRoom9'
import ChildRoom10 from './pages/ChildRoom10'
import ChildRoom12 from './pages/ChildRoom12'
import Ending from './pages/Ending'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/child-room" element={<ChildRoom />} />
      <Route path="/child-room-2" element={<ClassRoom2Page />} />
      <Route path="/child-room-3" element={<ChildRoom3 />} />
      <Route path="/child-room-4" element={<ChildRoom4 />} />
      <Route path="/child-room-5" element={<ChildRoom5 />} />
      <Route path="/child-room-6" element={<ChildRoom6 />} />
      <Route path="/child-room-7" element={<ChildRoom7 />} />
      <Route path="/child-room-8" element={<ChildRoom8 />} />
      <Route path="/child-room-9" element={<ChildRoom9 />} />
      <Route path="/child-room-10" element={<ChildRoom10 />} />
      <Route path="/child-room-12" element={<ChildRoom12 />} />
      <Route path="/ending" element={<Ending />} />
    </Routes>
  )
}
