import { Component, OnInit, Input } from '@angular/core';
import { DrawService } from '../draw-service';


@Component({
  selector: 'app-draw-olympic',
  templateUrl: './draw-olympic.component.html',
  styleUrls: ['./draw-olympic.component.css']
})
export class DrawOlympicComponent implements OnInit {
    @Input()
    fights;

    @Input()
    blocks = null;

    @Input()
    showExtendedInfo;

    levels
    middleIdx;

    constructor(private drawService: DrawService) { }

    ngOnInit(): void {
        this.levels = this.blocks && this.blocks.length > 1 ? this.blocks[1] : null
        this.middleIdx = this.levels[0]?.length / 2 - 1;
        // console.log(this.middleIdx);
        
    }

    isSingleParticipant(fight) {
        return this.drawService.isSingleParticipant(fight)
    }

    wasPreviousAkaSingle(fight) {
        return this.drawService.wasPreviousAkaSingle(fight)
    }

    wasPreviousShiroSingle(fight) {
        return this.drawService.wasPreviousShiroSingle(fight)
    }

    shouldBeDrawn(fight) {
        return this.drawService.shouldBeDrawn(fight, this.levels)
    }

    isFromLastLevel(fight) {
        return this.drawService.isFromLastLevel(fight, this.levels)
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

    isFightFor3Place(fight) {
        return this.drawService.isFightFor3Place(fight)
    }

    duelIsPlace(fight){
        return this.drawService.fightAlreadyHadPlace(fight)
    }

    getFilalFight() {
        let retrievePlaces = this.drawService.areAllFightsFinished(this.fights)

        return this.drawService.getFilalFight(this.levels, retrievePlaces)
    }

    get3PlaceFightOrPlaces() {
        let retrievePlaces = this.drawService.areAllFightsFinished(this.fights)

        return this.drawService.get3PlaceFightOrPlaces(this.levels, retrievePlaces)
    }

    get3PlaceFight() {
        let retrievePlaces = this.drawService.areAllFightsFinished(this.fights)

        return this.drawService.get3PlaceFight(this.levels, retrievePlaces)
    }

    get3sPlaces() {
        let retrievePlaces = this.drawService.areAllFightsFinished(this.fights)

        return this.drawService.get3sPlaces(this.levels, retrievePlaces)
    }

    getLooser(fightId, level) {
        return this.drawService.getLooser(fightId, level)
    }

    areAllFightsFinished() {
      return this.drawService.areAllFightsFinished(this.fights)
    }
}
