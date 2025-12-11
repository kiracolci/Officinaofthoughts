import { Doc } from "../../convex/_generated/dataModel";
import "./ArticleCard.css";

interface ArticleCardProps {
  article: Doc<"articles">;
  onClick: () => void;
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  return (
    <div className="articlecard" onClick={onClick}>
      {/* LEFT LINE */}
      <div className="articlecard-highlight" />

      {/* TITLE */}
      <h3 className="articlecard-title">{article.title}</h3>
<div className="articlecard-author">By Matteo Valera</div>



      {/* EXCERPT */}
      <p className="articlecard-excerpt">{article.excerpt}</p>

      {/* KEYWORDS */}
      {article.keywords.length > 0 && (
        <div className="articlecard-keywords">
          {article.keywords.slice(0, 4).map((k, i) => (
            <span key={i} className="articlecard-tag">{k}</span>
          ))}
        </div>
      )}

      {/* FOOTER */}
      <div className="articlecard-footer">

  <div className="articlecard-date-row">
    <div className="articlecard-date">
      <img src="/6.png" className="articlecard-date-icon" />
      {new Date(article.publishedAt).toLocaleDateString()}
    </div>

    {article.updatedAt && (
      <div className="articlecard-date edited-date">
        Last edited: {new Date(article.updatedAt).toLocaleDateString()}
      </div>
    )}
  </div>

  <div className="articlecard-more">Read more →</div>
</div>


    </div>
  );
}
