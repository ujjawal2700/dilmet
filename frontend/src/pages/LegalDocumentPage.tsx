import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { MaterialSymbol } from "../shared/components/MaterialSymbol";
import { MeshBackground } from "../shared/components/auth/AuthLayoutComponents";
import { legalDocuments } from "../core/content/legalDocuments";

export const LegalDocumentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();

  const isFemale = location.pathname.startsWith("/female");
  const accentColor = isFemale ? "text-pink-500" : "text-primary";
  const bgAccent = isFemale ? "bg-pink-500/10" : "bg-primary/10";

  const doc = slug ? legalDocuments[slug] : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const handleBackClick = () => navigate(-1);

  return (
    <div className="text-slate-900 dark:text-white font-display antialiased min-h-screen relative overflow-x-hidden bg-background-light dark:bg-[#0a0a0a]">
      <MeshBackground />
      {isFemale && (
        <div className="absolute inset-0 bg-pink-500/5 blur-[80px] rounded-full opacity-30 pointer-events-none z-0" />
      )}

      <div className="relative z-10 max-w-md mx-auto w-full flex flex-col pb-24">
        <header className="h-16 flex items-center justify-between px-4 sticky top-0 bg-background-light/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md z-30 border-b border-gray-100 dark:border-white/5">
          <button
            onClick={handleBackClick}
            className="skeuo-button size-10 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400"
            aria-label="Go back"
          >
            <MaterialSymbol name="arrow_back" size={20} />
          </button>

          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white truncate max-w-[220px]">
            {doc?.title || "Not Found"}
          </h1>

          <div className="w-10" />
        </header>

        <main className="p-4 space-y-6">
          {!doc ? (
            <div className="skeuo-card rounded-[2rem] bg-mesh-glass border-white/60 dark:border-white/5 p-8 text-center shadow-xl space-y-4">
              <div className={`skeuo-inset size-16 rounded-full flex items-center justify-center bg-transparent dark:bg-black/25 mx-auto ${accentColor}`}>
                <MaterialSymbol name="description" size={32} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
                Document not found
              </p>
            </div>
          ) : (
            <>
              {/* Title Card */}
              <div className="skeuo-card rounded-[2rem] bg-mesh-glass border-white/60 dark:border-white/5 p-6 shadow-xl">
                <div className={`skeuo-inset size-14 rounded-2xl flex items-center justify-center mb-4 ${bgAccent} ${accentColor}`}>
                  <MaterialSymbol name={doc.icon} size={28} filled />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
                  {doc.title}
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Last updated: {doc.lastUpdated}
                </p>
                {doc.intro && (
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                    {doc.intro}
                  </p>
                )}
              </div>

              {/* Sections */}
              <div className="space-y-3">
                {doc.sections.map((section, idx) => (
                  <div
                    key={idx}
                    className="skeuo-card rounded-2xl bg-mesh-glass border-white/60 dark:border-white/5 p-5 shadow-lg"
                  >
                    <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-3">
                      {section.heading}
                    </h3>
                    {section.paragraphs?.map((p, pIdx) => (
                      <p
                        key={pIdx}
                        className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-2 last:mb-0"
                      >
                        {p}
                      </p>
                    ))}
                    {section.bullets && (
                      <ul className="space-y-2 mt-2">
                        {section.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-2.5">
                            <span className={`mt-1.5 size-1.5 rounded-full shrink-0 ${accentColor.replace('text-', 'bg-')}`} />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                              {b}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-600 text-center leading-relaxed px-4">
                This document is provided for informational purposes as part of the Dil Mate platform and does not constitute legal advice.
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default LegalDocumentPage;
