import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import "./ArticleList.css";

interface ArticleListProps {
  onAddArticle: () => void;
  onEditArticle: (article: any) => void;
}

export function ArticleList({ onAddArticle, onEditArticle }: ArticleListProps) {
  const articles = useQuery(api.articles.list, { limit: 50 });
  const deleteArticle = useMutation(api.articles.remove);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      try {
        await deleteArticle({ id: id as any });
        toast.success("Article deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete article");
      }
    }
  };

  return (
    <div className="article-list">
      <div className="list-header">
        <h2 className="list-title">Manage Thoughts</h2>
        <button onClick={onAddArticle} className="add-button">
          <span className="add-icon">+</span>
          Add Thought
        </button>
      </div>

      {articles === undefined ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="empty-state">
          No thoughts found. Add your first thought!
        </div>
      ) : (
        <div className="articles-grid">
          {articles.map((article) => (
            <div key={article._id} className="article-item">
              <div className="article-item-content">
                <div className="article-item-main">
                  <h3 className="article-item-title">{article.title}</h3>
                  <p className="article-item-excerpt">{article.excerpt}</p>
                  <p className="article-item-content-preview">
                    {article.content.substring(0, 150)}...
                  </p>
                </div>
                <div className="article-item-actions">
                <button
  onClick={() =>
    onEditArticle({
      id: article._id,
      title: article.title,
      excerpt: article.excerpt,
      intro: article.intro,
      content: article.content,
      keywords: article.keywords,
      relatedCases: article.relatedCases,
    })
  }
  className="edit-button"
>
<img src="/3.png" alt="Edit" className="icon-img" />
</button>

                  <button
                    onClick={() => handleDelete(article._id)}
                    className="delete-button"
                  >
  <img src="/4.png" alt="Delete" className="icon-img" />
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
