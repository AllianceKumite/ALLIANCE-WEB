import { Inject, Input, Component} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PopoutService } from '../../services/popout.service'

@Component({
  selector: 'fullscreen-btn',
  templateUrl: './fullscreen-btn.component.html',
  styleUrls: ['./fullscreen-btn.component.css']
})
export class FullscreenBtnComponent {
    @Input() type: string;
    doc: any;
    isFullScreen = false;
    elemToFullScreen;

    constructor(
          @Inject(DOCUMENT) private document: any,
          private popoutService: PopoutService
    ) {}

    ngOnInit(): void {
        if (this.type == "popout") {
            this.doc = this.popoutService.windowInstance.document;
        } else {
            this.doc = document;
        }

        this.setUpFullscreen();

        this.doc.addEventListener('fullscreenchange', () => {this.setUpFullscreen()});

        if (this.type == "popout") {
            this.elemToFullScreen = this.doc.getElementsByTagName('body').item(0).
                  firstElementChild.lastElementChild.lastElementChild.lastElementChild.lastElementChild;
        } else {
            this.elemToFullScreen = this.doc.getElementsByTagName('body').item(0).
                  firstElementChild.lastElementChild
                  .lastElementChild.lastElementChild.lastElementChild
                  .lastElementChild;
        }
    }

    setUpFullscreen(){
      if(this.doc.fullscreenElement){
        // Set fullscreen mode indicator to true
        this.isFullScreen = true;

        if (this.elemToFullScreen) {
            this.elemToFullScreen.setAttribute('style', 'background-image: url(/assets/img/bg-ai.png);');
        }
      } else {
        // Set fullscreen mode indicator to false
        this.isFullScreen = false;

        if (this.elemToFullScreen) {
            this.elemToFullScreen.setAttribute('style', '');
        }
      }
    }

    goFullscreen () {
      if (this.elemToFullScreen.requestFullscreen) {
          this.elemToFullScreen.requestFullscreen({ navigationUI: "show" }).then().catch(err => {
              console.log(`An error occurred while trying to switch into full-screen mode: ${err.message} (${err.name})`);
            });
      } else if (this.elemToFullScreen.mozRequestFullScreen) {
          // Firefox
          this.elemToFullScreen.mozRequestFullScreen().then();
      } else if (this.elemToFullScreen.webkitRequestFullscreen) {
          // Chrome, Safari and Opera
          this.elemToFullScreen.webkitRequestFullscreen();

      } else if (this.elemToFullScreen.msRequestFullscreen) {
          // IE/Edge
          this.elemToFullScreen.msRequestFullscreen();
      }
  }
}
