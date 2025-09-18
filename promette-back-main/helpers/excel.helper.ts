import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

/**
 * Creates a new Excel workbook
 * @returns Excel workbook
 */
export const createWorkbook = (): ExcelJS.Workbook => {
  return new ExcelJS.Workbook();
};

/**
 * Creates a worksheet with formatted headers
 * @param workbook - Excel workbook
 * @param sheetName - Name of the worksheet
 * @param headers - Array of header names
 * @returns The created worksheet
 */
export const createWorksheetWithHeaders = (
  workbook: ExcelJS.Workbook,
  sheetName: string,
  headers: string[]
): ExcelJS.Worksheet => {
  const worksheet = workbook.addWorksheet(sheetName);
  
  // Add headers row
  worksheet.addRow(headers);
  
  // Format header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '003366CC' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Initial column widths based on header content
  headers.forEach((header, index) => {
    worksheet.getColumn(index + 1).width = Math.max(header.length + 5, 15);
  });
  
  return worksheet;
};

/**
 * Adds data rows to a worksheet
 * @param worksheet - Excel worksheet
 * @param data - Array of data objects
 * @param headers - Array of header keys that match object properties
 */
export const addDataToWorksheet = (
  worksheet: ExcelJS.Worksheet,
  data: Record<string, any>[],
  headers: string[]
): void => {
  data.forEach((item) => {
    const rowData = headers.map(header => item[header] || '');
    worksheet.addRow(rowData);
  });
  
  // Add zebra striping for better readability
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      if (rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEDEDED' }
        };
      }
    }
  });
  
  // Auto adjust column widths based on content
  autoAdjustColumnWidths(worksheet);
};

/**
 * Automatically adjusts column widths based on content
 * @param worksheet - Excel worksheet
 * @param minWidth - Minimum column width
 * @param maxWidth - Maximum column width
 */
export const autoAdjustColumnWidths = (
  worksheet: ExcelJS.Worksheet,
  minWidth: number = 8,
  maxWidth: number = 40
): void => {
  // Create a map to store the optimal width for each column
  const columnWidths: { [key: number]: number } = {};
  
  // Calculate optimal width for each header first
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const headerText = String(cell.value || '');
    // Headers often need a bit more space due to bold formatting
    const headerWidth = Math.min(headerText.length * 1.3 + 4, maxWidth);
    columnWidths[colNumber] = headerWidth;
  });

  // Now check all content cells
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row as we've already processed it
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        let cellWidth = minWidth; // Default minimum width
        
        if (cell.value !== null && cell.value !== undefined) {
          const cellValue = String(cell.value);
          const cellType = typeof cell.value;
          
          // Calculate width based on content type
          if (cellType === 'number') {
            // For numbers, calculate width based on digits
            const numDigits = cellValue.length;
            cellWidth = Math.max(numDigits * 1.2 + 2, minWidth);
          } else if (cell.value instanceof Date) {
            // For dates, use a standard width (date formats vary)
            cellWidth = 14;
          } else if (cellType === 'string') {
            // For text, calculate based on content length
            // Calculate width with consideration for wide chars and formatting
            const multiplier = cellValue.includes(' ') ? 0.9 : 1.1;
            cellWidth = Math.min(cellValue.length * multiplier + 2, maxWidth);
          }
          
          // For currency values (often with $ symbol and decimals)
          const isCurrency = cell.numFmt && (
            cell.numFmt.includes('$') || 
            cell.numFmt.includes('€') || 
            cell.numFmt.includes('¥') ||
            cell.numFmt.includes('£')
          );
          
          if (isCurrency) {
            cellWidth = Math.max(cellWidth, 12); // Ensure currency has enough space
          }
        }
        
        // Update column width if this cell needs more space
        if (!columnWidths[colNumber] || cellWidth > columnWidths[colNumber]) {
          columnWidths[colNumber] = cellWidth;
        }
      });
    }
  });
  
  // Apply calculated widths to columns
  Object.entries(columnWidths).forEach(([colNumber, width]) => {
    const columnIndex = parseInt(colNumber);
    const finalWidth = Math.max(minWidth, Math.min(maxWidth, width));
    
    // Set column width - add a little padding for better visual appearance
    const column = worksheet.getColumn(columnIndex);
    if (column) {
      column.width = finalWidth + 0.5;
    }
  });
  
  // Additional adjustments for specific column types
  if (worksheet.columns) {
    worksheet.columns.forEach(column => {
      // Add null checks before accessing properties and methods
      if (column && column.values) {
        // Check if column contains mostly numeric values
        let numericCount = 0;
        let totalCount = 0;
        
        // Only call eachCell if the method exists on the column
        if (column.eachCell) {
          try {
            column.eachCell({ includeEmpty: false }, cell => {
              if (typeof cell.value === 'number') numericCount++;
              totalCount++;
            });
            
            // If more than 70% of cells are numbers, align right
            if (numericCount > 0 && totalCount > 0 && numericCount / totalCount > 0.7) {
              column.alignment = { horizontal: 'right' };
            }
          } catch (error) {
            console.warn('Error while processing column:', error);
          }
        }
      }
    });
  }
};

/**
 * Saves workbook as file or buffer
 * @param workbook - Excel workbook
 * @param filePath - Optional file path to save file
 * @returns Buffer containing Excel file if filePath not provided
 */
export const saveWorkbook = async (
  workbook: ExcelJS.Workbook,
  filePath?: string
): Promise<ExcelJS.Buffer | void> => {
  if (filePath) {
    // Ensure directory exists
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    
    // Save as file
    return await workbook.xlsx.writeFile(filePath);
  } else {
    // Return buffer
    return await workbook.xlsx.writeBuffer();
  }
};

/**
 * Create a styled table inside worksheet
 * @param worksheet - Excel worksheet
 * @param headers - Table headers
 * @param startRow - Starting row for table
 */
export const createTable = (
  worksheet: ExcelJS.Worksheet,
  headers: string[],
  startRow: number = 1
): void => {
  const endRow = worksheet.rowCount;
  const endCol = headers.length;
  
  worksheet.addTable({
    name: 'DataTable',
    ref: `A${startRow}`,
    headerRow: true,
    style: {
      theme: 'TableStyleMedium2',
      showRowStripes: true,
    },
    columns: headers.map(h => ({ name: h })),
    rows: worksheet.getRows(startRow + 1, endRow)?.filter(Boolean).map(r => 
      Array.isArray(r.values) ? r.values.slice(1, endCol + 1) : []) || []
  });
  
  // Apply auto-adjustment again after creating the table
  autoAdjustColumnWidths(worksheet);
};
