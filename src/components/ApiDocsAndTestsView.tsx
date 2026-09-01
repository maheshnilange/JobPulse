import React, { useState } from 'react';
import { 
  FileCode2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Code2, 
  Terminal, 
  Copy, 
  Check,
  Server,
  Layers,
  Sparkles
} from 'lucide-react';
import { TestSuiteSummary } from '../types';
import { api } from '../lib/api';

export const ApiDocsAndTestsView: React.FC = () => {
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'tests' | 'openapi' | 'spring_ref'>('tests');
  const [copied, setCopied] = useState(false);

  const handleRunTests = async () => {
    setRunning(true);
    try {
      const res = await api.runTests();
      setTestSummary(res);
    } catch (e) {
      console.error('Failed to run tests:', e);
    } finally {
      setRunning(false);
    }
  };

  const openApiSpec = {
    "openapi": "3.0.3",
    "info": {
      "title": "JobPulse Real-Time Fresher & Software Job Monitoring API",
      "version": "1.0.0",
      "description": "Production API for fresher job aggregation, walk-in interview tracking, deduplication engine, and user alerts."
    },
    "endpoints": [
      { "method": "GET", "path": "/api/jobs", "desc": "Filter jobs by role, company, city, experience, graduation year, and freshness window" },
      { "method": "GET", "path": "/api/jobs/latest", "desc": "Fetch prioritized newly detected openings" },
      { "method": "GET", "path": "/api/jobs/:id", "desc": "Full job details, qualification breakdown, and deduplication timeline" },
      { "method": "POST", "path": "/api/jobs/ai-analyze", "desc": "Gemini AI role summary & fresher interview preparation tips" },
      { "method": "GET", "path": "/api/walkins", "desc": "List walk-in drives filtered by TODAY, TOMORROW, UPCOMING, EXPIRED" },
      { "method": "GET", "path": "/api/walkins/:id", "desc": "Walk-in drive details, venue address, and mandatory documents" },
      { "method": "GET", "path": "/api/companies", "desc": "List 20+ monitored employers with active opening counts" },
      { "method": "GET", "path": "/api/alerts", "desc": "User alert subscription management" },
      { "method": "GET", "path": "/api/admin/sources", "desc": "Source adapter diagnostics and crawler health status" },
      { "method": "POST", "path": "/api/admin/sources/crawl-all", "desc": "Trigger live ingestion crawler across all sources" },
      { "method": "GET", "path": "/api/tests/run", "desc": "Execute automated Unit & Integration test suites" }
    ]
  };

  const springBootRefCode = `package com.jobpulse.service;

import com.jobpulse.domain.Job;
import com.jobpulse.domain.JobSource;
import com.jobpulse.repository.JobRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;

@Service
public class JobIngestionScheduler {

    private final JobRepository jobRepository;
    private final DeduplicationService deduplicationService;
    private final FresherIntelligenceService intelligenceService;
    private final NotificationDispatcher notificationDispatcher;

    public JobIngestionScheduler(JobRepository jobRepository,
                                 DeduplicationService deduplicationService,
                                 FresherIntelligenceService intelligenceService,
                                 NotificationDispatcher notificationDispatcher) {
        this.jobRepository = jobRepository;
        this.deduplicationService = deduplicationService;
        this.intelligenceService = intelligenceService;
        this.notificationDispatcher = notificationDispatcher;
    }

    /**
     * Polls active IT career portals every 5 minutes in real-time
     */
    @Scheduled(fixedRateString = "\${jobpulse.crawler.rate-ms:300000}")
    @Transactional
    public void executeScheduledCrawl() {
        List<RawJobPayload> incomingBatch = crawlAllPermittedSources();

        for (RawJobPayload raw : incomingBatch) {
            // 1. Fuzzy Deduplication Check
            var dupCheck = deduplicationService.findDuplicate(raw);
            if (dupCheck.isDuplicate()) {
                deduplicationService.mergeSourceRecord(dupCheck.getExistingJob(), raw);
                continue;
            }

            // 2. Classify Fresher & Java Stack
            boolean isFresher = intelligenceService.isFresher(raw.getTitle(), raw.getExperience());
            boolean isJava = intelligenceService.isJavaStack(raw.getTitle(), raw.getSkills());

            Job newJob = Job.builder()
                .externalId(raw.getExternalId())
                .companyName(raw.getCompanyName())
                .title(raw.getTitle())
                .isFresher(isFresher)
                .isJava(isJava)
                .firstDetectedAt(Instant.now())
                .status("ACTIVE")
                .build();

            jobRepository.save(newJob);

            // 3. Dispatch User Alerts
            notificationDispatcher.dispatchMatchingAlerts(newJob);
        }
    }
}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
            <Terminal className="w-3.5 h-3.5" />
            <span>DEVELOPER &amp; ARCHITECTURE SUITE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            API Specification &amp; In-App Test Runner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Execute automated Unit and Integration tests live to verify deduplication, freshness scoring, and fresher detection algorithms.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleRunTests}
            disabled={running}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Executing Tests...' : 'Run Automated Test Suite'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'tests' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Automated Test Runner
        </button>
        <button
          onClick={() => setActiveTab('openapi')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'openapi' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          REST API Specification
        </button>
        <button
          onClick={() => setActiveTab('spring_ref')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'spring_ref' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          Java 21 / Spring Boot 3 Reference Code
        </button>
      </div>

      {/* TAB 1: TEST RUNNER */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          {testSummary ? (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-semibold">Total Tests Run</div>
                  <div className="text-2xl font-bold text-white mt-1">{testSummary.total}</div>
                </div>
                <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4">
                  <div className="text-xs text-emerald-400 font-semibold">Passed</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{testSummary.passed}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-semibold">Failed</div>
                  <div className="text-2xl font-bold text-white mt-1">{testSummary.failed}</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs text-slate-400 font-semibold">Execution Time</div>
                  <div className="text-2xl font-bold text-indigo-300 mt-1">{testSummary.durationMs} ms</div>
                </div>
              </div>

              {/* Test Results Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Result</th>
                      <th className="py-3 px-4">Suite / Type</th>
                      <th className="py-3 px-4">Test Case Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Assertion Message</th>
                      <th className="py-3 px-4 text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {testSummary.results.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          {r.passed ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>PASSED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              <XCircle className="w-3 h-3 text-rose-400" />
                              <span>FAILED</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-300">{r.suite}</td>
                        <td className="py-3 px-4 font-bold text-white">{r.name}</td>
                        <td className="py-3 px-4 text-slate-400">{r.category}</td>
                        <td className="py-3 px-4 text-slate-300">{r.message}</td>
                        <td className="py-3 px-4 text-right text-slate-400 font-mono">{r.durationMs}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
              <Terminal className="w-10 h-10 text-indigo-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Automated Test Runner Ready</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "Run Automated Test Suite" to execute all Unit tests for Deduplication, Fresher Classification, Java heuristics, Freshness boundaries, and Walk-In status automation.
              </p>
              <button
                onClick={handleRunTests}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
              >
                Run Tests Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OPENAPI SPEC */}
      {activeTab === 'openapi' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">REST API Endpoints Specification</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">OpenAPI 3.0.3</span>
            </div>

            <div className="space-y-2">
              {openApiSpec.endpoints.map((ep, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded font-bold font-mono text-[10px] ${
                      ep.method === 'GET' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-slate-200 font-semibold">{ep.path}</span>
                  </div>
                  <span className="text-slate-400">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SPRING BOOT 3 REFERENCE */}
      {activeTab === 'spring_ref' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Spring Boot 3 / Java 21 Ingestion Service Architecture</h3>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(springBootRefCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold flex items-center space-x-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Java Source'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Reference architecture showing Spring Scheduled crawling, Deduplication service bean injection, and transactional event handling.
            </p>

            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
              <code>{springBootRefCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
