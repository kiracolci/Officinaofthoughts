import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import "./CaseDetail.css";
import { TimelineModal } from "./TimelineModal";

interface CaseDetailProps {
  caseId: string;
  onNavigateBack: () => void;
  onNavigateToCase: (id: string) => void;
}

export function CaseDetail({
  caseId,
  onNavigateBack,
  onNavigateToCase,
}: CaseDetailProps) {
  const case_ = useQuery(api.cases.getById, { id: caseId as any });

  // ⭐ timeline modal state
  const [showTimeline, setShowTimeline] = useState(false);

  // ------------------------------
  // LOADING + NOT FOUND
  // ------------------------------
  if (case_ === undefined) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (case_ === null) {
    return (
      <div className="not-found-container">
        <p className="not-found-text">Case not found.</p>
        <button onClick={onNavigateBack} className="back-link">
          ← Back to all cases
        </button>
      </div>
    );
  }

  // -------------------------------------------------
  // HANDLE INTERNAL LINK CLICKS INSIDE RICH TEXT
  // -------------------------------------------------
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    if (target.tagName.toLowerCase() !== "a") return;

    const href = target.getAttribute("href");
    if (!href) return;

    // internal case navigation
    if (href.startsWith("#case-")) {
      e.preventDefault();
      const id = href.replace("#case-", "").trim();
      onNavigateToCase(id);
    }
  };

  // -------------------------------------------------
  // MAIN PAGE RENDER
  // -------------------------------------------------
  return (
    <div className="case-detail-container">
      {/* BACK BUTTON */}
      <button onClick={onNavigateBack} className="back-button">
        ← Back to all cases
      </button>

      <article className="case-article">
        {/* HEADER */}
        <header className="case-header">
  <h1 className="case-title">{case_.title}</h1>

  {/* ORIGINAL LINK RIGHT UNDER TITLE */}
  {case_.originalLink && (
    <a
      href={case_.originalLink}
      target="_blank"
      rel="noopener noreferrer"
      className="external-link"
      style={{ marginTop: "6px", display: "inline-flex" }}
    >
      View Original Case
      <img src="/1.png" className="external-icon" />
    </a>
  )}

  {/* CASE CONCLUDED DATE ROW */}
  <div className="case-meta-line" style={{ marginTop: "12px" }}>
    <span style={{ color: "#9ca3af" }}>Case concluded:</span>{" "}
    {case_.conclusionDate ? (
      <span className="case-year-badge" style={{ fontSize: "13px" }}>
        {new Date(case_.conclusionDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </span>
    ) : (
      <span>No date available</span>
    )}
  </div>
</header>


        {/* TABLE OF CONTENTS */}
        <nav className="toc-box">
          <h2 className="toc-title">Contents</h2>


          <ul className="toc-list">

            
            <li>
              <a href="#summary" className="toc-link">
                Case Summary
              </a>
            </li>

            

            <li>
              <a href="#analysis" className="toc-link">
                Legal Analysis & Commentary
              </a>
            </li>

            {case_.keywords.length > 0 && (
              <li>
                <a href="#keywords" className="toc-link">
                  Keywords & Topics
                </a>
              </li>
            )}

            {case_.relatedCases.length > 0 && (
              <li>
                <a href="#related" className="toc-link">
                  Related Cases
                </a>
              </li>
            )}

            {/* ⭐ NEW — Timeline in TOC  i am revoing this point now but i can add before a if i want it in the content*/}
            {Array.isArray(case_?.timeline) && case_.timeline.length > 0 && (
              <li>
                <a
                  className="toc-link"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowTimeline(true)}
                >
                  
                </a>
              </li>
            )}
          </ul>
        </nav>

 {/* ⭐ TIMELINE SECTION */}
 {case_.timeline && case_.timeline.length > 0 && (
          <section id="timeline" className="section">
            <h2 className="section-title"></h2>

            <button
              className="timeline-view-btn"
              onClick={() => setShowTimeline(true)}
            >
              View Timeline
            </button>
          </section>
        )}
        {/* SUMMARY */}
        <section id="summary" className="section" onClick={handleContentClick}>
          <p className="section-title">Case Summary</p>

          <div
            className="section-text"
            dangerouslySetInnerHTML={{ __html: case_.summary }}
          />
        </section>

        {/* ANALYSIS */}
        <section id="analysis" className="section" onClick={handleContentClick}>
          <h2 className="section-title">Legal Analysis & Commentary</h2>

          <div
            className="section-text"
            dangerouslySetInnerHTML={{ __html: case_.comments }}
          />
        </section>

        {/* KEYWORDS */}
        {case_.keywords.length > 0 && (
          <section id="keywords" className="section">
            <h2 className="section-title">Keywords & Topics</h2>

            <div className="keywords-container">
              {case_.keywords.map((kw, i) => (
                <span key={i} className="keyword-tag">
                  {kw}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* RELATED CASES */}
        {case_.relatedCases.length > 0 && (
          <section id="related" className="section">
            <h2 className="section-title">Related Cases</h2>

            <div className="related-box">
              {case_.relatedCases.map((rc, i) => (
                <div key={i} className="related-item">
                  <span className="related-name">{rc.name}</span>

                  {rc.link && (
                    <a
                      href={rc.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="related-link"
                    >
                      <img src="/1.png" className="external-icon" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

       

        {/* FOOTER */}
        <footer className="case-footer">
          <p className="footer-text">
            Published: {new Date(case_.publishedAt).toLocaleDateString()}
          </p>

          {case_.updatedAt && (
            <p className="footer-text">
              Last edited: {new Date(case_.updatedAt).toLocaleDateString()}
            </p>
          )}

          <p className="footer-brand">Officina of Thoughts Legal Database</p>
        </footer>
      </article>

      {/* ⭐ TIMELINE MODAL */}
      {showTimeline && (
        <TimelineModal
          editing={false}
          timeline={case_.timeline}
          onClose={() => setShowTimeline(false)}
        />
      )}
    </div>
  );
}
