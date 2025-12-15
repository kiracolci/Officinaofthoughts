import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import "./CaseForm.css";



interface CaseFormProps {
  onSuccess: () => void;
  initialData: {
    id?: string;
    title?: string;
    caseNumber?: string;
    court?: string;
    conclusionDate?: string;
    originalLink?: string;
    summary?: string;
    comments?: string;
    keywords?: string[];
    relatedCases?: { name: string; link?: string }[];
    timeline?: { date: string; title: string; description: string }[];
  } | null;
}

export function CaseForm({ onSuccess, initialData }: CaseFormProps) {
  console.log("🟡 CaseForm received initialData:", initialData);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    caseNumber: initialData?.caseNumber || "",
    court: initialData?.court || "",
    conclusionDate: initialData?.conclusionDate || "",
    originalLink: initialData?.originalLink || "",
    summary: initialData?.summary || "",
    comments: initialData?.comments || "",
    keywords: initialData?.keywords?.join(", ") || "",
    relatedCases: initialData?.relatedCases || [{ name: "", link: "" }],
  });

  // Sync form when editing an existing case
// Sync form when editing a case
useEffect(() => {
  if (!initialData) return;

  setFormData({
    title: initialData.title || "",
    caseNumber: initialData.caseNumber || "",
    court: initialData.court || "",
    conclusionDate: initialData.conclusionDate || "",
    originalLink: initialData.originalLink || "",
    summary: initialData.summary || "",
    comments: initialData.comments || "",
    keywords: initialData.keywords?.join(", ") || "",
    relatedCases: initialData.relatedCases?.length
      ? initialData.relatedCases
      : [{ name: "", link: "" }],
  });
}, [initialData]);

// ⭐ BLOCK RENDER UNTIL DATE EXISTS
if (initialData && initialData.conclusionDate && !formData.conclusionDate) {
  return null; // prevents early rendering
}



  const createCase = useMutation(api.cases.create);
  const updateCase = useMutation(api.cases.update);

  const [isLoading, setIsLoading] = useState(false);
  const [editingDate, setEditingDate] = useState(false);


  // ------------------------------
  // LINK INSERTION MODAL
  // ------------------------------
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkURL, setLinkURL] = useState("");
  const [targetField, setTargetField] = useState<"summary" | "comments" | null>(null);
  const [highlight, setHighlight] = useState({ start: 0, end: 0, text: "" });

  const handleContextMenu = (
    e: React.MouseEvent<HTMLTextAreaElement>,
    field: "summary" | "comments"
  ) => {
    e.preventDefault();
    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;

    const selectedText = textarea.value.substring(start, end);

    setHighlight({ start, end, text: selectedText });
    setTargetField(field);
    setShowLinkModal(true);
  };

  const insertLink = () => {
    if (!targetField || !highlight.text || !linkURL) return;

    const fieldValue = formData[targetField];
    const before = fieldValue.substring(0, highlight.start);
    const after = fieldValue.substring(highlight.end);

    const newValue =
      before +
      `<a href="${linkURL}" target="_blank">${highlight.text}</a>` +
      after;

    setFormData({ ...formData, [targetField]: newValue });
    setShowLinkModal(false);
    setLinkURL("");
  };

  // ------------------------------
  // SUBMIT FORM
  // ------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const caseData = {
        title: formData.title,
        caseNumber: formData.caseNumber || undefined,
        court: formData.court || undefined,
        conclusionDate: formData.conclusionDate || undefined,
        originalLink: formData.originalLink || undefined,
      
        summary: formData.summary.trim() || undefined,
        comments: formData.comments.trim() || undefined,
      
        keywords: formData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k.length > 0),
      
        relatedCases: formData.relatedCases
          .filter((c) => c.name.trim().length > 0)
          .map((c) => ({
            name: c.name.trim(),
            link: c.link?.trim() || undefined,
          })),
      
        timeline: initialData?.timeline || [],
      };
  

      if (initialData?.id) {
        await updateCase({ id: initialData.id as any, ...caseData });
        toast.success("Case updated successfully!");
      } else {
        await createCase(caseData);
        toast.success("Case created successfully!");
      }

      onSuccess();
    } catch (err) {
      toast.error("Failed to save case");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------
  // RELATED CASES MANAGEMENT
  // ------------------------------

  const addRelatedCase = () => {
    setFormData({
      ...formData,
      relatedCases: [...formData.relatedCases, { name: "", link: "" }],
    });
  };

  const removeRelatedCase = (index: number) => {
    setFormData({
      ...formData,
      relatedCases: formData.relatedCases.filter((_, i) => i !== index),
    });
  };

  const updateRelatedCase = (
    index: number,
    field: "name" | "link",
    value: string
  ) => {
    const updated = [...formData.relatedCases];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, relatedCases: updated });
  };

  // ------------------------------
  // UI
  // ------------------------------

  return (
    <div className="case-form">
      <h2 className="form-title">{initialData?.id ? "Edit Case" : "Add New Case"}</h2>

      <form onSubmit={handleSubmit} className="form-container">

        {/* Title */}
  <div className="form-field">
    <label className="form-label">Title *</label>
    <input
      type="text"
      value={formData.title}
      onChange={(e) =>
        setFormData({ ...formData, title: e.target.value })
      }
      className="form-input"
      required
    />
  </div>

        {/* Conclusion Date */}
        {initialData?.id ? (
  <div className="form-field">
    <label className="form-label">Conclusion Date</label>

    {!editingDate ? (
      <div className="date-display-row">
        <span className="date-display">
          {formData.conclusionDate
            ? new Date(formData.conclusionDate).toLocaleDateString()
            : "No date"}
        </span>

        <button
          type="button"
          onClick={() => setEditingDate(true)}
          className="edit-date-button"
        >
          Edit
        </button>
      </div>
    ) : (
      <input
        type="date"
        value={formData.conclusionDate}
        onChange={(e) =>
          setFormData({ ...formData, conclusionDate: e.target.value })
        }
        className="form-input"
      />
    )}
  </div>
) : (
  // Creating case → show full input
  <div className="form-field">
    <label className="form-label">Conclusion Date *</label>
    <input
      type="date"
      value={formData.conclusionDate}
      onChange={(e) =>
        setFormData({ ...formData, conclusionDate: e.target.value })
      }
      className="form-input"
      required
    />
  </div>
)}


        {/* GRID FIELDS */}
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Case Number</label>
            <input
              type="text"
              value={formData.caseNumber}
              onChange={(e) =>
                setFormData({ ...formData, caseNumber: e.target.value })
              }
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Court</label>
            <input
              type="text"
              value={formData.court}
              onChange={(e) =>
                setFormData({ ...formData, court: e.target.value })
              }
              className="form-input"
            />
          </div>
        </div>

        {/* ORIGINAL LINK */}
        <div className="form-field">
          <label className="form-label">Original Link</label>
          <input
            type="url"
            value={formData.originalLink}
            onChange={(e) =>
              setFormData({ ...formData, originalLink: e.target.value })
            }
            className="form-input"
          />
        </div>

        {/* SUMMARY */}
        <div className="form-field">
          <label className="form-label">Summary</label>
          <textarea
  value={formData.summary}
  onChange={(e) =>
    setFormData({ ...formData, summary: e.target.value })
  }
  onContextMenu={(e) => handleContextMenu(e, "summary")}
  rows={6}
  className="form-textarea"
/>

        </div>

        {/* COMMENTS */}
        <div className="form-field">
          <label className="form-label">Comments & Analysis</label>
          <textarea
            value={formData.comments}
            onChange={(e) =>
              setFormData({ ...formData, comments: e.target.value })
            }
            onContextMenu={(e) => handleContextMenu(e, "comments")}
            rows={6}
            className="form-textarea"
            required
          />
        </div>

        {/* KEYWORDS */}
        <div className="form-field">
          <label className="form-label">Keywords (comma-separated)</label>
          <input
            type="text"
            value={formData.keywords}
            onChange={(e) =>
              setFormData({ ...formData, keywords: e.target.value })
            }
            className="form-input"
            placeholder="contract law, breach, damages"
          />
        </div>

        {/* RELATED CASES */}
        <div className="form-field">
          <div className="related-cases-header">
            <label className="form-label">Related Cases</label>
            <button
              type="button"
              onClick={addRelatedCase}
              className="add-case-button"
            >
              + Add Case
            </button>
          </div>

          <div className="related-cases-list">
            {formData.relatedCases.map((related, index) => (
              <div key={index} className="related-case-row">
                <input
                  type="text"
                  placeholder="Case name"
                  value={related.name}
                  onChange={(e) =>
                    updateRelatedCase(index, "name", e.target.value)
                  }
                  className="form-input-small"
                />

                <input
                  type="url"
                  placeholder="Link (optional)"
                  value={related.link || ""}
                  onChange={(e) =>
                    updateRelatedCase(index, "link", e.target.value)
                  }
                  className="form-input-small"
                />

                <button
                  type="button"
                  onClick={() => removeRelatedCase(index)}
                  className="remove-case-button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FORM ACTIONS */}
        <div className="form-actions">
          <button type="submit" disabled={isLoading} className="submit-button">
            {isLoading
              ? "Saving..."
              : initialData?.id
              ? "Update Case"
              : "Create Case"}
          </button>

          <button
            type="button"
            onClick={onSuccess}
            className="cancel-button"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* LINK MODAL */}
      {showLinkModal && (
        <div className="link-modal">
          <div className="link-modal-content">
            <h3>Add URL Link</h3>
            <input
              type="url"
              value={linkURL}
              placeholder="https://example.com"
              onChange={(e) => setLinkURL(e.target.value)}
            />

            <div className="link-modal-actions">
              <button onClick={insertLink} className="submit-button">
                Insert
              </button>
              <button
                onClick={() => setShowLinkModal(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
