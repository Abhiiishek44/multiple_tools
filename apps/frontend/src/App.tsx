import "./App.css";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <section className="mx-auto max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
          Multiple Tools
        </p>
        <h1 className="text-3xl font-semibold">Document and image conversions</h1>
        <p className="mt-3 text-slate-400">
          The conversion API is available for document and image processing.
        </p>
        <a
          className="mt-8 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500"
          href={`${apiBaseUrl}/docs`}
        >
          Open API documentation
        </a>
      </section>
    </main>
  );
}

export default App;
