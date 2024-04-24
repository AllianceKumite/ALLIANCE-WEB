import { ComponentPortal, DomPortalOutlet, PortalInjector } from '@angular/cdk/portal';
import { ApplicationRef, ComponentFactoryResolver, ComponentRef, Injectable, Injector, OnDestroy } from '@angular/core';
import {POPOUT_MODAL_DATA, POPOUT_MODALS, PopoutData, PopoutModalName} from '../popout/popout.data';

import { CurrentFightComponent } from '../components/tournament/current-fight/current-fight.component'
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class PopoutService implements OnDestroy {
  constructor(
    private injector: Injector,
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef
  ) {
  }
  styleSheetElement;
  windowInstance

  ngOnDestroy() {}

  openPopoutModal(data) {
      // console.log("openPopoutModal")

      this.windowInstance = this.openOnce(
          // '_blank',
          // `${data.modalName}`
          'assets/modal/popout.html',
          'MODAL_POPOUT'
      );

      // Wait for window instance to be created
      setTimeout(() => {
          this.createCDKPortal(data, this.windowInstance);
      }, 1000);

      setTimeout(() => {
          this.detectPopupBlocker(this.windowInstance);
      }, 2000);
  }

  detectPopupBlocker(windowInstance) {
      if (
          !windowInstance ||
          windowInstance.closed ||
          typeof windowInstance.closed == "undefined"
      ) {
          alert( "Деактивуйте Popup-blocker. " +
              "This site relies on a new browser windows to diplsay data. It seems the windows has been closed." +
              "Please disable any pop-up blockers or other such software for  the specific site. "
          );
      }
  }

  openOnce(url, target) {
    // open a blank "target" window
    // or get the reference to the existing "target" window
    const winRef = window.open('', target, 'popup=1');
    // if the "target" window was just opened, change its url
    if (winRef.location.href === 'about:blank') {
        winRef.location.href = url;
    }

    return winRef;
  }

  // createCDKPortal(data, windowInstance) {
  //   if (windowInstance) {
  //     windowInstance.document.body.innerText = '';
  //     // Create a portal outlet with the body of the new window document
  //     const outlet = new DomPortalOutlet(windowInstance.document.body, this.componentFactoryResolver, this.applicationRef, this.injector);
  //   }
  // }



  createCDKPortal(data, windowInstance) {
      if (windowInstance) {
          // Create a PortalOutlet with the body of the new window document
          const outlet = new DomPortalOutlet(windowInstance.document.body, this.componentFactoryResolver, this.applicationRef, this.injector);
          // Copy styles from parent window
          document.querySelectorAll('style').forEach(htmlElement => {
              windowInstance.document.head.appendChild(htmlElement.cloneNode(true));
          });

          // Copy stylesheet link from parent window
          this.styleSheetElement = this.getStyleSheetElement();
          windowInstance.document.head.appendChild(this.styleSheetElement);

          this.styleSheetElement.onload = () => {
              // Clear popout modal content
              windowInstance.document.body.innerText = '';

              // Create an injector with modal data
              const injector = this.createInjector(data);

              // Attach the portal
              let componentInstance;

              if (data.modalName === PopoutModalName.fightDetail) {
                  windowInstance.document.title = 'Current Fight';
                  componentInstance = this.attachFightContainer(outlet, injector);
              }

              POPOUT_MODALS[data.modalName] = { windowInstance, outlet, componentInstance };
          };
      }
  }

createInjector(data): PortalInjector {
    const injectionTokens = new WeakMap();
    injectionTokens.set(POPOUT_MODAL_DATA, data);
    return new PortalInjector(this.injector, injectionTokens);
}

attachFightContainer(outlet, injector) {
    const containerPortal = new ComponentPortal(CurrentFightComponent, null, injector);
    const containerRef: ComponentRef<CurrentFightComponent> = outlet.attach(containerPortal);
    return containerRef.instance;
}

getStyleSheetElement() {
    const styleSheetElement = document.createElement('link');
    document.querySelectorAll('link').forEach(htmlElement => {
        if (htmlElement.rel === 'stylesheet') {
          const absoluteUrl = new URL(htmlElement.href).href;
          styleSheetElement.rel = 'stylesheet';
          styleSheetElement.href = absoluteUrl;
        }
    });

    return styleSheetElement;
}



}
