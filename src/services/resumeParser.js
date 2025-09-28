import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';


GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

// Configure PDF.js worker
// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Email regex pattern (simplified but robust)
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

// Phone regex pattern (flexible for various formats)
const PHONE_REGEX = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;

// Name extraction patterns
const NAME_PATTERNS = [
  /^([A-Z][a-z]+ [A-Z][a-z]+)/m, // First line capitalized name
  /Name:\s*([A-Za-z\s]+)/i,
  /^([A-Z\s]+)$/m, // All caps name (sometimes used)
];

export class ResumeParser {
  static async parseFile(file) {
    try {
      const fileType = file.type;
      let text = '';

      if (fileType === 'application/pdf') {
        text = await this.parsePDF(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await this.parseDOCX(file);
      } else {
        throw new Error('Unsupported file type. Please upload PDF or DOCX files only.');
      }

      const fields = this.extractFields(text);
      return { text, fields };
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw error;
    }
  }

  static async parsePDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      text += pageText + '\n';
    }

    return text;
  }

  static async parseDOCX(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  static extractFields(text) {
    const fields = {
      name: '',
      email: '',
      phone: '',
    };

    // Extract email
    const emailMatches = text.match(EMAIL_REGEX);
    if (emailMatches && emailMatches.length > 0) {
      fields.email = emailMatches[0].toLowerCase();
    }

    // Extract phone
    const phoneMatches = text.match(PHONE_REGEX);
    if (phoneMatches && phoneMatches.length > 0) {
      let phoneNumber = phoneMatches[0];
      try {
        const parsed = parsePhoneNumber(phoneNumber, 'US');
        if (parsed && isValidPhoneNumber(phoneNumber, 'US')) {
          fields.phone = parsed.formatNational();
        }
      } catch (e) {
        // Keep original format if parsing fails
        fields.phone = phoneNumber;
      }
    }

    // Extract name
    for (const pattern of NAME_PATTERNS) {
      const nameMatch = text.match(pattern);
      if (nameMatch && nameMatch[1]) {
        const potentialName = nameMatch[1].trim();
        // Basic validation: should be 2-50 chars, contain at least one space
        if (potentialName.length >= 2 && potentialName.length <= 50 && potentialName.includes(' ')) {
          fields.name = potentialName;
          break;
        }
      }
    }

    // Fallback: try to extract name from first line
    if (!fields.name) {
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      if (lines.length > 0) {
        const firstLine = lines[0].trim();
        // If first line looks like a name (2+ words, reasonable length)
        const words = firstLine.split(/\s+/);
        if (words.length >= 2 && words.length <= 4 && firstLine.length <= 50) {
          fields.name = firstLine;
        }
      }
    }

    return fields;
  }

  static validateFields(fields) {
    const missing = [];
    
    if (!fields.name || fields.name.trim().length < 2) {
      missing.push('name');
    }
    
    if (!fields.email || !EMAIL_REGEX.test(fields.email)) {
      missing.push('email');
    }
    
    if (!fields.phone || fields.phone.trim().length < 10) {
      missing.push('phone');
    }
    
    return missing;
  }
}