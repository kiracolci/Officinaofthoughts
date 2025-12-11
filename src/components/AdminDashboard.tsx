import { useState } from "react";
import { CaseForm } from "./CaseForm";
import { ArticleForm } from "./ArticleForm";
import { CaseList } from "./CaseList";
import { ArticleList } from "./ArticleList";
import { Modal } from "./Modal";
import "./AdminDashboard.css";
import { TimelineModal } from "./TimelineModal";


interface AdminDashboardProps {
  onNavigateBack: () => void;
}

type DashboardTab = "cases" | "articles";

export function AdminDashboard({ onNavigateBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("cases");

  const [showCaseForm, setShowCaseForm] = useState(false);
  const [showArticleForm, setShowArticleForm] = useState(false);

  const [editingCase, setEditingCase] = useState<any>(null);
  const [editingArticle, setEditingArticle] = useState<any>(null);

  const handleCaseFormSuccess = () => {
    setShowCaseForm(false);
    setEditingCase(null);
  };

  const handleArticleFormSuccess = () => {
    setShowArticleForm(false);
    setEditingArticle(null);
  };
  const [timelineCase, setTimelineCase] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  

  const handleEditTimeline = (case_: any) => {
    setTimelineCase(case_);
  setShowTimelineModal(true);
};


  // 🔥 NEW: Convert a case from CaseList into the format your form expects
 // Convert a case from CaseList into the format CaseForm expects
 const handleEditCase = (selectedCase: any) => {
  setEditingCase({
    id: selectedCase._id,
    title: selectedCase.title,
    caseNumber: selectedCase.caseNumber,
    court: selectedCase.court,
    conclusionDate: selectedCase.conclusionDate,  // ⭐ ADD THIS
    originalLink: selectedCase.originalLink,
    summary: selectedCase.summary,
    comments: selectedCase.comments,
    keywords: selectedCase.keywords ?? [],
    relatedCases: selectedCase.relatedCases ?? [],
    timeline: selectedCase.timeline ?? [],         // ⭐ Also add this for consistency
  });

  setShowCaseForm(true); 
};


  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <button onClick={onNavigateBack} className="back-to-site-button">
          ← Back to site
        </button>
      </div>

      <div className="dashboard-tabs">
        <nav className="tabs-navigation">
          <button
            onClick={() => setActiveTab("cases")}
            className={`tab-button ${activeTab === "cases" ? "tab-active" : ""}`}
          >
            Manage Cases
          </button>
          <button
            onClick={() => setActiveTab("articles")}
            className={`tab-button ${activeTab === "articles" ? "tab-active" : ""}`}
          >
            Manage thoughts
          </button>
        </nav>
      </div>

      <div className="dashboard-content">
        {activeTab === "cases" && (
          <CaseList 
            onAddCase={() => {
              setEditingCase(null);
              setShowCaseForm(true); // 🔥 open clean form for new case
            }}
            onEditCase={handleEditCase} // 🔥 USE NEW FUNCTION
            onEditTimeline={handleEditTimeline}   // ⭐ NEW

          />
        )}

        {activeTab === "articles" && (
          <ArticleList 
            onAddArticle={() => setShowArticleForm(true)}
            onEditArticle={setEditingArticle}
          />
        )}
      </div>

      {(showCaseForm) && (
        <Modal onClose={handleCaseFormSuccess}>
          <CaseForm 
            onSuccess={handleCaseFormSuccess}
            initialData={editingCase ?? {}}
          />
        </Modal>
      )}

      {(showArticleForm || editingArticle) && (
        <Modal onClose={handleArticleFormSuccess}>
          <ArticleForm 
            onSuccess={handleArticleFormSuccess}
            initialData={editingArticle}
          />
        </Modal>
        
      )}
      {showTimelineModal && (
  <TimelineModal
    editing={true}
    case_={timelineCase}
    onClose={() => setShowTimelineModal(false)}
  />
)}

    </div>
    
  );
}
