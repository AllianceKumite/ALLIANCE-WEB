import { Component, OnInit, Input } from '@angular/core';
import { DrawService } from '../draw-service';

@Component({
  selector: 'app-draw-wkb',
  templateUrl: './draw-wkb.component.html',
  styleUrls: ['./draw-wkb.component.css']
})
export class DrawWkbComponent implements OnInit {
    @Input()
    fights;

    @Input()
    blocks = null;

    @Input()
    category

    @Input()
    showExtendedInfo;

    @Input()
    participants;

    levels;

    constructor(private drawService: DrawService) { }

    ngOnInit(): void {
        this.levels = this.levels = this.blocks && this.blocks.length > 1 ? this.blocks[1] : null;
    }

    isWinnerAka(fight) {
        return this.drawService.isWinnerAka(fight)
    }

    isWinnerShiro(fight) {
        return this.drawService.isWinnerShiro(fight)
    }

    fightAlreadyHadPlace(fight) {
        return this.drawService.fightAlreadyHadPlace(fight)
    }

    getFilalFight() {
      let retrievePlaces = this.drawService.areAllFightsFinished(this.fights)

      return this.drawService.getFilalFight(this.levels, retrievePlaces)
    }

    get3PlaceFight() {
        let retrievePlaces = this.drawService.areAllFightsFinished(this.fights)

        let fight = this.drawService.get3PlaceFight(this.levels, retrievePlaces)

        return fight
    }

    get3PlaceFightOrPlaces() {
      let retrievePlaces = this.drawService.areAllFightsFinished(this.fights)

      let fight = this.drawService.get3PlaceFightOrPlaces(this.levels, retrievePlaces)

      return fight
    }

    isFightFor3Place(fight) {
      return this.drawService.isFightFor3Place(fight)
    }

    areAllFightsFinished() {
      return this.drawService.areAllFightsFinished(this.fights)
    }
}
