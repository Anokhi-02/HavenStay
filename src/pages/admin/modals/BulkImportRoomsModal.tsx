import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  RefreshCw,
  Building2,
  Bed,
  IndianRupee,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { PG, RoomOption } from '../../../types';
import {
  validateAndParseRoomCsv,
  downloadSampleCsv,
  CsvParseResult,
} from '../../../lib/roomCsvParser';

interface BulkImportRoomsModalProps {
  isOpen: boolean;
  pgs: PG[];
  selectedPG: PG | null;
  onClose: () => void;
  onSubmit: (pgId: string, roomOptions: RoomOption[], mode: 'replace' | 'append') => Promise<void>;
}

export const BulkImportRoomsModal: React.FC<BulkImportRoomsModalProps> = ({
  isOpen,
  pgs,
  selectedPG,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [targetPGId, setTargetPGId] = useState<string>(selectedPG?.id || pgs[0]?.id || '');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [csvResult, setCsvResult] = useState<CsvParseResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowPartialImport, setAllowPartialImport] = useState(true);
  const [showErrorDetailsOnly, setShowErrorDetailsOnly] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePG = pgs.find((p) => p.id === targetPGId) || selectedPG || pgs[0];

  const handleFileChange = (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      alert('Please upload a standard .csv file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const result = validateAndParseRoomCsv(text, file.name);
        setCsvResult(result);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setCsvResult(null);
    setShowErrorDetailsOnly(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const rowsToImport = csvResult
    ? allowPartialImport
      ? csvResult.validRows
      : csvResult.errors.length === 0
      ? csvResult.validRows
      : []
    : [];

  const handleImport = async () => {
    if (!csvResult || rowsToImport.length === 0) {
      alert('No valid room configurations available to import.');
      return;
    }

    if (!activePG) {
      alert('Please select a target PG wing.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(activePG.id, rowsToImport, importMode);
      onClose();
    } catch (err) {
      console.error('Failed to bulk import rooms:', err);
      alert('Failed to import room data. Please check logs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate impact on total beds
  const existingOptions = activePG?.roomOptions || [];
  const finalPreviewOptions =
    importMode === 'replace'
      ? rowsToImport
      : [
          ...existingOptions.filter((ex) => !rowsToImport.some((imp) => imp.name.toLowerCase() === ex.name.toLowerCase())),
          ...rowsToImport,
        ];

  const prospectiveTotalBeds = finalPreviewOptions.reduce((acc, r) => acc + (Number(r.totalBeds) || 0), 0);
  const prospectiveAvailableBeds = finalPreviewOptions.reduce((acc, r) => acc + (Number(r.availableBeds) || 0), 0);
  const prospectiveStartingPrice = finalPreviewOptions.length > 0
    ? Math.min(...finalPreviewOptions.map((r) => r.price))
    : activePG?.startingPrice || 0;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-xl my-auto overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Bulk Import Room Details & Pricing
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  CSV UPLOADER
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Upload a structured spreadsheet to batch configure sharing tiers, rents, deposits, and bed counts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Target Property and Mode Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Target PG Selector */}
            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Target Property Wing
              </label>
              <select
                value={targetPGId}
                onChange={(e) => setTargetPGId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 text-xs"
              >
                {pgs.map((pg) => (
                  <option key={pg.id} value={pg.id}>
                    {pg.name} ({pg.location?.city || 'Bengaluru'}) - {pg.gender} PG
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Currently has {activePG?.roomOptions?.length || 0} room tier(s) configured.
              </p>
            </div>

            {/* Import Mode: Replace vs Append */}
            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Import Action Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                    importMode === 'replace'
                      ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold">Replace All</div>
                  <div className="text-[10px] font-normal opacity-80">
                    Overwrites existing room tiers
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('append')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left ${
                    importMode === 'append'
                      ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold">Append / Merge</div>
                  <div className="text-[10px] font-normal opacity-80">
                    Adds to current room tiers
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Upload Area / File Dropzone */}
          {!csvResult ? (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(file);
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Click to select or drag & drop room details CSV file
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports comma-delimited .csv files with pricing, beds, and features.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold mt-1 shadow-2xs">
                  <span>Standard format (.csv)</span>
                </div>
              </div>

              {/* CSV Format Reference & Sample Download Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Required CSV Column Schema</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Your spreadsheet must include the required columns with valid room categories:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      type *
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      name *
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      price *
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      totalBeds *
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      availableBeds *
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                      securityDeposit (opt)
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                      features (opt)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => downloadSampleCsv()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs shrink-0 transition-all cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              {/* Schema Details Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-mono tracking-wider">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Field</th>
                      <th className="py-2 px-3 font-semibold">Required</th>
                      <th className="py-2 px-3 font-semibold">Allowed Values / Example</th>
                      <th className="py-2 px-3 font-semibold">Validation Rule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="py-2 px-3 font-mono text-blue-700 font-bold">type</td>
                      <td className="py-2 px-3 text-blue-700 font-bold">Yes</td>
                      <td className="py-2 px-3 font-mono">single, double, triple, four_sharing</td>
                      <td className="py-2 px-3 text-slate-500">Must be one of the standard room sharing tiers</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-blue-700 font-bold">name</td>
                      <td className="py-2 px-3 text-blue-700 font-bold">Yes</td>
                      <td className="py-2 px-3">Executive Single Studio, Deluxe Twin</td>
                      <td className="py-2 px-3 text-slate-500">Descriptive tier name (min 2 characters)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-blue-700 font-bold">price</td>
                      <td className="py-2 px-3 text-blue-700 font-bold">Yes</td>
                      <td className="py-2 px-3 font-mono">14000, 9500</td>
                      <td className="py-2 px-3 text-slate-500">Monthly tariff in INR (number &gt; 0)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-blue-700 font-bold">totalBeds</td>
                      <td className="py-2 px-3 text-blue-700 font-bold">Yes</td>
                      <td className="py-2 px-3 font-mono">6, 16, 12</td>
                      <td className="py-2 px-3 text-slate-500">Total bed capacity for this tier (integer &gt; 0)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-blue-700 font-bold">availableBeds</td>
                      <td className="py-2 px-3 text-blue-700 font-bold">Yes</td>
                      <td className="py-2 px-3 font-mono">2, 4, 0</td>
                      <td className="py-2 px-3 text-slate-500">Vacant beds (0 to totalBeds)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-slate-500">securityDeposit</td>
                      <td className="py-2 px-3 text-slate-400">Optional</td>
                      <td className="py-2 px-3 font-mono">28000 (defaults to 2x rent)</td>
                      <td className="py-2 px-3 text-slate-500">Security deposit in INR (&gt;= 0)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-mono text-slate-500">features</td>
                      <td className="py-2 px-3 text-slate-400">Optional</td>
                      <td className="py-2 px-3">Attached Washroom; AC; High-Speed Wi-Fi</td>
                      <td className="py-2 px-3 text-slate-500">Semicolon or comma separated list of perks</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Uploaded & Validated Results View */
            <div className="space-y-5">
              {/* File Info & Quick Status Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{csvResult.fileName}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                        {csvResult.totalRows} {csvResult.totalRows === 1 ? 'row' : 'rows'} detected
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Target: <strong className="text-slate-800">{activePG?.name}</strong> • Mode:{' '}
                      <strong className="text-blue-700 uppercase">{importMode}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Upload Different File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadSampleCsv()}
                    className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                    title="Download Sample CSV Template"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Status Summary Banner */}
              {csvResult.errors.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-xs block">
                      Validation Passed: All {csvResult.validRows.length} room tier(s) are valid and ready to import!
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      All required fields (type, name, price, totalBeds, availableBeds) conform to rules.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs text-rose-800 block">
                          Validation Issues Found ({csvResult.errors.length} error{csvResult.errors.length === 1 ? '' : 's'})
                        </span>
                        <span className="text-[11px] text-rose-700">
                          {csvResult.validRows.length} of {csvResult.totalRows} room tier(s) are valid.{' '}
                          {csvResult.validRows.length > 0
                            ? 'You can import the valid rows or fix the spreadsheet.'
                            : 'Please fix the required fields before importing.'}
                        </span>
                      </div>
                    </div>

                    {csvResult.validRows.length > 0 && (
                      <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-rose-200 text-xs text-slate-700 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={allowPartialImport}
                          onChange={(e) => setAllowPartialImport(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <span>Import {csvResult.validRows.length} valid rows</span>
                      </label>
                    )}
                  </div>

                  {/* List of Error Details */}
                  <div className="bg-white rounded-xl p-3 border border-rose-200 max-h-36 overflow-y-auto space-y-1.5">
                    {csvResult.errors.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px] text-rose-700">
                        <span className="font-mono font-bold bg-rose-100 px-1.5 py-0.5 rounded text-rose-800 shrink-0">
                          Row {err.rowNumber}
                        </span>
                        <span>
                          <strong className="text-rose-900">[{err.field}]:</strong> {err.message}{' '}
                          {err.value ? <code className="text-slate-600 text-[10px]">('{err.value}')</code> : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings (if any, e.g. defaulted deposits) */}
              {csvResult.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-800 text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Notices & Default Value Assignments:</span>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-amber-700 text-[10px]">
                      {csvResult.warnings.slice(0, 3).map((w, i) => (
                        <li key={i}>
                          Row {w.rowNumber}: {w.message}
                        </li>
                      ))}
                      {csvResult.warnings.length > 3 && (
                        <li>...and {csvResult.warnings.length - 3} other default notices</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {/* Data Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">Spreadsheet Parsed Rows</span>
                    <span className="text-[10px] text-slate-500">
                      ({csvResult.validRows.length} valid / {csvResult.totalRows} total)
                    </span>
                  </div>
                  {csvResult.errors.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowErrorDetailsOnly(!showErrorDetailsOnly)}
                      className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                    >
                      {showErrorDetailsOnly ? 'Show all rows' : 'Show only rows with errors'}
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="sticky top-0 bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-mono tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Row</th>
                        <th className="py-2.5 px-3">Tier Name</th>
                        <th className="py-2.5 px-3">Sharing Type</th>
                        <th className="py-2.5 px-3">Rent / Mo</th>
                        <th className="py-2.5 px-3">Deposit</th>
                        <th className="py-2.5 px-3">Beds (Avail/Total)</th>
                        <th className="py-2.5 px-3">Features Included</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {csvResult.parsedRows
                        .filter((r) => (!showErrorDetailsOnly ? true : !r.isValid))
                        .map((row) => (
                          <tr
                            key={row.rowNumber}
                            className={`transition-colors ${
                              !row.isValid
                                ? 'bg-rose-50/70 hover:bg-rose-50'
                                : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2 px-3 whitespace-nowrap">
                              {row.isValid ? (
                                <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Valid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 font-bold text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                  <XCircle className="w-3 h-3" />
                                  Error
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-500">#{row.rowNumber}</td>
                            <td className="py-2 px-3 font-bold text-slate-900">
                              {row.data?.name || row.raw.name || row.raw.room_name || (
                                <span className="text-rose-600 italic">Missing name</span>
                              )}
                            </td>
                            <td className="py-2 px-3">
                              {row.data?.type ? (
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] uppercase font-semibold border border-slate-200">
                                  {row.data.type}
                                </span>
                              ) : (
                                <span className="text-rose-600 font-mono text-[10px]">
                                  {row.raw.type || 'Invalid type'}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold text-emerald-700">
                              {row.data ? `₹${row.data.price.toLocaleString('en-IN')}` : row.raw.price || '—'}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-600">
                              {row.data
                                ? `₹${row.data.securityDeposit.toLocaleString('en-IN')}`
                                : row.raw.securityDeposit || '—'}
                            </td>
                            <td className="py-2 px-3 font-mono">
                              {row.data ? (
                                <span className="text-slate-700">
                                  <strong className="text-blue-700">{row.data.availableBeds}</strong> /{' '}
                                  {row.data.totalBeds} beds
                                </span>
                              ) : (
                                <span className="text-rose-600">
                                  {row.raw.availableBeds || '?'}/{row.raw.totalBeds || '?'}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-slate-600 max-w-[200px] truncate" title={row.data?.features?.join(', ')}>
                              {row.data?.features && row.data.features.length > 0
                                ? row.data.features.join(', ')
                                : 'Standard'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Prospective Property Summary Impact */}
              {rowsToImport.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Prospective Impact on {activePG?.name}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                      {importMode === 'replace' ? 'Will Replace Existing Tiers' : 'Will Merge with Existing'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block font-semibold">Total Room Tiers</span>
                      <span className="text-lg font-bold text-slate-900 font-mono">
                        {finalPreviewOptions.length} Tiers
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        (was {existingOptions.length})
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block font-semibold">Starting Rent</span>
                      <span className="text-lg font-bold text-emerald-700 font-mono">
                        ₹{prospectiveStartingPrice.toLocaleString('en-IN')}/mo
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Lowest tier price
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block font-semibold">Total Bed Capacity</span>
                      <span className="text-lg font-bold text-slate-900 font-mono">
                        {prospectiveTotalBeds} Beds
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Across all tiers
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block font-semibold">Vacant Beds</span>
                      <span className="text-lg font-bold text-blue-700 font-mono">
                        {prospectiveAvailableBeds} Vacant
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Immediately bookable
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:block">
            {csvResult ? (
              <span>
                {rowsToImport.length} of {csvResult.totalRows} rows queued for import
              </span>
            ) : (
              <span>Template supports Single, Double, Triple & Quadruple rooms</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {csvResult && (
              <button
                type="button"
                disabled={isSubmitting || rowsToImport.length === 0}
                onClick={handleImport}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Writing to Database...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      Import {rowsToImport.length} Room {rowsToImport.length === 1 ? 'Tier' : 'Tiers'} & Tariffs
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
