export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-10">
        <div className="text-8xl font-black text-slate-200 mb-4">403</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
        <p className="text-slate-500 mb-6">You don't have permission to access this page.</p>
        <a href="/dashboard" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">Go to Dashboard</a>
      </div>
    </div>
  );
}