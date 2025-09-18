import { Request, Response } from 'express';
import * as ExcelHelper from '../../helpers/excel.helper';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates an Excel file from provided data
 */
export const generateExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, headers, sheetName, fileName } = req.body;

    // Validate inputs
    if (!Array.isArray(data) || !Array.isArray(headers) || !sheetName || !fileName) {
      res.status(400).json({
        success: false,
        message: 'Bad request: Required parameters missing or invalid format'
      });
      return;
    }

    // Create workbook and worksheet
    const workbook = ExcelHelper.createWorkbook();
    const worksheet = ExcelHelper.createWorksheetWithHeaders(
      workbook,
      sheetName,
      headers.map((h: any) => h.label)
    );

    // Add data to worksheet
    const headerKeys = headers.map((h: any) => h.key);
    ExcelHelper.addDataToWorksheet(worksheet, data, headerKeys);

    // Apply table styling
    ExcelHelper.createTable(worksheet, headers.map((h: any) => h.label));

    // Get buffer
    const buffer = await ExcelHelper.saveWorkbook(workbook);

    if (!buffer) {
      throw new Error('Failed to generate Excel buffer');
    }

    // Set headers and send file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}.xlsx`);
    res.setHeader('Content-Length', buffer.byteLength);

    res.send(buffer);

  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating Excel file',
      error: (error as Error).message
    });
  }
};

/**
 * Saves an Excel file to the server and returns a download link
 */
export const generateAndSaveExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, headers, sheetName, fileName } = req.body;

    // Validate inputs
    if (!Array.isArray(data) || !Array.isArray(headers) || !sheetName) {
      res.status(400).json({
        success: false,
        message: 'Bad request: Required parameters missing or invalid format'
      });
      return;
    }

    // Create a unique filename if not provided
    const fileNameToUse = fileName || `export-${uuidv4()}`;

    // Create directory for saving Excel files
    const uploadsDir = path.join(process.cwd(), 'uploads', 'excel');
    const filePath = path.join(uploadsDir, `${fileNameToUse}.xlsx`);

    // Create workbook and worksheet
    const workbook = ExcelHelper.createWorkbook();
    const worksheet = ExcelHelper.createWorksheetWithHeaders(
      workbook,
      sheetName,
      headers.map((h: any) => h.label)
    );

    // Add data
    const headerKeys = headers.map((h: any) => h.key);
    ExcelHelper.addDataToWorksheet(worksheet, data, headerKeys);

    // Save file
    await ExcelHelper.saveWorkbook(workbook, filePath);

    // Generate download URL
    const downloadUrl = `${process.env.HOST || ''}api/excel/download/${fileNameToUse}`;

    res.status(200).json({
      success: true,
      message: 'Excel file generated successfully',
      fileName: `${fileNameToUse}.xlsx`,
      downloadUrl
    });

  } catch (error) {
    console.error('Error generating and saving Excel file:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating and saving Excel file',
      error: (error as Error).message
    });
  }
};

/**
 * Downloads a previously generated Excel file
 */
export const downloadExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'excel', `${fileName}.xlsx`);

    // Check if file exists
    if (!require('fs').existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
      return;
    }

    res.download(filePath, `${fileName}.xlsx`);

  } catch (error) {
    console.error('Error downloading Excel file:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading Excel file',
      error: (error as Error).message
    });
  }
};
