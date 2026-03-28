import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom"

import { SiteLayout } from "@/components/layout/site-layout"
import { AboutPage } from "@/pages/about-page"
import { AllProjectsPage } from "@/pages/all-projects-page"
import { HomePage } from "@/pages/home-page"
import { ProjectDetailPage } from "@/pages/project-detail-page"

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route element={<HomePage />} path="/" />
          <Route element={<AllProjectsPage />} path="/projects" />
          <Route element={<ProjectDetailPage />} path="/projects/:slug" />
          <Route element={<AboutPage />} path="/about" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
