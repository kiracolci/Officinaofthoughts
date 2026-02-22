import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "./ArticleDetail.css";


interface ArticleDetailProps {
  articleId: string;
  onNavigateBack: () => void;
  onNavigateToCase: (id: string) => void;
}

interface Article {
  title: string;
  excerpt: string;
  intro: string;
  content: string;
  publishedAt?: string;   // 👈 ADD THIS
  keywords: string[];
  relatedCases?: { name: string; link?: string }[];
}

export function ArticleDetail({
  articleId,
  onNavigateBack,
  onNavigateToCase,
}: ArticleDetailProps) {
  const articles = useQuery(api.articles.list, {}) as
  | (Article & { _id: Id<"articles"> })[]
  | undefined;

const article =
  articles?.find((a) => a._id === articleId) ?? null;

  

  // LOADING
  if (articles === undefined) {
    return (
      <div className="article-loading-screen">
        <div className="lds-dual-ring"></div>
      </div>
    );
  }

  // NOT FOUND
  if (article === null) {
    return (
      <div className="article-notfound-screen">
        <p className="nf-title">Article not found.</p>
        <button className="nf-back" onClick={onNavigateBack}>
          ← Back
        </button>
      </div>
    );
  }

  // SAFE RELATED CASES
  const relatedCases =
    Array.isArray(article.relatedCases) ? article.relatedCases : [];

  // INTERNAL LINK HANDLING
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    if (target.tagName.toLowerCase() !== "a") return;
    const href = target.getAttribute("href");
    if (!href) return;

    if (href.startsWith("#case-")) {
      e.preventDefault();
      const id = href.replace("#case-", "");
      onNavigateToCase(id);
    }
  };

  return (
    <div className="article-wrapper">
      <button className="back-nav" onClick={onNavigateBack}>
        ← Back to all content
      </button>

      <article className="article-card">
        {/* TITLE */}
        <h1 className="article-title-display">{article.title}</h1>

{article.publishedAt && (
  <p className="article-date">
    Published on{" "}
    {new Date(article.publishedAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}
  </p>
)}

<p className="article-subtitle">{article.excerpt}</p>
{/* KEYWORDS */}
{article.keywords.length > 0 && (
          <section id="keywords" className="article-section">
            <h2 className="section-title">Keywords</h2>
            <div className="keywords-container">
              {article.keywords.map((kw, i) => (
                <span className="keyword-tag" key={i}>
                  {kw}
                </span>
              ))}
            </div>
          </section>
        )}


        {/* INTRO */}
        <section id="intro" className="article-section">
          <h2 className="section-title">Summary</h2>
          <div
            className="section-text"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: article.intro }}
          />
        </section>

        {/* MAIN TEXT */}
        <section id="content" className="article-section">
          <h2 className="section-title">Full Text</h2>
          <div
            className="section-text"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </section>

  
        {/* RELATED CASES */}
        {relatedCases.length > 0 && (
          <section id="related" className="article-section">
            <h2 className="section-title">Bibliography</h2>

            <div className="related-box">
              {relatedCases.map((rc, i) => (
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
      </article>
    </div>
  );
}
