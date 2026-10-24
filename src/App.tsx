import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AuthProvider from './components/AuthProvider.tsx'
import Layout from './components/Layout.tsx'
import RequireAdmin from './components/RequireAdmin.tsx'
import ToastProvider from './components/Toast.tsx'
import ArticleForm from './pages/Articles/ArticleForm.tsx'
import ArticleList from './pages/Articles/ArticleList.tsx'
import Dashboard from './pages/Dashboard.tsx'
import ForestForm from './pages/Forests/ForestForm.tsx'
import ForestList from './pages/Forests/ForestList.tsx'
import Login from './pages/Login.tsx'
import QuizForm from './pages/Quiz/QuizForm.tsx'
import QuizList from './pages/Quiz/QuizList.tsx'
import SeedImport from './pages/SeedImport.tsx'
import WildlifeForm from './pages/Wildlife/WildlifeForm.tsx'
import WildlifeList from './pages/Wildlife/WildlifeList.tsx'

/** Admin routes (PRD §8.1). Every page except /login requires an admin. */
function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<RequireAdmin />}>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="/hutan" element={<ForestList />} />
                <Route path="/hutan/baru" element={<ForestForm />} />
                <Route path="/hutan/:id" element={<ForestForm />} />
                <Route path="/satwa" element={<WildlifeList />} />
                <Route path="/satwa/baru" element={<WildlifeForm />} />
                <Route path="/satwa/:id" element={<WildlifeForm />} />
                <Route path="/artikel" element={<ArticleList />} />
                <Route path="/artikel/baru" element={<ArticleForm />} />
                <Route path="/artikel/:id" element={<ArticleForm />} />
                <Route path="/kuis" element={<QuizList />} />
                <Route path="/kuis/baru" element={<QuizForm />} />
                <Route path="/kuis/:id" element={<QuizForm />} />
                <Route path="/impor" element={<SeedImport />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
