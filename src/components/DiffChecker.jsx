import { useEffect, useState } from 'react';
import BuyMeACoffee from './BuyMeACoffee';
import CollabCta from './CollabCta';
import ContactModal from './ContactModal';
import Footer from './Footer';
import Header from './Header';
import HowItWorks from './HowItWorks';
import LineDiffView from './LineDiffView';
import TextPanel from './TextPanel';
import Toolbar from './Toolbar';
import WordDiffView from './WordDiffView';
import { useDiffChecker } from '../hooks/useDiffChecker';

export default function DiffChecker() {
  const [showContact, setShowContact] = useState(false);
  const diff = useDiffChecker();

  useEffect(() => {
    document.title = 'CodeDiff — Free Online Text & Code Diff Checker';
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-6 py-5 space-y-4">
        <Toolbar
          granularity={diff.granularity}
          onGranularityChange={diff.setGranularity}
          hasDiff={diff.hasDiff}
          onClearAll={diff.clearAll}
        />

        {diff.hasDiff && diff.granularity === 'lines' && (
          <LineDiffView
            diffModel={diff.diffModel}
            hunks={diff.hunks}
            stats={diff.stats}
            currentHunk={diff.currentHunk}
            onGoToHunk={diff.goToHunk}
            markers={diff.markers}
            diffScrollRef={diff.diffScrollRef}
            hunkRefs={diff.hunkRefs}
            copiedKey={diff.copiedKey}
            onCopy={diff.copyText}
            onAccept={diff.acceptHunk}
            onRevert={diff.revertHunk}
            originalText={diff.originalText}
            changedText={diff.changedText}
          />
        )}

        {diff.hasDiff && diff.granularity === 'words' && (
          <WordDiffView wordsDiff={diff.wordsDiff} stats={diff.stats} />
        )}

        {diff.fileError && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {diff.fileError}
          </div>
        )}

        <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-700">
            <TextPanel
              label="Original text"
              value={diff.originalText}
              onChange={diff.setOriginalText}
              onOpenFile={(e) => diff.handleOpenFile(e, diff.setOriginalText)}
              onClear={diff.resetOriginal}
              fileInputRef={diff.originalFileRef}
              placeholder="Paste the original text or code here… or use Open file above"
            />
            <TextPanel
              label="Changed text"
              value={diff.changedText}
              onChange={diff.setChangedText}
              onOpenFile={(e) => diff.handleOpenFile(e, diff.setChangedText)}
              onClear={diff.resetChanged}
              fileInputRef={diff.changedFileRef}
              placeholder="Paste the changed text or code here… or use Open file above"
            />
          </div>
        </div>

        <HowItWorks />
        <CollabCta onContactClick={() => setShowContact(true)} />
        <BuyMeACoffee />
      </main>

      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />

      <Footer />
    </div>
  );
}
