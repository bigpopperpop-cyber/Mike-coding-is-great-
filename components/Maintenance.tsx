
import React from 'react';
import { PaymentRecord } from '../types.ts';
import { downloadFile, convertToCSV } from '../utils.ts';
import { Download, Upload, FileSpreadsheet, History, AlertTriangle } from 'lucide-react';

interface MaintenanceProps {
  payments: PaymentRecord[];
  onRestore: (payments: PaymentRecord[]) => void;
}

const Maintenance: React.FC<MaintenanceProps> = ({ payments, onRestore }) => {
  const handleExportCSV = () => {
    const csv = convertToCSV(payments);
    downloadFile(csv, 'house-payments.csv', 'text/csv');
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(payments, null, 2);
    downloadFile(json, 'payments-backup.json', 'application/json');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          if (window.confirm("This will replace all current data. Are you sure?")) {
            onRestore(data);
            alert("Data restored successfully!");
          }
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Error reading backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
            <Download size={24} />
          </div>
          <h4 className="text-xl font-bold text-slate-800">Extract Data</h4>
        </div>
        <p className="text-slate-500 mb-8">Download all records to use in Excel or save as a personal backup.</p>
        
        <div className="space-y-4">
          <button 
            onClick={handleExportCSV}
            className="w-full flex items-center justify-between p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold hover:bg-emerald-100 transition-all border border-emerald-200"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} />
              Export to Excel (CSV)
            </div>
            <Download size={18} />
          </button>
          
          <button 
            onClick={handleExportJSON}
            className="w-full flex items-center justify-between p-4 bg-slate-50 text-slate-700 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-200"
          >
            <div className="flex items-center gap-3">
              <History size={20} />
              Full System Backup (.json)
            </div>
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
            <Upload size={24} />
          </div>
          <h4 className="text-xl font-bold text-slate-800">Restore & Fix</h4>
        </div>
        <p className="text-slate-500 mb-8">If a mistake was made, you can upload a previous backup file to restore the data.</p>
        
        <label className="block w-full cursor-pointer">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-blue-400 hover:bg-blue-50 transition-all group">
            <Upload className="text-slate-300 group-hover:text-blue-500 mb-4" size={40} />
            <span className="text-slate-600 font-bold">Select Backup File</span>
            <span className="text-slate-400 text-sm mt-1">Upload .json backup</span>
            <input 
              type="file" 
              className="hidden" 
              accept=".json"
              onChange={handleImportJSON}
            />
          </div>
        </label>
        
        <div className="mt-6 flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
          <AlertTriangle className="text-rose-500 shrink-0" size={20} />
          <p className="text-rose-700 text-xs font-medium">
            Warning: Restoring from a file will overwrite all changes currently visible on this screen.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
