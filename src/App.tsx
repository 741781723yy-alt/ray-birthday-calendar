import { lazy, Suspense, useState, useCallback } from 'react'
import { Routes, Route } from 'react-router'
import PreloadScreen from './components/PreloadScreen'

// 首页直接加载，其余页面懒加载
const Home = lazy(() => import('./pages/Home'))
const ChildRoom = lazy(() => import('./pages/ChildRoom'))
const ClassRoom2Page = lazy(() => import('./pages/ClassRoom2Page'))
const ChildRoom3 = lazy(() => import('./pages/ChildRoom3'))
const ChildRoom4 = lazy(() => import('./pages/ChildRoom4'))
const ChildRoom5 = lazy(() => import('./pages/ChildRoom5'))
const ChildRoom6 = lazy(() => import('./pages/ChildRoom6'))
const ChildRoom7 = lazy(() => import('./pages/ChildRoom7'))
const ChildRoom8 = lazy(() => import('./pages/ChildRoom8'))
const ChildRoom9 = lazy(() => import('./pages/ChildRoom9'))
const ChildRoom10 = lazy(() => import('./pages/ChildRoom10'))
const ChildRoom12 = lazy(() => import('./pages/ChildRoom12'))
const Ending = lazy(() => import('./pages/Ending'))

function Loading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#1a0a2e',
      color: '#fff',
      fontSize: '1.2rem',
    }}>
      加载中...
    </div>
  )
}

export default function App() {
  const [preloaded, setPreloaded] = useState(false);

  const handlePreloadComplete = useCallback(() => {
    setPreloaded(true);
  }, []);

  return (
    <>
      {!preloaded && <PreloadScreen onComplete={handlePreloadComplete} />}
      {preloaded && (
        <Suspense fallback={<Loading />}>
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
        </Suspense>
      )}
    </>
  )
}
