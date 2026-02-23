import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";

import { HomePage } from "./components/HomePage";
import { CaseDetail } from "./components/CaseDetail";
import { ArticleDetail } from "./components/ArticleDetail";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminLogin } from "./components/AdminLogin";

import "./App.css";

export default function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const navigate = useNavigate();

  /* ---------------- SECRET SHORTCUT ---------------- */

  useEffect(() => {
    const pressed = new Set<string>();

    const downHandler = (e: KeyboardEvent) => {
      pressed.add(e.key.toLowerCase());

      if (e.shiftKey && pressed.has("t") && pressed.has("s") && pressed.has("l")) {
        navigate("/admin-login");
      }
    };

    const upHandler = (e: KeyboardEvent) => {
      pressed.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [navigate]);

  /* ---------------- NAVIGATION ---------------- */

  const navigateToHome = () => navigate("/");
  const navigateToCase = (id: string) => navigate(`/case/${id}`);
  const navigateToArticle = (id: string) => navigate(`/article/${id}`);
  const navigateToAdminLogin = () => navigate("/admin-login");
  const navigateToAdminDashboard = () => navigate("/admin-dashboard");

  const handleAdminLogin = (success: boolean) => {
    if (success) {
      setIsAdminAuthenticated(true);
      navigateToAdminDashboard();
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    navigateToHome();
  };

  /* ---------------- LAYOUT ---------------- */

  return (
    <div className="app-container">

      {/* ---------------- HEADER ---------------- */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-inner">

            <button onClick={navigateToHome} className="app-logo-button">
              <img
                src="/cir1.png"
                alt="Officina of Thoughts"
                className="app-logo-img"
              />
            </button>

            <nav className="nav-menu">
              <button className="nav-button" onClick={() => setShowAbout(true)}>
                About Me
              </button>

              {isAdminAuthenticated && (
                <>
                  <button
                    onClick={navigateToAdminDashboard}
                    className="nav-button"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleAdminLogout}
                    className="nav-button nav-logout"
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>

          </div>
        </div>
      </header>

      {/* ---------------- ABOUT MODAL ---------------- */}
      {showAbout && (
        <div className="about-modal-overlay" onClick={() => setShowAbout(false)}>
          <div className="about-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="about-title">Matteo Valera</h2>
            <p className="about-subtitle">EU Law • Compliance • Research</p>

            <p className="about-text">
              I’m an EU Business Law graduate focusing on competition law,
              data protection, cybersecurity, and how EU institutions shape
              the digital and regulatory landscape.
            </p>

            <p className="about-text">
              I’ve participated in the European Law Moot Court as Legal Counsel
              and contributed to research on EU rule of law and institutional design.
            </p>

            <p className="about-text">
              I enjoy exploring how legal reasoning, technology, and policy work
              together to shape our everyday world.
            </p>

            <button
              className="about-link-button"
              onClick={() => {
                window.open("https://www.linkedin.com/in/matteo-valera/", "_blank");
                setShowAbout(false);
              }}
            >
              Connect with me on LinkedIn!
            </button>
          </div>
        </div>
      )}

      {/* ---------------- PAGE CONTENT ---------------- */}
      <main className="main-content">
        <Routes>

          <Route
            path="/"
            element={
              <HomePage
                onNavigateToCase={navigateToCase}
                onNavigateToArticle={navigateToArticle}
              />
            }
          />

          <Route path="/case/:id" element={<CaseWrapper />} />
          <Route path="/article/:id" element={<ArticleWrapper />} />

          <Route
            path="/admin-login"
            element={
              <AdminLogin
                onLogin={handleAdminLogin}
                onNavigateBack={navigateToHome}
              />
            }
          />

          {isAdminAuthenticated && (
            <Route
              path="/admin-dashboard"
              element={<AdminDashboard onNavigateBack={navigateToHome} />}
            />
          )}

        </Routes>
      </main>

      <Toaster />
    </div>
  );
}

/* ---------------- WRAPPERS ---------------- */

function CaseWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <CaseDetail
      caseId={id!}
      onNavigateBack={() => navigate("/")}
      onNavigateToCase={(id) => navigate(`/case/${id}`)}
    />
  );
}

function ArticleWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <ArticleDetail
      articleId={id!}
      onNavigateBack={() => navigate("/")}
      onNavigateToCase={(id) => navigate(`/case/${id}`)}
    />
  );
}