import { Injectable } from '@angular/core';
import PDFDocument from 'pdfkit';

@Injectable({
  providedIn: 'root',
})
export class PdfkitService {
  private pdfdoc : any;

  constructor() {
    this.pdfdoc = new PDFDocument( );
  }

  exportToPDF() {
    let doc = new PDFDocument();
    doc.text('Hello, PDFKit in Angular!');
    console.log(doc);
    
    doc.end();
  }
}
