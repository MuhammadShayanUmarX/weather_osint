import {
  CalendarDays,
  Clock,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Layers3,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { DataSourceStatus } from '@/components/data/DataSourceStatus';
import { EmptyState } from '@/components/ui/EmptyState';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useRegionDemo } from '@/hooks/useRegionDemo';
import { cn } from '@/lib/cn';
import { buttonClasses, inputClasses, selectClasses } from '@/lib/ui';
import type { DemoReport, StatusTone } from '@/types';

const filters = ['All', 'Ready', 'Draft', 'Scheduled'] as const;
type ReportFilter = (typeof filters)[number];

const statusTone: Record<DemoReport['status'], StatusTone> = {
  Ready: 'nominal',
  Draft: 'watch',
  Scheduled: 'info',
};

const formatIcons = {
  PDF: FileText,
  GeoJSON: FileJson,
  CSV: FileSpreadsheet,
};

const reportTypes = [
  'Weekly brief',
  'Flood analysis',
  'Air quality',
  'Land change',
  'Drought',
  'Fire',
];

export function Reports() {
  const { region, demo } = useRegionDemo();
  const [reports, setReports] = useState<DemoReport[]>(demo.reports);
  const [filter, setFilter] = useState<ReportFilter>('All');
  const [query, setQuery] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState(reportTypes[0] as string);
  const [format, setFormat] = useState<DemoReport['format']>('PDF');

  useEffect(() => {
    setReports(demo.reports);
  }, [demo.reports]);

  const visibleReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return reports
      .filter((report) => filter === 'All' || report.status === filter)
      .filter((report) =>
        normalizedQuery.length === 0
          ? true
          : `${report.title} ${report.type} ${report.region}`
              .toLowerCase()
              .includes(normalizedQuery),
      );
  }, [filter, query, reports]);

  const readyCount = reports.filter((report) => report.status === 'Ready').length;
  const draftCount = reports.filter((report) => report.status === 'Draft').length;
  const scheduledCount = reports.filter(
    (report) => report.status === 'Scheduled',
  ).length;
  const totalPages = reports.reduce((total, report) => total + report.pages, 0);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextReport: DemoReport = {
      id: `RPT-LOCAL-${Date.now()}`,
      title:
        title.trim() ||
        `${region.name} ${reportType.toLowerCase()} — demonstration draft`,
      type: reportType,
      region: region.name,
      createdAt: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      status: 'Draft',
      format,
      pages: 0,
    };

    setReports((current) => [nextReport, ...current]);
    setTitle('');
    setFilter('Draft');
    setComposerOpen(false);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Reporting workspace"
        title="Reports"
        description={`Assemble and review demonstration environmental briefs for ${region.name}. Report records and drafts are local to this browser session; no document generation service is connected.`}
        meta="Exports are intentionally disabled in this frontend milestone."
        actions={
          <button
            type="button"
            onClick={() => setComposerOpen((current) => !current)}
            className={buttonClasses(composerOpen ? 'secondary' : 'primary')}
          >
            {composerOpen ? (
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {composerOpen ? 'Close composer' : 'New report'}
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Ready reports"
          value={readyCount}
          icon={FileText}
          tone="nominal"
          hint="Demonstration records"
        />
        <MetricCard
          label="Drafts"
          value={draftCount}
          icon={Clock}
          tone="watch"
          hint="Session-local drafts"
        />
        <MetricCard
          label="Scheduled"
          value={scheduledCount}
          icon={CalendarDays}
          tone="info"
          hint="No delivery job is active"
        />
        <MetricCard
          label="Total pages"
          value={totalPages}
          icon={Layers3}
          tone="info"
          hint="Across visible records"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <GlassPanel className="flex flex-col xl:col-span-2">
          <div className="panel-header flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="panel-title">Report library</p>
              <p className="panel-subtitle">
                Demonstration briefs and session-local drafts
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-content-faint"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search reports"
                  aria-label="Search reports"
                  className={inputClasses('h-8 pl-8 text-xs')}
                />
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-line bg-black/15 p-1">
                {filters.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    className={cn(
                      'rounded-md px-2 py-1 text-[10px] font-medium transition-colors',
                      filter === option
                        ? 'bg-accent-cyan/12 text-accent-cyan'
                        : 'text-content-muted hover:text-content',
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1">
            {visibleReports.length > 0 ? (
              <ul className="divide-y divide-line/50">
                {visibleReports.map((report) => {
                  const FormatIcon = formatIcons[report.format];
                  return (
                    <li
                      key={report.id}
                      className="flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white/[0.03] text-content-muted">
                        <FormatIcon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-medium text-content-secondary">
                            {report.title}
                          </p>
                          <StatusBadge
                            tone={statusTone[report.status]}
                            dot={false}
                          >
                            {report.status}
                          </StatusBadge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-content-faint">
                          <span className="font-mono">{report.id}</span>
                          <span>·</span>
                          <span>{report.type}</span>
                          <span>·</span>
                          <span>{report.createdAt}</span>
                          <span>·</span>
                          <span>{report.pages} pages</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="chip">{report.format}</span>
                        <button
                          type="button"
                          disabled
                          title="Demo export unavailable"
                          aria-label={`Export ${report.title}`}
                          className={buttonClasses(
                            'secondary',
                            'sm',
                            'h-8 w-8 px-0',
                          )}
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={FileText}
                title="No matching reports"
                description="Adjust the status filter or search query to view demonstration report records."
              />
            )}
          </div>

          <div className="border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
            Report records are simulated. Drafts created here remain in the
            current browser session only.
          </div>
        </GlassPanel>

        <div className="space-y-5">
          {composerOpen ? (
            <GlassPanel className="flex flex-col">
              <div className="panel-header">
                <div>
                  <p className="panel-title">New report draft</p>
                  <p className="panel-subtitle">
                    Create a session-local demonstration record
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className={buttonClasses('ghost', 'sm', 'h-7 w-7 px-0')}
                  aria-label="Close report composer"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-3 p-5">
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-content-faint">
                    Report title
                  </span>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder={`${region.name} environmental brief`}
                    className={inputClasses('text-xs')}
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-content-faint">
                    Report type
                  </span>
                  <select
                    value={reportType}
                    onChange={(event) => setReportType(event.target.value)}
                    className={selectClasses('text-xs')}
                  >
                    {reportTypes.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.12em] text-content-faint">
                    Output format
                  </span>
                  <select
                    value={format}
                    onChange={(event) =>
                      setFormat(event.target.value as DemoReport['format'])
                    }
                    className={selectClasses('text-xs')}
                  >
                    <option value="PDF">PDF</option>
                    <option value="GeoJSON">GeoJSON</option>
                    <option value="CSV">CSV</option>
                  </select>
                </label>
                <div className="rounded-lg border border-signal-amber/20 bg-signal-amber/[0.05] p-2.5 text-[10px] leading-relaxed text-signal-amber">
                  This creates a draft record only. No document, map export, or
                  file is generated.
                </div>
                <button
                  type="submit"
                  className={buttonClasses('primary', 'md', 'w-full')}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Create draft
                </button>
              </form>
            </GlassPanel>
          ) : (
            <GlassPanel className="flex flex-col">
              <div className="panel-header">
                <div>
                  <p className="panel-title">Report pipeline</p>
                  <p className="panel-subtitle">Frontend milestone stages</p>
                </div>
                <span className="chip shrink-0">Demo</span>
              </div>
              <ul className="divide-y divide-line/50">
                {[
                  {
                    label: 'Collect demonstration signals',
                    detail:
                      'Assemble simulated weather, hydrology, air, and land indicators.',
                    status: 'Complete',
                    tone: 'nominal' as StatusTone,
                  },
                  {
                    label: 'Compose narrative',
                    detail:
                      'Generate a brief from the active region and indicator context.',
                    status: 'Ready',
                    tone: 'info' as StatusTone,
                  },
                  {
                    label: 'Review and export',
                    detail:
                      'Human review and document generation are not implemented.',
                    status: 'Planned',
                    tone: 'watch' as StatusTone,
                  },
                ].map((step, index) => (
                  <li key={step.label} className="flex gap-3 px-4 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line bg-white/[0.03] font-mono text-[10px] text-content-muted">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-medium text-content-secondary">
                          {step.label}
                        </p>
                        <StatusBadge tone={step.tone} dot={false}>
                          {step.status}
                        </StatusBadge>
                      </div>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-content-faint">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-line/60 px-4 py-2.5 text-[10px] text-content-faint">
                No scheduled delivery job or report backend is connected.
              </div>
            </GlassPanel>
          )}

          <DataSourceStatus
            sources={demo.sources}
            compact
            limit={5}
            title="Report inputs"
            subtitle="Feeds referenced by demonstration briefs"
          />
        </div>
      </div>
    </div>
  );
}
