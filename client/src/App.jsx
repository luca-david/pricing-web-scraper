import { Navigate, Route, Routes } from 'react-router-dom'

import HomePage from './pages/HomePage.jsx'
import CAndAPage from './pages/CAndAPage.jsx'


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/canda" element={<CAndAPage />} />
    </Routes>
  )
}
