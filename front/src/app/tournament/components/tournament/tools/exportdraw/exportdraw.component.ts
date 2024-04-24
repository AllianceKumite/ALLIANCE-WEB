import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentService } from './../../../../services/tournament.service';
import { HomeService } from './../../../../../shared/services/home.service';
import { TranslateService } from '@ngx-translate/core';
import { TournamentRoutingModule } from '../../../../tournament-routing.module';
import { Subscription } from 'rxjs';
// import { GrabzitService } from './../../../../services/grabzit.service';
// import { PdfkitService } from './../../../../services/pdfkit.service';
// import PSPDFKit from 'pspdfkit';

// import GrabzIt from 'grabzit';
// import { grabzit } from 'grabzIt';

// import pdfMake from 'pdfmake/build/pdfmake';
// import pdfFonts  from 'pdfmake/build/vfs_fonts';
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
// import htmlToPdfmake from 'html-to-pdfmake';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import pdfmake from 'pdfmake';
import { DrawService } from '../../draw/draw-service';

@Component({
  selector: 'app-exportdraw',
  templateUrl: './exportdraw.component.html',
  styleUrls: ['./exportdraw.component.css'],
})
export class ExportdrawComponent implements OnInit {
  nameOfChampionship: string = '';
  champname: string = '';
  champcity: string = '';
  datefrom: string;
  dateto: string;
  dDatefrom: Date;
  dDateto: Date;
  orientation: number = 0;
  scale: number = 0.7;
  tournament: any;
  stamp_bytes: any;
  stamp: string;

  sign_bytes: any;
  sign: string;

  sizestamp = 120;
  sizesign = 120;
  headerline1: string = '';
  headerline2: string = '';
  headerline3: string = '';

  categories: any[] = [];
  selectedCategory: any;
  isShowSetup: boolean = true;
  isBuildPDF: boolean = false;
  subscription: Subscription;
  viewDraw: boolean = false;
  selectedDraw: any;
  categoryId: string;
  @ViewChild('boxPDF') boxPDF: ElementRef;

  constructor(
    private tournamentService: TournamentService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private homeService: HomeService,
    private translateService: TranslateService, // private grabzitService: GrabzitService, // private pdfkitService: PdfkitService
    private cdr: ChangeDetectorRef,
    private drawService: DrawService,
  ) {}

  async ngOnInit() {
    this.subscription = this.homeService._champInfo.subscribe((champInfo) => {
      this.tournament = champInfo[1];

      this.datefrom = this.tournament?.champFrom;
      this.dateto = this.tournament?.champTo;
      this.dDatefrom = new Date(this.datefrom);
      this.dDateto = new Date(this.dateto);
      this.getChampInfo();
    });

    this.activeRoute.parent.params.subscribe((params) => {
      this.nameOfChampionship = params['name'];
    });

    this.homeService
      .getCategories({ title: this.nameOfChampionship })
      .subscribe((response: any[]) => this.initCategories(response));

    this.translateService.onLangChange.subscribe((event) => {
      this.getChampInfo();
    });
  }

  onDrawPdf() {
    // var boxPDF = document.getElementById('boxPDF').innerHTML;
    // this.pdfkitService.exportToPDF();
    // const doc = new PDFDocument();
    // const stream = doc.pipe(blobStream());
    // doc.text('Hello, PDFKit in Angular!');
    // doc.end();
    // stream.on('finish', () => {
    //   const blob = stream.toBlob('application/pdf');
    //   const pdfUrl = URL.createObjectURL(blob);
    //   window.open(pdfUrl, '_blank');
    // });
  }

  initCategories(response) {
    if (response) {
      let vals = Object.values(response);

      this.categories = Object.keys(response).map((w, index) => {
        return { id: w, name: vals[index] };
      });
    }
  }

  isSelectedRow(category): boolean {
    return (category.id = this.selectedCategory?.id);
  }

  onRowClick(category) {
    this.viewDraw = false;
    // this.selectedDraw = { category: this.selectedCategory?.id };
    this.categoryId = category?.id.toString;
    this.selectedCategory = category;
    this.categoryId = this.selectedCategory.name;
    this.viewDraw = true;
  }

  onShowSetup() {
    this.isShowSetup = !this.isShowSetup;
  }

  getChampInfo() {
    let lng = localStorage.getItem('lng');
    if (lng === 'ru') {
      this.champname = this.tournament?.champNameRu;
      this.champcity = this.tournament?.champCityRu;
    }
    if (lng === 'ua') {
      this.champname = this.tournament?.champNameUa;
      this.champcity = this.tournament?.champCityUa;
    }
    if (lng === 'en') {
      this.champname = this.tournament?.champNameEn;
      this.champcity = this.tournament?.champCityEn;
    }
  }

  async onLoadStamp(event) {
    let file = event.target.files[0];
    let imgUrl = (await this.getBase64(file)) as any;
    this.stamp_bytes = imgUrl; //.replace(/^data:(.*,)?/, '');
    this.stamp = event.target.files[0]['name'];
  }

  async onLoadSign(event) {
    let file = event.target.files[0];
    let imgUrl = (await this.getBase64(file)) as any;
    this.sign_bytes = imgUrl; //.replace(/^data:(.*,)?/, '');
    this.sign = event.target.files[0]['name'];
  }

  onDelSign() {
    this.sign_bytes = '';
    this.sign = '';
  }

  onDelStamp() {
    this.stamp_bytes = '';
    this.stamp = '';
  }

  private getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  getsize() {
    return `${this.sizestamp}px`;
  }

  getsizeSign() {
    return `${this.sizesign}px`;
  }

  convertHTMLtoPDF() {
    var doc = new jsPDF();

    // Source HTMLElement or a string containing HTML.
    var elementHTML = document.getElementById('boxPDF');

    doc.html(elementHTML, {
      callback: function (doc) {
        // Save the PDF
        doc.save('sample-document.pdf');
      },
      x: 0,
      y: 0,
      width: 210, //target width in the PDF document
      windowWidth: 1000, //window width in CSS pixels
    });
  }

  async processPrint() {
    var gAutoPrint = true;

    if (document.getElementById != null) {
      var html = '<HTML>\n<HEAD>\n';
      if (document.getElementsByTagName != null) {
        var headTags = document.getElementsByTagName('head');
        if (headTags.length > 0) {
          html += headTags[0].innerHTML;
        }
      }

      html += '\n</HE' + 'AD>\n<BODY>\n';
      var printReadyElem = document.getElementById('boxPDF');

      if (printReadyElem != null) {
        html += printReadyElem.innerHTML;
      } else {
        alert('Error, no contents.');
        return;
      }

      html += '\n</BO' + 'DY>\n</HT' + 'ML>';
      var printWin = window.open('', 'processPrint');
      printWin.document.open();
      printWin.document.write(html);
      printWin.document.close();
      printWin.print();

      // if (gAutoPrint) {
      //   printWin.print();
      // }
      // else { alert("Browser not supported.") };
    }
  }

  printMe(DivID) {
    var disp_setting = 'toolbar=yes,location=no,';
    var printContents = document.getElementById('boxPDF').innerHTML;
    disp_setting += 'directories=yes,menubar=yes,';
    disp_setting += 'scrollbars=yes,width=650, height=600, left=100, top=25';
    var content_vlue = document.getElementById(DivID).innerHTML;
    var docprint = window.open('', '', disp_setting);
    docprint.document.open();
    docprint.document.write(
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"'
    );
    docprint.document.write(
      '"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'
    );
    docprint.document.write(
      '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">'
    );
    docprint.document.write('<head><title>My Title</title>');
    docprint.document.write('<style type="text/css">body{ margin:0px;');
    docprint.document.write('font-family:verdana,Arial;color:#000;');
    docprint.document.write(
      'font-family:Verdana, Geneva, sans-serif; font-size:12px;}'
    );
    docprint.document.write('a{color:#000;text-decoration:none;} </style>');
    docprint.document.write('</head><body><center>');
    docprint.document.write(printContents);
    docprint.document.write('</center></body></html>');
    docprint.self.print();
    //  docprint.focus();
  }

  handlePrint() {
    const navEl = document.getElementById('boxpreview').innerHTML;
    this.tournamentService.getPDFFile(navEl);
  }

  async buildAllPdf(){
    let complete = false;
    for (let i = 0; i < this.categories.length; i++) {
      let category = this.categories[i];
      this.drawService.isDrawCat = false;
      this.onRowClick(category);
      // console.log(category);
      // while(true){
        // const requestB = setTimeout (() => {
        //   console.log(`this.drawService.isDrawCat-${i}`);
        // }, 2000);
        // setTimeout(()=>{                           // <<<---using ()=> syntax
        //   complete = this.drawService.isDrawCat;
        // }, 3000);

      // if(complete){
      //     break;
        // }
      // }
      setTimeout(() => console.log(`this.drawService.isDrawCat-${i}`), 2000);
          // console.log(`this.drawService.isDrawCat-${i}`);
      continue;
      this.cdr.detectChanges();
      const data = document.getElementById('boxportrait');
      const boxDraw = document.getElementById('boxdraw');
      this.isBuildPDF = true;
  
      // console.log(categoryId);
      
  
      let fName: string = '';
      let fullName: string = '';
      this.translateService
        .get('champ.categories.' + this.categoryId)
        .subscribe((res: string) => {
          fName = res;
        });
      fullName = `${this.tournament.title}-${fName}.pdf`;
  
      // boxPreview.style.width = "100%";
      html2canvas(data).then((canvas: any) => {
        var contentWidth = canvas.width;
        var contentHeight = canvas.height;
  
       
        //One page pdf shows the canvas height generated by html pages.
        var pageHeight = (contentWidth / 592.28) * 841.89;
        //html page height without pdf generation
  
        var leftHeight = contentHeight;
        //Page offset
        var position = 0;
        //a4 paper size [595.28, 841.89], html page generated canvas in pdf picture width
        var imgWidth = 595.28;
        var imgHeight = (592.28 / contentWidth) * contentHeight;
        var pageData = canvas.toDataURL('image/jpeg', 1.0);
        var pdf = new jsPDF('p', 'pt', 'a4');
        //There are two heights to distinguish, one is the actual height of the html page, and the page height of the generated pdf (841.89)
        //When the content does not exceed the range of pdf page display, there is no need to paginate
        if (leftHeight < pageHeight) {
          pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
        } else {
          while (leftHeight > 0) {
            pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
            leftHeight -= pageHeight;
            position -= 841.89;
            //Avoid adding blank pages
            if (leftHeight > 0) {
              pdf.addPage();
            }
          }
        }
        pdf.save(fullName);
      });
  
        

    }

    // this.textprogress = "Complete";
    // preloader.style.display = 'none';

  }

  checkDraw(){
    
    // this.drawService.isDrawCat; 
  }

  async onBuildPDF(fname: string) {
    const data = document.getElementById('boxportrait');
    const boxDraw = document.getElementById('boxdraw');
    this.isBuildPDF = true;

    let fName: string = '';
    let fullName: string = '';
    this.translateService
      .get('champ.categories.' + this.selectedCategory?.id)
      .subscribe((res: string) => {
        fName = res;
      });
    fullName = `${this.tournament.title}-${fName}.pdf`;

    // boxPreview.style.width = "100%";
    html2canvas(data).then((canvas: any) => {
      var contentWidth = canvas.width;
      var contentHeight = canvas.height;

     
      //One page pdf shows the canvas height generated by html pages.
      var pageHeight = (contentWidth / 592.28) * 841.89;
      //html page height without pdf generation

      var leftHeight = contentHeight;
      //Page offset
      var position = 0;
      //a4 paper size [595.28, 841.89], html page generated canvas in pdf picture width
      var imgWidth = 595.28;
      var imgHeight = (592.28 / contentWidth) * contentHeight;
      var pageData = canvas.toDataURL('image/jpeg', 1.0);
      var pdf = new jsPDF('p', 'pt', 'a4');
      //There are two heights to distinguish, one is the actual height of the html page, and the page height of the generated pdf (841.89)
      //When the content does not exceed the range of pdf page display, there is no need to paginate
      if (leftHeight < pageHeight) {
        pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        while (leftHeight > 0) {
          pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
          leftHeight -= pageHeight;
          position -= 841.89;
          //Avoid adding blank pages
          if (leftHeight > 0) {
            pdf.addPage();
          }
        }
      }
      pdf.save(fullName);
    });

  }

  async onBuildOnePDF(categoryId) {
    const data = document.getElementById('boxportrait');
    const boxDraw = document.getElementById('boxdraw');
    this.isBuildPDF = true;

    console.log(categoryId);
    

    let fName: string = '';
    let fullName: string = '';
    this.translateService
      .get('champ.categories.' + categoryId)
      .subscribe((res: string) => {
        fName = res;
      });
    fullName = `${this.tournament.title}-${fName}.pdf`;

    // boxPreview.style.width = "100%";
    html2canvas(data).then((canvas: any) => {
      var contentWidth = canvas.width;
      var contentHeight = canvas.height;

     
      //One page pdf shows the canvas height generated by html pages.
      var pageHeight = (contentWidth / 592.28) * 841.89;
      //html page height without pdf generation

      var leftHeight = contentHeight;
      //Page offset
      var position = 0;
      //a4 paper size [595.28, 841.89], html page generated canvas in pdf picture width
      var imgWidth = 595.28;
      var imgHeight = (592.28 / contentWidth) * contentHeight;
      var pageData = canvas.toDataURL('image/jpeg', 1.0);
      var pdf = new jsPDF('p', 'pt', 'a4');
      //There are two heights to distinguish, one is the actual height of the html page, and the page height of the generated pdf (841.89)
      //When the content does not exceed the range of pdf page display, there is no need to paginate
      if (leftHeight < pageHeight) {
        pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        while (leftHeight > 0) {
          pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
          leftHeight -= pageHeight;
          position -= 841.89;
          //Avoid adding blank pages
          if (leftHeight > 0) {
            pdf.addPage();
          }
        }
      }
      pdf.save(fullName);
    });

  }

}




