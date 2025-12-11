import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import "./CaseList.css";

interface CaseListProps {
  onAddCase: () => void;
  onEditCase: (case_: any) => void;
  onEditTimeline: (case_: any) => void;   // ⭐ NEW
}

export function CaseList({
  onAddCase,
  onEditCase,
  onEditTimeline,   // ⭐ NEW
}: CaseListProps) {
  const cases = useQuery(api.cases.list, { limit: 50 });
  console.log("CaseList cases:", cases); // 👈 ADD THIS HERE

  const deleteCase = useMutation(api.cases.remove);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this case?")) {
      try {
        await deleteCase({ id: id as any });
        toast.success("Case deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete case");
      }
    }
  };

  return (
    <div className="case-list">
      <div className="list-header">
        <h2 className="list-title">Manage Cases</h2>
        <button onClick={onAddCase} className="add-button">
          <span className="add-icon">+</span>
          Add Case
        </button>
      </div>

      {cases === undefined ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : cases.length === 0 ? (
        <div className="empty-state">
          No cases found. Add your first case!
        </div>
      ) : (
        <div className="cases-grid">
          {cases.map((case_) => (
            <div key={case_._id} className="case-item">
              <div className="case-item-content">
                <div className="case-item-main">
                  <h3 className="case-item-title">{case_.title}</h3>
                  <div className="case-item-meta">
                    {case_.caseNumber && <span>Case No: {case_.caseNumber} • </span>}
                    {case_.court && <span>{case_.court} • </span>}
                    <span>
  {case_.conclusionDate
    ? new Date(case_.conclusionDate).toLocaleDateString()
    : "No date"}
</span>
                    </div>
                  <p className="case-item-summary">
                    {case_.summary.substring(0, 150)}...
                  </p>
                </div>
                <div className="case-item-actions">
                <button
  onClick={() => onEditCase(case_)}
  className="icon-button"
  title="Edit"
>
  <img src="/3.png" alt="Edit" className="icon-img" />
</button>

<button
  onClick={() => handleDelete(case_._id)}
  className="icon-button"
  title="Delete"
>
  <img src="/4.png" alt="Delete" className="icon-img" />
</button>

<button
  onClick={() => onEditTimeline(case_)}
  className="icon-button"
  title="Timeline"
>
  <img src="/5.png" alt="Timeline" className="icon-img" />
</button>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
