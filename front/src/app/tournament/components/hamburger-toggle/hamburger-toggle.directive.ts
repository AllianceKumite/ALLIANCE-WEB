import {OnInit, Directive, HostBinding, HostListener, Renderer2} from '@angular/core';

@Directive({
  selector: '[appHamburgerToggle]'
})
export class HamburgerToggleDirective implements OnInit {
  @HostBinding('class.is-active')
  private isActive = false;

  @HostListener('click')
  toggleActive(): void {
    this.isActive = !this.isActive;

    this.adjustCollapsible(this.isActive);
  }

  constructor(private renderer: Renderer2) { }

  ngOnInit() {
  }

  adjustCollapsible (visible) {
      const collapseable = document.getElementById('navbarCollaseable');

      this.renderer.setStyle(collapseable, 'display', visible ? 'block' : 'none');
  }
}
