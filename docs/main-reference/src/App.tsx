/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home } from "./pages/Home";
import { AllProjects } from "./pages/AllProjects";
import { ProjectDetail } from "./pages/ProjectDetail";
import { About } from "./pages/About";
import { ThemeProvider } from "./app/providers/theme-provider";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from "react-router-dom";

function ScrollToTop() {
	const { pathname } = useLocation();
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);
	return null;
}

export default function App() {
	const basename = import.meta.env.BASE_URL;

	return (
		<ThemeProvider defaultTheme="dark">
			<Router basename={basename}>
				<div className="min-h-screen font-sans selection:bg-white/20">
					{/* Background Mesh */}
					<div className="mesh-bg">
						<div className="mesh-blob blob-1"></div>
						<div className="mesh-blob blob-2"></div>
						<div className="mesh-blob blob-3"></div>
					</div>

					<Navbar />
					<ScrollToTop />
					<main>
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/projects" element={<AllProjects />} />
							<Route path="/projects/:slug" element={<ProjectDetail />} />
							<Route path="/about" element={<About />} />
						</Routes>
					</main>
					<Footer />
				</div>
			</Router>
		</ThemeProvider>
	);
}
