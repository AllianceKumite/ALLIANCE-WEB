import { Component, OnInit, Input } from '@angular/core';
import { DrawService } from '../draw-service';

@Component({
  selector: 'app-draw-circle',
  templateUrl: './draw-circle.component.html',
  styleUrls: ['./draw-circle.component.css']
})
export class DrawCircleComponent implements OnInit {
    @Input()
    fights = null;

    @Input()
    blocks = null;

    @Input()
    category = null;

    @Input()
    showExtendedInfo = false;

    @Input()
    participants;

    levels = null;

    constructor(private drawService: DrawService) { }

    ngOnInit(): void {
        this.levels = []

        this.blocks.forEach(block => {
            block.forEach(level => {
                level.forEach(fight => {
                    if (fight && fight.details && typeof fight.details.LevePair != 'undefined') {
                        if (!this.levels[fight.details.LevePair]) {
                            this.levels[fight.details.LevePair] = []
                        }

                        this.levels[fight.details.LevePair].push(fight)
                    }
                })
            })
        });

        // if (this.areAllCircleFightsFinished()) {
        //     this.participants = this.applyWinnersInfo(this.participants, this.category);
        // }
    }

    // applyWinnersInfo(participants, category) {
    //     return this.putWinnersOnTopIfNeededAndAssignPlaces(participants, [category.idxAth1Place, category.idxAth2Place, category.idxAth3Place, category.idxAth4Place])
    // }

    // unused
    putWinnersOnTopIfNeededAndAssignPlaces(participantsByBlocks, winnerIds) {
        let needToReorder = participantsByBlocks.length == 1;

        return participantsByBlocks.map(participants => {
            if (needToReorder) {
                let reordered = []

                winnerIds.forEach(id => {
                    let winner = participants.filter(p => p && p.athId == id);

                    if (winner && winner.length > 0) {
                        reordered[reordered.length] = JSON.parse(JSON.stringify(winner[0]));
                        // reordered[reordered.length - 1].place = reordered.length;

                        // Workaround to show both 3 places
                        // Category3Place sholdbe taken to account to decide should be shown 2 third places or 1 third place
                        reordered[reordered.length - 1].place = reordered.length < 4 ? reordered.length : 3;
                    }
                });

                participants.forEach(p => {
                    // if not is winner then add
                    if (winnerIds.filter(w => w == p.athId).length == 0) {
                        reordered[reordered.length] = p
                    }
                })

                return reordered
            } else {
              // only assign places
              return participants
            }
        });
    }

    getPoints(fighter1, fighter2) {
        return this.drawService.getPoints(fighter1, fighter2, this.fights);
    }

    isWinnerAka(fight) {
        return this.drawService.isWinnerAka(fight);
    }

    isWinnerShiro(fight) {
        return this.drawService.isWinnerShiro(fight);
    }

    fightAlreadyHadPlace(fight) {
        return this.drawService.fightAlreadyHadPlace(fight);
    }

    // +
    getFilalFight() {
        // let retrievePlaces = this.areAllCircleFightsFinished()
        let fight = this.get1Or3PlaceFight(1);

        // if (retrievePlaces) {
        //     this.drawService.withPlaces(fight, 1)
        // }

        return fight;
        // return this.drawService.getFilalFight(this.blocks, retrievePlaces)
    }

    // TODO: Refactor this extract 3 place fight and 1 place fight on fights regrouping phase
    // +
    get3PlaceFight() {
        // let retrievePlaces = this.areAllCircleFightsFinished()
        let fight = this.get1Or3PlaceFight(3);

        // if (retrievePlaces) {
        //     this.drawService.withPlaces(fight, 3)
        // }

        return fight;
        // return this.drawService.withPlaces(this.get1Or3PlaceFight(3), 3);
    }

    // +
    // Private
    get1Or3PlaceFight(place) {
        let fight = null;
        let finalBlock = this.blocks[0];
        const LEVEl_NEEDED = place == 1 ? 12
                : place == 3 ? 8 : 0

        if (finalBlock) {
            for (var level in finalBlock) {
                level = finalBlock[level]

                if (level) {
                    for (var i = 0; i < level.length; i++) {
                        let f = level[i];

                        if (f && ((<any>f).details) && ((<any>f).details.Level == LEVEl_NEEDED)) {
                          fight = f;

                          break
                        }
                    }
                }

                if (fight != null) {
                    break;
                }
            }
        }

        return fight;
    }

    get3PlaceFightOrPlaces() {
        let thirdPlaces = this.get3PlaceFight();

        if (!thirdPlaces) {
            thirdPlaces = this.get3sPlaces(this.blocks);
        }

        return thirdPlaces;
    }

    duelIsPlace(fight){
        return this.drawService.fightAlreadyHadPlace(fight)
    }

    // +
    isFightFor3Place(fight) {
      return fight && (<any>fight).details && (<any>fight).details.Level == 8
      // return this.drawService.isFightFor3Place(fight)
    }

    // +
    areAllFightsFinished() {
      return this.drawService.areAllFightsFinished(this.fights)
    }

    areAllCircleFightsFinished() {
        return this.fights.filter(f => f.details.DuelIsPlace == "0" && f.details.BlockNum != 0).length == 0
    }

    getThirdAndForthPlaces() {
      let category = this.category;
      let winnerIds = [/*category.idxAth1Place, category.idxAth2Place,*/ category.idxAth3Place, category.idxAth4Place]
      let participantsByBlocks = this.participants;

      let thirdPlaces = []

      participantsByBlocks.forEach(participants => {
          winnerIds.forEach(id => {
              let winner3place = participants.filter(p => p && p.athId == id);

              if (winner3place && winner3place.length > 0) {
                  winner3place = JSON.parse(JSON.stringify(winner3place[0]));
                  winner3place.place = 3;

                  thirdPlaces[thirdPlaces.length] = winner3place
              }
          });
      });

      return thirdPlaces;
    }

    get3sPlaces(blocks) {
        let thirdPlaces = this.getThirdAndForthPlaces()

        let final3 = {
            details: { Level: 8, NumDuel: 0 },
            red: thirdPlaces && thirdPlaces.length > 0 ? thirdPlaces[0] : null,
            white: thirdPlaces && thirdPlaces.length > 1 ? thirdPlaces[1] : null,
        }

        if (blocks.length > 0 && blocks[1] && blocks[2]) {
            this.fights.unshift(final3);
            this.blocks[0].unshift([final3])
        }

        return final3;
    }
}
