// components/ui/ExportModal.tsx
import { useState } from "react";
import { Modal } from "./Modal";
import { FileSpreadsheet, FileText, Download, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  filename?: string;
  headers?: string[];
  mapping?: Record<string, string>;
  includeQR?: boolean;
  onIncludeQRChange?: (include: boolean) => void;
}

export function ExportModal({
  isOpen,
  onClose,
  data,
  filename = "export",
  headers,
  mapping,
  includeQR = false,
  onIncludeQRChange,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<"csv" | "excel">("excel");
  const [exporting, setExporting] = useState(false);
  const [includeQRInExport, setIncludeQRInExport] = useState(includeQR);

  const handleIncludeQRChange = (checked: boolean) => {
    setIncludeQRInExport(checked);
    if (onIncludeQRChange) {
      onIncludeQRChange(checked);
    }
  };

  // Convert base64 to ArrayBuffer for ExcelJS
  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // Check if QR code is valid// Check if QR code is valid - Fixed
const isValidQR = (qrValue: string): boolean => {
  return typeof qrValue === 'string' && qrValue.startsWith('data:image');
};
  // Export to CSV
  const exportToCSV = () => {
    try {
      if (!data || data.length === 0) {
        toast.error("No data to export");
        return;
      }

      let csvData = data;
      
      if (mapping) {
        csvData = data.map(item => {
          const mapped: any = {};
          Object.keys(mapping).forEach(key => {
            if (key === 'qrCode' && !includeQRInExport) {
              return;
            }
            mapped[mapping[key]] = item[key] ?? '';
          });
          return mapped;
        });
      }

      const headersList = headers || Object.keys(csvData[0]);
      const filteredHeaders = includeQRInExport 
        ? headersList 
        : headersList.filter(h => h !== 'QR Code' && h !== 'qrCode');

      const csvRows = [];
      csvRows.push(filteredHeaders.join(","));
      
      for (const row of csvData) {
        const values = filteredHeaders.map(header => {
          const value = row[header] ?? '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        csvRows.push(values.join(","));
      }

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${data.length} records as CSV`);
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export CSV");
    }
  };

  // Export to Excel with QR images using ExcelJS
  const exportToExcelWithQR = async () => {
    try {
      if (!data || data.length === 0) {
        toast.error("No data to export");
        return;
      }

      setExporting(true);

      // Prepare data with mapping
      let excelData = data;
      if (mapping) {
        excelData = data.map(item => {
          const mapped: any = {};
          Object.keys(mapping).forEach(key => {
            if (key === 'qrCode') {
              mapped[mapping[key]] = item[key] || '';
            } else {
              mapped[mapping[key]] = item[key] ?? '';
            }
          });
          return mapped;
        });
      }

      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Student Management System';
      workbook.created = new Date();
      
      const worksheet = workbook.addWorksheet('Students', {
        properties: { tabColor: { argb: 'FF1A56DB' } },
        pageSetup: { orientation: 'landscape', fitToPage: true }
      });

      // Get headers
      const allHeaders = Object.keys(excelData[0] || {});
      const filteredHeaders = includeQRInExport 
        ? allHeaders 
        : allHeaders.filter(h => h !== 'QR Code');

      // Style for header row
      const headerStyle: Partial<ExcelJS.Style> = {
        font: { 
          name: 'Segoe UI',
          size: 11,
          bold: true,
          color: { argb: 'FFFFFFFF' }
        },
        fill: {
          type: 'pattern' as const,
          pattern: 'solid' as const,
          fgColor: { argb: 'FF1A56DB' }
        },
        alignment: {
          horizontal: 'center' as const,
          vertical: 'middle' as const,
          wrapText: true
        },
        border: {
          top: { style: 'thin' as const, color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin' as const, color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin' as const, color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin' as const, color: { argb: 'FFCCCCCC' } }
        }
      };

      // Add header row
      const headerRow = worksheet.addRow(filteredHeaders);
      headerRow.height = 30;
      headerRow.eachCell((cell: ExcelJS.Cell) => {
        cell.style = headerStyle;
      });

      // Style for data rows
      const dataStyle: Partial<ExcelJS.Style> = {
        font: { 
          name: 'Segoe UI',
          size: 10
        },
        alignment: {
          horizontal: 'left' as const,
          vertical: 'middle' as const,
          wrapText: true
        },
        border: {
          top: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin' as const, color: { argb: 'FFE0E0E0' } }
        }
      };

      // Track QR code column index
      let qrColIndex = -1;
      if (includeQRInExport) {
        qrColIndex = filteredHeaders.indexOf('QR Code');
      }

      // Process each data row
      for (let i = 0; i < excelData.length; i++) {
        const rowData = excelData[i];
        const rowValues = filteredHeaders.map(header => rowData[header] ?? '');
        const row = worksheet.addRow(rowValues);
        row.height = 80; // Extra height for QR images
        row.eachCell((cell: ExcelJS.Cell) => {
          cell.style = dataStyle;
        });

        // Add QR code image if included and valid
        if (includeQRInExport && qrColIndex !== -1) {
          const qrValue = rowData['QR Code'];
          if (isValidQR(qrValue)) {
            try {
              // Convert base64 to ArrayBuffer
              const imageBuffer = base64ToArrayBuffer(qrValue);
              
              // Add image to workbook
              const imageId = workbook.addImage({
                buffer: imageBuffer,
                extension: 'png' as const,
              });

              // Add image to worksheet at the cell position
              worksheet.addImage(imageId, {
                tl: { 
                  col: qrColIndex, 
                  row: i + 1
                },
                ext: { width: 70, height: 70 },
                editAs: 'oneCell' as const
              });

              // Set cell value to indicate QR code presence
              const cell = row.getCell(qrColIndex + 1);
              cell.value = 'QR ✓';
              if (cell.font) {
                cell.font = { 
                  name: 'Segoe UI',
                  size: 9,
                  color: { argb: 'FF00AA00' },
                  bold: true
                };
              }
              if (cell.alignment) {
                cell.alignment = {
                  horizontal: 'center' as const,
                  vertical: 'middle' as const
                };
              }

            } catch (error) {
              console.error('Error adding QR image for row', i, ':', error);
              // Set error message in cell
              const cell = row.getCell(qrColIndex + 1);
              cell.value = 'QR Error';
              if (cell.font) {
                cell.font = { 
                  name: 'Segoe UI',
                  size: 9,
                  color: { argb: 'FFFF0000' }
                };
              }
            }
          } else {
            // No QR code available
            const cell = row.getCell(qrColIndex + 1);
            cell.value = 'N/A';
            if (cell.font) {
              cell.font = { 
                name: 'Segoe UI',
                size: 9,
                color: { argb: 'FF999999' }
              };
            }
            if (cell.alignment) {
              cell.alignment = {
                horizontal: 'center' as const,
                vertical: 'middle' as const
              };
            }
          }
        }
      }

      // Freeze header row
      worksheet.views = [
        { state: 'frozen' as const, ySplit: 1 }
      ];

      // Auto-fit columns with proper widths - Fixed TypeScript error
      const columnHeaders = filteredHeaders;
      columnHeaders.forEach((header, colIndex) => {
        let maxLength = 10;
        maxLength = Math.max(maxLength, header.length);

        // Get the column by index
        const column = worksheet.getColumn(colIndex + 1);
        
        // Calculate max length from cells
        if (column && column.eachCell) {
          column.eachCell({ includeEmpty: true }, (cell: ExcelJS.Cell) => {
            const cellValue = cell.value ? cell.value.toString() : '';
            maxLength = Math.max(maxLength, cellValue.length);
          });
        }

        // Special width for QR Code column
        if (includeQRInExport && colIndex === qrColIndex) {
          column.width = 15;
        } else {
          column.width = Math.min(maxLength + 3, 40);
        }
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      saveAs(blob, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);

      toast.success(`Exported ${data.length} records as Excel${includeQRInExport ? ' with QR images' : ''}`);
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export Excel with QR codes");
    } finally {
      setExporting(false);
    }
  };

  const handleExport = async () => {
    if (selectedFormat === "csv") {
      exportToCSV();
    } else {
      await exportToExcelWithQR();
    }
  };

  const formatOptions = [
   
    {
      id: "excel",
      label: "Excel Format",
      icon: FileSpreadsheet,
      description: "Microsoft Excel format with QR code images embedded",
      color: "green",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Data" size="md">
      <div className="space-y-6">
        {/* Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">{data.length}</span> records ready to export
          </p>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Export Format
          </label>
          <div className="grid grid-cols-1 gap-3">
            {formatOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedFormat === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedFormat(option.id as "excel" | "excel")}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? `border-${option.color}-600 bg-${option.color}-50 ring-2 ring-${option.color}-600/20`
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? `bg-${option.color}-100` : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isSelected ? `text-${option.color}-600` : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${
                          isSelected ? `text-${option.color}-700` : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div
                        className={`w-2 h-2 rounded-full bg-${option.color}-600 flex-shrink-0 mt-1`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* QR Code Toggle - Only show for Excel format */}
        {selectedFormat === "excel" && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Include QR Code Images</p>
                <p className="text-xs text-gray-500">Embed QR images directly in Excel cells</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeQRInExport}
                onChange={(e) => handleIncludeQRChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        )}

        {/* Export Info */}
        {selectedFormat === "excel" && includeQRInExport && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-700">
              <span className="font-semibold">✓ QR images will be embedded</span>
              <br />
              Each QR code will appear as an image in the QR Code column with ✓ indicator
            </p>
          </div>
        )}

        {/* Preview */}
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">Preview (first 3 rows)</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {data.slice(0, 3).map((item, index) => {
              let displayData = item;
              if (headers) {
                const filteredHeaders = includeQRInExport 
                  ? headers 
                  : headers.filter(h => h !== 'QR Code' && h !== 'qrCode');
                displayData = filteredHeaders.reduce((acc: any, h) => {
                  acc[h] = item[h] ?? '';
                  return acc;
                }, {});
              }
              return (
                <div
                  key={index}
                  className="text-xs text-gray-600 font-mono bg-white p-1.5 rounded border border-gray-100"
                >
                  {Object.values(displayData).slice(0, 4).join(" | ")}
                  {Object.values(displayData).length > 4 && ' ...'}
                </div>
              );
            })}
            {data.length > 3 && (
              <p className="text-xs text-gray-400 text-center">
                + {data.length - 3} more rows
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || data.length === 0}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
          >
            {exporting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export {selectedFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}