import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { supabaseService } from './supabaseService.js';
import type { GeneratedReportEntity, GeminiAiSource } from '../types/index.js';

export interface GenerateReportOptions {
  taskId: string;
  userId: string;
  title: string;
  agentKey: string;
  aiSource: GeminiAiSource;
  data: any;
}

export class PdfGeneratorService {
  private reportsDir: string;

  constructor() {
    this.reportsDir = path.resolve(process.cwd(), 'uploads', 'reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Generates a themed, professional PDF binary buffer using PDFKit
   */
  public async generatePdfBuffer(options: GenerateReportOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
        const buffers: Buffer[] = [];

        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        const brandNavy = '#0F172A';
        const brandTeal = '#0D9488';
        const textDark = '#1E293B';
        const textMuted = '#64748B';
        const bgLight = '#F8FAFC';

        // Header Background Banner
        doc.rect(0, 0, doc.page.width, 100).fill(brandNavy);

        // Header Title & Subtitle
        doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('NETFIX AI — MARG GROUP', 40, 30);
        doc.fontSize(12).font('Helvetica').text('Automated Intelligence Task Execution Report', 40, 58);

        // Date and Tag top right
        doc.fontSize(9).font('Helvetica').text(`Generated: ${new Date().toISOString().split('T')[0]}`, 400, 35, { align: 'right' });
        doc.text(`Source: ${options.aiSource === 'ai' ? 'AI Generated' : 'Rule-Based Fallback'}`, 400, 50, { align: 'right' });

        doc.y = 120;

        // Document Title
        doc.fillColor(brandTeal).fontSize(16).font('Helvetica-Bold').text(options.title || 'Task Summary Report');
        doc.moveDown(0.5);

        // Metadata Box
        doc.rect(40, doc.y, doc.page.width - 80, 65).fill(bgLight).stroke('#E2E8F0');
        const boxY = doc.y - 60;

        doc.fillColor(textDark).fontSize(10).font('Helvetica-Bold');
        doc.text(`Task ID:`, 55, boxY + 10);
        doc.font('Helvetica').text(options.taskId, 120, boxY + 10);

        doc.font('Helvetica-Bold').text(`User ID:`, 55, boxY + 26);
        doc.font('Helvetica').text(options.userId, 120, boxY + 26);

        doc.font('Helvetica-Bold').text(`Agent Key:`, 300, boxY + 10);
        doc.font('Helvetica').text(options.agentKey, 370, boxY + 10);

        doc.font('Helvetica-Bold').text(`AI Source:`, 300, boxY + 26);
        doc.fillColor(options.aiSource === 'ai' ? brandTeal : '#D97706').font('Helvetica-Bold').text(options.aiSource, 370, boxY + 26);

        doc.y = boxY + 80;

        // Section Divider
        doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke('#CBD5E1');
        doc.moveDown(1);

        // Body Content
        doc.fillColor(textDark).fontSize(12).font('Helvetica-Bold').text('Execution Results & Payload Summary');
        doc.moveDown(0.5);

        const formattedData = typeof options.data === 'object' ? JSON.stringify(options.data, null, 2) : String(options.data);
        const lines = formattedData.split('\n');

        doc.fillColor(textDark).fontSize(9).font('Courier');
        for (const line of lines) {
          if (doc.y > doc.page.height - 70) {
            doc.addPage();
            doc.y = 40;
          }
          doc.text(line, { width: doc.page.width - 80 });
        }

        // Footer
        const pageCount = doc.bufferedPageRange().count || 1;
        for (let i = 0; i < pageCount; i++) {
          doc.switchToPage(i);
          doc.fillColor(textMuted).fontSize(8).font('Helvetica').text(
            `NETFIX AI — MARG Group | Confidential & Proprietary Report | Page ${i + 1} of ${pageCount}`,
            40,
            doc.page.height - 30,
            { align: 'center', width: doc.page.width - 80 }
          );
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generates PDF, saves file, creates Supabase Storage entry + database record
   */
  public async generateAndStoreReport(options: GenerateReportOptions): Promise<GeneratedReportEntity> {
    const pdfBuffer = await this.generatePdfBuffer(options);
    const reportId = `rep_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const fileName = `${options.taskId}_${reportId}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);

    // Save to disk
    fs.writeFileSync(filePath, pdfBuffer);

    const downloadUrl = `/api/agent/reports/download/${reportId}`;

    const reportEntity = await supabaseService.createGeneratedReport({
      id: reportId,
      task_id: options.taskId,
      user_id: options.userId,
      title: options.title,
      file_path: filePath,
      file_size_bytes: pdfBuffer.length,
      download_url: downloadUrl,
      ai_source: options.aiSource,
    });

    return reportEntity;
  }
}

export const pdfGeneratorService = new PdfGeneratorService();
