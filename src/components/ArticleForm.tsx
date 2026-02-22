import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import "./ArticleForm.css";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Superscript from "@tiptap/extension-superscript";
import { TextStyle } from "@tiptap/extension-text-style";

interface RelatedCase {
  name: string;
  link?: string;
}

interface ArticleFormProps {
  onSuccess: () => void;
  initialData?: {
    id?: string;
    title?: string;
    excerpt?: string;
    intro?: string;
    content?: string;
    keywords?: string[];
    relatedCases?: RelatedCase[];
  };
}

export function ArticleForm({ onSuccess, initialData }: ArticleFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    excerpt: initialData?.excerpt || "",
    intro: initialData?.intro || "",
    content: initialData?.content || "",
    keywords: initialData?.keywords?.join(", ") || "",
    relatedCases:
      initialData?.relatedCases || [{ name: "", link: "" }],
  });

    const [isLoading, setIsLoading] = useState(false);

  // -----------------------
  // LINK INSERTION
  // -----------------------
  const [showModal, setShowModal] = useState(false);
  const [linkURL, setLinkURL] = useState("");
  const [targetField, setTargetField] = useState<"intro" | "content" | null>(null);
  const [highlight, setHighlight] = useState({ start: 0, end: 0, text: "" });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Superscript,
      TextStyle,
    ],
    content: formData.content || "",
    onUpdate: ({ editor }) => {
      setFormData({
        ...formData,
        content: editor.getHTML(),
      });
    },
  });

  const introEditor = useEditor({
    extensions: [
      StarterKit,
      Superscript,
      TextStyle,
    ],
    content: formData.intro || "",
    onUpdate: ({ editor }) => {
      setFormData({
        ...formData,
        intro: editor.getHTML(),
      });
    },
  });

  const openLinkModal = (
    e: React.MouseEvent<HTMLTextAreaElement>,
    field: "intro" | "content"
  ) => {
    e.preventDefault();

    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) return;

    setHighlight({
      start,
      end,
      text: textarea.value.substring(start, end),
    });

    setTargetField(field);
    setShowModal(true);
  };

  const insertLink = () => {
    if (!targetField) return;

    const oldValue = formData[targetField];
    const before = oldValue.substring(0, highlight.start);
    const after = oldValue.substring(highlight.end);

    const newValue =
      before +
      `<a href="${linkURL}" target="_blank">${highlight.text}</a>` +
      after;

    setFormData({ ...formData, [targetField]: newValue });
    setShowModal(false);
    setLinkURL("");
  };

  // -----------------------
  // RELATED CASES
  // -----------------------
  const addRelatedCase = () => {
    setFormData({
      ...formData,
      relatedCases: [...formData.relatedCases, { name: "", link: "" }],
    });
  };

  const removeRelatedCase = (i: number) => {
    setFormData({
      ...formData,
      relatedCases: formData.relatedCases.filter((_, idx) => idx !== i),
    });
  };

  const updateRelatedCase = (
    i: number,
    field: "name" | "link",
    value: string
  ) => {
    const updated = [...formData.relatedCases];
    updated[i] = { ...updated[i], [field]: value };
    setFormData({ ...formData, relatedCases: updated });
  };

  // -----------------------
// MUTATIONS
// -----------------------
const createArticle = useMutation(api.articles.create);
const updateArticle = useMutation(api.articles.update);

// -----------------------
// SUBMIT
// -----------------------
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  const payload = {
    title: formData.title,
    excerpt: formData.excerpt,
    intro: formData.intro,
    content: formData.content,
    keywords: formData.keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0),
    relatedCases: formData.relatedCases.filter((c) => c.name.trim() !== "")
  };

  try {
    if (initialData?.id) {
      await updateArticle({
        id: initialData.id as any,
        ...payload
      });
      toast.success("Article updated!");
    } else {
      await createArticle(payload);
      toast.success("Article created!");
    }
    

    onSuccess();
  } catch (err) {
    console.error(err);
    toast.error("Failed to save article");
  } finally {
    setIsLoading(false);
  }
};


  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="article-form">
      <h2 className="form-title">
        {initialData ? "Edit Article" : "Add Article"}
      </h2>

      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Title *</label>
          <input
            className="form-input"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>

        <div className="form-field">
          <label>Subtitle *</label>
          <textarea
            className="form-textarea"
            rows={3}
            value={formData.excerpt}
            onChange={(e) =>
              setFormData({ ...formData, excerpt: e.target.value })
            }
            required
          />
        </div>

        <div className="form-field">
          <label>Summary *</label>
          <div className="editor-wrapper">

  <div className="editor-toolbar">

    <select
      onChange={(e) => {
        const value = e.target.value;

        if (value === "paragraph") {
          introEditor?.chain().focus().setParagraph().run();
        } else {
          const level = Number(value) as 1 | 2 | 3 | 4 | 5 | 6;
          introEditor?.chain().focus().toggleHeading({ level }).run();
        }
      }}
      defaultValue="paragraph"
    >
      <option value="paragraph">Paragraph</option>
      <option value="1">Heading 1</option>
      <option value="2">Heading 2</option>
      <option value="3">Heading 3</option>
    </select>

    <button
      type="button"
      onClick={() => introEditor?.chain().focus().toggleBold().run()}
    >
      B
    </button>

    <button
      type="button"
      onClick={() => introEditor?.chain().focus().toggleItalic().run()}
    >
      I
    </button>

    <button
      type="button"
      onClick={() => introEditor?.chain().focus().toggleSuperscript().run()}
    >
      Sup
    </button>

  </div>

  <div className="editor-scroll-area">
    <EditorContent editor={introEditor} />
  </div>

</div>
        </div>

        <div className="form-field">
  <label>Main Content *</label>
  <div className="editor-wrapper">

<div className="editor-toolbar">

  {/* DROPDOWN */}
  <select
  onChange={(e) => {
    const value = e.target.value;

    if (value === "paragraph") {
      editor?.chain().focus().setParagraph().run();
    } else {
      const level = Number(value) as 1 | 2 | 3 | 4 | 5 | 6;
      editor?.chain().focus().toggleHeading({ level }).run();
    }
  }}
  defaultValue="paragraph"
>
  <option value="paragraph">Paragraph</option>
  <option value="1">List</option>
  <option value="2">Orange title</option>
  <option value="3">Footnoots</option>
</select>

  {/* BOLD */}
  <button
    type="button"
    onClick={() => editor?.chain().focus().toggleBold().run()}
  >
    B
  </button>

  {/* ITALIC */}
  <button
    type="button"
    onClick={() => editor?.chain().focus().toggleItalic().run()}
  >
    I
  </button>

  {/* SUPERSCRIPT */}
  <button
    type="button"
    onClick={() => editor?.chain().focus().toggleSuperscript().run()}
  >
    Sup
  </button>

</div>

<div className="editor-scroll-area">
  <EditorContent editor={editor} />
</div>

</div>
 

   

  
</div>

        <div className="form-field">
          <label>Keywords (comma-separated)</label>
          <input
            className="form-input"
            value={formData.keywords}
            onChange={(e) =>
              setFormData({ ...formData, keywords: e.target.value })
            }
          />
        </div>

        <div className="form-field">
          <label>Related Cases</label>
          {formData.relatedCases.map((rc, i) => (
            <div key={i} className="related-case-row">
              <input
                className="form-input-small"
                placeholder="Case name"
                value={rc.name}
                onChange={(e) =>
                  updateRelatedCase(i, "name", e.target.value)
                }
              />
              <input
                className="form-input-small"
                placeholder="URL (optional)"
                value={rc.link}
                onChange={(e) =>
                  updateRelatedCase(i, "link", e.target.value)
                }
              />
              <button type="button" onClick={() => removeRelatedCase(i)}>
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className="add-case-button"
            onClick={addRelatedCase}
          >
            + Add Case
          </button>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? "Saving..." : "Save Article"}
          </button>
          <button type="button" onClick={onSuccess} className="cancel-button">
            Cancel
          </button>
        </div>
      </form>

      {showModal && (
        <div className="link-modal">
          <div className="link-modal-content">
            <h3>Add Link</h3>
            <input
              type="url"
              value={linkURL}
              placeholder="https://example.com"
              onChange={(e) => setLinkURL(e.target.value)}
            />
            <div className="link-modal-actions">
              <button onClick={insertLink}>Insert</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
