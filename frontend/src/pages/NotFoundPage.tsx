import { Link, useNavigate } from 'react-router-dom';
import { MaterialSymbol } from '../shared/components/MaterialSymbol';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50 px-4 py-16 dark:from-[#130d12] dark:via-[#100e12] dark:to-[#17110d]">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-12 size-72 rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-700/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-700/10" />
      <section className="relative w-full max-w-xl rounded-[2rem] border border-white/70 bg-white/75 p-8 text-center shadow-2xl shadow-rose-900/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-12">
        <div className="mx-auto mb-7 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25">
          <MaterialSymbol name="travel_explore" size={42} />
        </div>
        <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-pink-600 dark:text-pink-400">Dil Mate</p>
        <h1 className="text-7xl font-black tracking-tight text-slate-900 dark:text-white sm:text-8xl">404</h1>
        <h2 className="mt-3 text-2xl font-bold text-slate-800 dark:text-slate-100">This page took a wrong turn</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-slate-600 dark:text-slate-400">
          We couldn’t find the page you’re looking for. It may have moved, or the link may be out of date.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/select-language')}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <MaterialSymbol name="arrow_back" className="mr-2" />
            Go back
          </button>
          <Link
            to="/select-language"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-3 font-bold text-white shadow-lg shadow-pink-600/20 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <MaterialSymbol name="home" className="mr-2" />
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
};
