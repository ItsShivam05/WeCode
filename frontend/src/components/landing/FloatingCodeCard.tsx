export const FloatingCodeCard = () => {
  return (
    <div className="floating-card mt-8 w-full max-w-xs rounded-3xl border border-slate-200/80 bg-white/85 p-4 shadow-[0_20px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-pink-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </div>
      <pre className="overflow-hidden text-left text-[10px] leading-5 text-slate-700">
        <code>{`#include <bits/stdc++.h>
using namespace std;

int main() {
    cout << "Keep Going!";
}`}</code>
      </pre>
    </div>
  );
};
