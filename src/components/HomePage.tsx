import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SearchFilters } from "./SearchFilters";
import { CaseCard } from "./CaseCard";
import { ArticleCard } from "./ArticleCard";
import "./HomePage.css";

export function HomePage({
  onNavigateToCase,
  onNavigateToArticle,
}: {
  onNavigateToCase: (id: string) => void;
  onNavigateToArticle: (id: string) => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedCourt, setSelectedCourt] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState("cases");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [searchType, setSearchType] = useState<"cases" | "articles">("cases");


  const cases = useQuery(api.cases.search, {
    searchTerm: searchTerm || undefined,
    year: selectedYear,
    court: selectedCourt,
  });

  const articles = useQuery(api.articles.search, {
    searchTerm: searchTerm || "",
  });

  const allCases = useQuery(api.cases.list, { limit: 20 });
  const allArticles = useQuery(api.articles.list, { limit: 20 });

  const displayCases = searchTerm || selectedYear || selectedCourt ? cases : allCases;
  const displayArticles = searchTerm ? articles : allArticles;

  function sortCases(list: any[] | undefined) {
    if (!list) return [];
  
    if (sortBy === "newest")
      return [...list].sort((a, b) => b.publishedAt - a.publishedAt);
  
    if (sortBy === "oldest")
      return [...list].sort((a, b) => a.publishedAt - b.publishedAt);
  
    if (sortBy === "az")
      return [...list].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
  
    return list;
  }
  

  return (
    <div className="homepage">

      {/* HERO */}
      <div className="hero-section">
        <h1 className="hero-title">
          <span className="title-officina">Officina</span>{" "}
          <span className="title-thoughts">of Thoughts</span>
        </h1>
        <p className="hero-description">
          A curated collection of legal cases summaries, commentary, and thoughts.
          Explore jurisprudence through fun detailed analysis.
        </p>
      </div>

      {/* SEARCH + FILTER ROW */}
      <div className="search-section">

        <div className="search-row">
        <button
  className="filter-button"
  onClick={() => setShowFilters(!showFilters)}
>
  <img src="/7.png" alt="Filters" className="filter-icon" />
</button>


          <div className="search-input-container">
            <img src="/8.png" className="search-icon" />
            <input
              type="text"
              placeholder="Search cases and articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* FILTERS PANEL */}
        {showFilters && (
          <>
          
          {activeTab === "cases" && (
  <SearchFilters
    selectedYear={selectedYear}
    selectedCourt={selectedCourt}
    onYearChange={setSelectedYear}
    onCourtChange={setSelectedCourt}
  />
)}


            <div className="sort-container">
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">Alphabetical A–Z</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <nav className="tabs-nav">
          <button
            onClick={() => setActiveTab("cases")}
            className={`tab-button ${activeTab === "cases" ? "tab-active" : ""}`}
          >
            Legal Cases
          </button>
          <button
            onClick={() => setActiveTab("articles")}
            className={`tab-button ${activeTab === "articles" ? "tab-active" : ""}`}
          >
            Thoughts
          </button>
        </nav>
      </div>

      {/* GRID */}
      <div className="casecard-grid">
        {activeTab === "cases" &&
          (displayCases ? (
            displayCases.length === 0 ? (
              <div className="empty-state">No cases found.</div>
            ) : (
              sortCases(displayCases).map((c) => (
                <CaseCard key={c._id} case={c} onClick={() => onNavigateToCase(c._id)} />
              ))
            )
          ) : (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ))}

        {activeTab === "articles" &&
          (displayArticles ? (
            displayArticles.length === 0 ? (
              <div className="empty-state">No articles found.</div>
            ) : (
              displayArticles.map((a) => (
                <ArticleCard key={a._id} article={a} onClick={() => onNavigateToArticle(a._id)} />
              ))
            )
          ) : (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ))}
      </div>
    </div>
  );
}
