import { Doc } from "../../convex/_generated/dataModel";
import "./CaseCard.css";

interface CaseCardProps {
  case: Doc<"cases">;
  onClick: () => void;
}

export function CaseCard({ case: case_, onClick }: CaseCardProps) {
  return (
    <div className="casecard" onClick={onClick}>
      {/* LEFT GOLD LINE */}
      <div className="casecard-highlight" />

      <div className="casecard-content">
        

{/* ✅ SUMMARY — appears ONLY on hover */}

        {/* TITLE + EXTERNAL LINK */}
        <div className="casecard-top">
          <h3 className="casecard-title">{case_.title}</h3>

          {case_.originalLink && (
            <a
              href={case_.originalLink}
              className="casecard-extlink"
              onClick={(e) => e.stopPropagation()}
              target="_blank"
              rel="noopener noreferrer"
            >
            </a>
          )}
        </div>


        {/* BADGES */}
<div className="casecard-badges">
  {case_.conclusionDate && (
    <span className="badge-year">
      {new Date(case_.conclusionDate).getFullYear()}
    </span>
  )}

  {case_.keywords?.slice(0, 3).map((k, i) => (
    <span key={i} className="badge-keyword">{k}</span>
  ))}
</div>


        {/* ADDITIONAL METADATA */}
        <div className="casecard-meta">
          {case_.caseNumber && (
            <p><strong>Case Number:</strong> {case_.caseNumber}</p>
          )}

          {case_.court && (
            <p><strong>Court:</strong> {case_.court}</p>
          )}
        </div>
        

        {/* FOOTER */}
        <div className="casecard-footer">

{/* ONE HORIZONTAL DATE ROW */}
<div className="date-row">
  <div className="casecard-date">
    <img src="/6.png" alt="calendar icon" className="date-icon" />
    {new Date(case_._creationTime).toLocaleDateString()}
  </div>
</div>


<div className="casecard-more">Read case →</div>
</div>


      </div>
    </div>
  );
}
