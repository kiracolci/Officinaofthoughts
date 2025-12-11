import { useState } from "react";
import { Toaster } from "sonner";
import { HomePage } from "./components/HomePage";
import { CaseDetail } from "./components/CaseDetail";
import { ArticleDetail } from "./components/ArticleDetail";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminLogin } from "./components/AdminLogin";
import { useEffect } from "react";


import "./App.css";

type Page =
  | { type: "home" }
  | { type: "case"; id: string }
  | { type: "article"; id: string }
  | { type: "admin-login" }
  | { type: "admin-dashboard" };

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>({ type: "home" });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    const pressed = new Set<string>();
  
    const downHandler = (e: KeyboardEvent) => {
      pressed.add(e.key.toLowerCase());
  
      const hasShift = e.shiftKey;
      const hasT = pressed.has("t");
      const hasS = pressed.has("s");
      const hasL = pressed.has("l");
  
      if (hasShift && hasT && hasS && hasL) {
        navigateToAdminLogin();
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
  }, []);
  
  /* ---------------- NAVIGATION ---------------- */

  const navigateToHome = () => setCurrentPage({ type: "home" });
  const navigateToCase = (id: string) => setCurrentPage({ type: "case", id });
  const navigateToArticle = (id: string) =>
    setCurrentPage({ type: "article", id });
  const navigateToAdminLogin = () => setCurrentPage({ type: "admin-login" });
  const navigateToAdminDashboard = () =>
    setCurrentPage({ type: "admin-dashboard" });

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
            {/* Logo / Title */}
            <button onClick={navigateToHome} className="app-title">
              <span className="title-officina">Officina</span>{" "}
              <span className="title-thoughts">of Thoughts</span>
            </button>

            {/* Navigation */}
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
    <div
      className="about-modal"
      onClick={(e) => e.stopPropagation()}
    >
      
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

      {/* ⭐ Single stylish button that also closes the modal */}
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
        {currentPage.type === "home" && (
          <HomePage
            onNavigateToCase={navigateToCase}
            onNavigateToArticle={navigateToArticle}
          />
        )}

        {currentPage.type === "case" && (
          <CaseDetail
            caseId={currentPage.id}
            onNavigateBack={navigateToHome}
            onNavigateToCase={navigateToCase}
          />
        )}

{currentPage.type === "article" && (
  <ArticleDetail
    articleId={currentPage.id}
    onNavigateBack={navigateToHome}
    onNavigateToCase={navigateToCase}   // ⭐ REQUIRED
  />
)}


        {currentPage.type === "admin-login" && (
          <AdminLogin
            onLogin={handleAdminLogin}
            onNavigateBack={navigateToHome}
          />
        )}

        {currentPage.type === "admin-dashboard" &&
          isAdminAuthenticated && (
            <AdminDashboard onNavigateBack={navigateToHome} />
          )}
      </main>

      <Toaster />
    </div>
  );
}
