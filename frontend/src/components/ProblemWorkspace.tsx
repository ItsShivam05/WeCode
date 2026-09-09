import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Language,
  ProblemDetailDto,
  RunCodeResultDto,
  SubmissionDetailDto,
  Verdict,
} from '@wecode/shared';
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock,
  Cpu,
  Play,
  Send,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';

interface ProblemWorkspaceProps {
  problem: ProblemDetailDto;
  onBack: () => void;
}

const DEFAULT_CPP_BOILERPLATE = `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Read input and implement solution
    int a, b;
    if (cin >> a >> b) {
        cout << (a + b) << "\\n";
    }

    return 0;
}
`;

export const ProblemWorkspace: React.FC<ProblemWorkspaceProps> = ({ problem, onBack }) => {
  const [code, setCode] = useState<string>(DEFAULT_CPP_BOILERPLATE);
  const [language, setLanguage] = useState<Language>(Language.CPP);
  const [customInput, setCustomInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<RunCodeResultDto | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionDetailDto | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'run' | 'submit'>('run');

  // AI Hint state
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveResultTab('run');
    setRunResult(null);
    try {
      const res = await api.runCode(
        problem.slug,
        language,
        code,
        showCustomInput ? customInput : undefined
      );
      setRunResult(res);
    } catch (err: any) {
      setRunResult({
        verdict: Verdict.SYSTEM_ERROR,
        executionTimeMs: 0,
        memoryKb: 0,
        stdout: '',
        stderr: err.message || 'Run failed',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setActiveResultTab('submit');
    setSubmissionResult(null);
    try {
      const res = await api.submitCode(problem.slug, language, code);
      // Poll for submission result
      const pollInterval = setInterval(async () => {
        try {
          const detail = await api.getSubmission(res.submissionId);
          if (detail.status === 'COMPLETED') {
            setSubmissionResult(detail);
            clearInterval(pollInterval);
            setIsSubmitting(false);
          }
        } catch {
          clearInterval(pollInterval);
          setIsSubmitting(false);
        }
      }, 1000);

      // Timeout polling after 20 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
        setIsSubmitting(false);
      }, 20000);
    } catch (err: any) {
      setIsSubmitting(false);
      alert(err.message || 'Submission failed');
    }
  };

  const handleAskAi = async () => {
    setAiModalOpen(true);
    setIsAiLoading(true);
    setAiHint(null);
    try {
      const hintRes = await api.getAiHint({
        problemId: problem.id,
        code,
        language,
        lastVerdict: submissionResult?.verdict || runResult?.verdict,
        errorOutput: runResult?.stderr || runResult?.compileOutput || undefined,
        hintLevel: 'CONCEPTUAL',
      });
      setAiHint(hintRes.hint);
    } catch (err: any) {
      setAiHint('AI tutor service is currently initializing. Please try again shortly.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const getVerdictBadge = (v: Verdict) => {
    switch (v) {
      case Verdict.ACCEPTED:
        return (
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> ACCEPTED
          </span>
        );
      case Verdict.WRONG_ANSWER:
        return (
          <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/20 text-xs font-bold">
            <XCircle className="w-3.5 h-3.5" /> WRONG ANSWER
          </span>
        );
      case Verdict.TIME_LIMIT_EXCEEDED:
        return (
          <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" /> TIME LIMIT EXCEEDED
          </span>
        );
      case Verdict.COMPILATION_ERROR:
        return (
          <span className="flex items-center gap-1 text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded border border-orange-500/20 text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" /> COMPILATION ERROR
          </span>
        );
      default:
        return (
          <span className="text-slate-400 bg-slate-800 px-2.5 py-1 rounded text-xs font-bold">
            {v}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Top Workspace Header */}
      <div className="h-12 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="font-semibold text-sm text-white">{problem.title}</h2>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1 focus:outline-none"
          >
            <option value={Language.CPP}>C++ (g++ 17)</option>
          </select>

          {/* AI Hint Trigger */}
          <button
            onClick={handleAskAi}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600/30 transition shadow-sm"
          >
            <Bot className="w-3.5 h-3.5" />
            AI Tutor Hint
          </button>
        </div>
      </div>

      {/* Split Pane: Problem Statement (Left) | Code Editor & Results (Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Description & Test Cases */}
        <div className="w-1/2 border-r border-slate-800 overflow-y-auto p-6 bg-slate-950">
          <div className="prose prose-invert max-w-none">
            <h1 className="text-xl font-bold text-white mb-2">{problem.title}</h1>
            <div className="flex items-center gap-4 text-xs text-slate-400 mb-6 border-b border-slate-800/80 pb-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" /> Time Limit: {problem.timeLimitMs}ms
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-slate-500" /> Memory Limit: {problem.memoryLimitMb}
                MB
              </span>
            </div>

            <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
              {problem.descriptionMarkdown}
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-white mb-3">Sample Test Cases</h3>
              {problem.sampleTestCases.map((tc, idx) => (
                <div
                  key={tc.id}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-3 mb-3 text-xs"
                >
                  <span className="font-semibold text-slate-400 block mb-1">Example {idx + 1}</span>
                  <div className="grid grid-cols-2 gap-3 mt-2 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                        Input
                      </span>
                      <pre className="bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto">
                        {tc.inputData}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                        Expected Output
                      </span>
                      <pre className="bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto">
                        {tc.expectedOutput}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Pane: Code Editor & Execution Panel */}
        <div className="w-1/2 flex flex-col bg-slate-900">
          {/* Monaco Editor Container */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              theme="vs-dark"
              language="cpp"
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Custom Input Toggle Drawer */}
          {showCustomInput && (
            <div className="border-t border-slate-800 p-3 bg-slate-950">
              <span className="text-xs font-semibold text-slate-400 block mb-1.5">
                Custom Test Input:
              </span>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter custom stdin here..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Action Bar */}
          <div className="h-12 border-t border-slate-800 bg-slate-950 px-4 flex items-center justify-between shrink-0">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showCustomInput}
                onChange={(e) => setShowCustomInput(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
              />
              Custom Input
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                {isRunning ? 'Running...' : 'Run Code'}
              </button>

              <button
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition disabled:opacity-50 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Evaluating...' : 'Submit'}
              </button>
            </div>
          </div>

          {/* Result Output Panel */}
          {(runResult || submissionResult || isRunning || isSubmitting) && (
            <div className="h-44 border-t border-slate-800 bg-slate-950 p-3 overflow-y-auto shrink-0 text-xs">
              <div className="flex items-center gap-4 mb-2 border-b border-slate-800/80 pb-2">
                <span className="font-semibold text-slate-300">
                  {activeResultTab === 'run' ? 'Run Result' : 'Submission Verdict'}
                </span>
                {activeResultTab === 'run' && runResult && getVerdictBadge(runResult.verdict)}
                {activeResultTab === 'submit' &&
                  submissionResult &&
                  getVerdictBadge(submissionResult.verdict)}
                {(isRunning || isSubmitting) && (
                  <span className="text-xs text-blue-400 animate-pulse font-medium">
                    {isRunning ? 'Executing test in sandbox...' : 'Judging hidden test cases...'}
                  </span>
                )}
              </div>

              {activeResultTab === 'run' && runResult && (
                <div>
                  {runResult.compileOutput && (
                    <div className="mb-2">
                      <span className="text-[10px] text-rose-400 uppercase font-semibold">
                        Compilation Output:
                      </span>
                      <pre className="font-mono text-rose-300 bg-rose-950/30 p-2 rounded mt-1 overflow-x-auto">
                        {runResult.compileOutput}
                      </pre>
                    </div>
                  )}
                  {runResult.stdout && (
                    <div className="mb-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Standard Output:
                      </span>
                      <pre className="font-mono text-slate-200 bg-slate-900 p-2 rounded mt-1 overflow-x-auto">
                        {runResult.stdout}
                      </pre>
                    </div>
                  )}
                  {runResult.stderr && (
                    <div>
                      <span className="text-[10px] text-amber-400 uppercase font-semibold">
                        Standard Error:
                      </span>
                      <pre className="font-mono text-amber-300 bg-amber-950/30 p-2 rounded mt-1 overflow-x-auto">
                        {runResult.stderr}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {activeResultTab === 'submit' && submissionResult && (
                <div>
                  <div className="flex items-center gap-4 text-slate-400 mb-2 font-mono text-[11px]">
                    <span>Time: {submissionResult.executionTimeMs ?? 0}ms</span>
                    <span>Memory: {submissionResult.memoryKb ?? 0}KB</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5 mt-2">
                    {submissionResult.results.map((r, i) => (
                      <div
                        key={r.id}
                        className={`p-1.5 rounded text-center border text-[10px] font-semibold font-mono ${
                          r.verdict === Verdict.ACCEPTED
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        }`}
                      >
                        Test {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Tutor Socratic Hint Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">AI Tutor Guidance</h3>
                <span className="text-xs text-purple-400">Socratic Conceptual Mentor</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-4 text-sm text-slate-300 leading-relaxed mb-6">
              {isAiLoading ? (
                <div className="text-slate-400 animate-pulse text-xs">
                  Analyzing algorithmic approach and formulating guidance...
                </div>
              ) : (
                aiHint
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Close Hint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
