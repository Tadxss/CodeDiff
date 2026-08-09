export default function HowItWorks() {
  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-2xl">
      <h3 className="text-base font-semibold text-blue-400 mb-3">How it works</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
        <div>
          <h4 className="font-semibold text-slate-200 mb-1.5">Comparing text</h4>
          <ul className="space-y-1 text-slate-400">
            <li>• Paste your original text on the left</li>
            <li>• Paste the changed text on the right</li>
            <li>• The diff updates instantly as you type</li>
            <li>• Switch between line-level and word-level diffing</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-slate-200 mb-1.5">Reading the result</h4>
          <ul className="space-y-1 text-slate-400">
            <li>• Step through changes with the Change navigator</li>
            <li>• Copy just a removed or added block</li>
            <li>• Merge a change to accept or revert it instantly</li>
            <li>• Comparison runs 100% in your browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
