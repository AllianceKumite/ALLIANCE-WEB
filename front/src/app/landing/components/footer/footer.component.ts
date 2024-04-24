/**
 * @author Ilya
 */
import { Component, OnInit } from '@angular/core';
import { /*faTwitter,*/  faFacebookF, faInstagramSquare, faTiktok } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  faFacebook = faFacebookF;
  faInstagram = faInstagramSquare;
  faTikTok = faTiktok;
  // faTwitter = faTwitter;

  constructor() {}

  ngOnInit(): void {}
}
