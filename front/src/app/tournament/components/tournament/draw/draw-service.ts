import { Injectable } from "@angular/core";

@Injectable({  providedIn: 'root' })
export class DrawService {

    isDrawCat : boolean;
    isWinnerAka(fight) {
        return fight && fight.details["WinnerRed"] == 1
    }

    isWinnerShiro(fight) {
        return fight && fight.details["WinnerWhite"] == 1
    }

    fightAlreadyHadPlace(fight) {
        return fight && fight.details["DuelIsPlace"] == 1
    }

    isFightPostponed(fight) {
        return this.fightAlreadyHadPlace(fight) && !this.isWinnerAka(fight) && !this.isWinnerShiro(fight)
    }

    isFightFor3Place(fight) {
        return fight && fight.details["Duel3Place"] == 1
    }

    duelIsPlace(fight) {
        return fight && fight.details["DuelIsPlace"] == 1
    }

    isSingleParticipant(fight) {
        return fight && fight.details['AthIdWhite'] == '-1' && fight.details['LevePair'] == 0
    }

    wasPreviousAkaSingle(fight) {
        return fight && fight.details['AthIdRed'] != '-1' && fight.details['LevePair'] > 0
    }

    wasPreviousShiroSingle(fight) {
        return fight && fight.details['AthIdWhite'] != '-1' && fight.details['LevePair'] > 0
    }

    /** olympic, circle */
    shouldBeDrawn(fight, levels) {
        return fight && fight.details['NumPair'] != '0' && this.isFromLastLevel(fight, levels) || !this.isFromLastLevel(fight, levels)
    }

    isFromLastLevel(fight, levels) {
        return fight && fight.details["LevePair"] == levels.length - 1
    }

    getFilalFight(levels, calculatePlaces) {
      let final: any = null;

      // TODO: cache
      // if (this.final) {
      //     // final = this.final;
      // } else {
          let lastLevel = levels[levels.length - 1];
          for (let fight in lastLevel) {
              if (lastLevel[fight].details.Duel1Place == "1") {
                  final = lastLevel[fight];

                  if (final.details.DuelIsPlace == "1") {
                  } else {
                      if (final.details.AthIdRed == "-1") {
                          final.red = null
                      }

                      if (final.details.AthIdWhite == "-1") {
                          final.white = null
                      }
                  }

                  break
              }
          }

          // this.final = final;
      // }

      return final;
  }

  withPlaces(fight, placeToFightFor) {
      if (fight)   {
          let placeThatLeft = placeToFightFor == 3 ? 4
              : placeToFightFor == 1 ? 2
              : 0

          if (fight.details.WinnerRed == '1') {
            fight.red.place = placeToFightFor
            fight.white.place = placeThatLeft
          }
          if (fight.details.WinnerWhite == '1') {
              fight.white.place = placeToFightFor
              fight.red.place = placeThatLeft
          }
      }

      return fight;
  }

  // TODO: use withPlaces
  get3PlaceFight(levels, calculatePlaces) {
    let final: any = null;

    // TODO: cache
    // if (this.final3Place) {
    //     final = this.final3Place;
    // } else {
        let lastLevel = levels[levels.length - 1];

        for (let fight in lastLevel) {
            if (lastLevel[fight].details.Duel3Place == "1") {
              final = lastLevel[fight];

              if (final.details.DuelIsPlace == "1") {
              } else {
                  if (final.details.AthIdRed == "-1") {
                      final.red = null
                  }

                  if (final.details.AthIdWhite == "-1") {
                      final.white = null
                  }
              }

              break
            }
        }

        // this.final3Place = final;
    // }

    return final;
}

// unused
get3sPlaces(levels, calculatePlaces) {
  let thirdsPlaces = null;

  let lastLevel = levels[levels.length - 1];

  let beforeLastLevel = levels[levels.length - 2];

  for (let fightIndex in lastLevel) {
      let fight = lastLevel[fightIndex];

      if (fight && fight.details['NumPair'] == '0') {
        fight.red = this.getLooser(fight.details.UpDuelRed, beforeLastLevel);
        fight.red = JSON.parse(JSON.stringify(fight.red));

        if (fight.red && calculatePlaces) {
            fight.red.place = 3;
        }

        fight.white = this.getLooser(fight.details.UpDuelWhite, beforeLastLevel);
        fight.white = JSON.parse(JSON.stringify(fight.white));

        if (fight.white && calculatePlaces) {
            fight.white.place = 3;
        }

        thirdsPlaces = fight;

        break;
      }
  }

  return thirdsPlaces;
}


  get3PlaceFightOrPlaces(levels, calculatePlaces) {
    let thirdPlaces = this.get3PlaceFight(levels, calculatePlaces);

    if (!thirdPlaces) {
        thirdPlaces = this.get3sPlaces(levels, calculatePlaces);
    }

    return thirdPlaces;
  }



  getLooser(fightId, level) {
      let looser = null;

      for (let fightIndex in level) {
          let fight = level[fightIndex];

          if (fight.details.NumDuel == fightId) {
              looser = fight.details.WinnerRed  == '1' ? fight.white
                      : fight.details.WinnerWhite == '1' ? fight.red
                      : null;
              break;
          }
      }

      return looser;
  }

  /**
   * Update: Used to get list of all participants for all types of categories
   * Used in circle and WKB draw (total points are not taken intoconsideration)
   *
   * TODO: optymize data passed forom server (if participant is repeated in few fights do not pass all his data again)
   */
  getFightsParticipants(fights) {
    let addParticipantIfNotPresent = (participant, arrayToAddTo, isVictory, points) => {
        let isPresent = false;

        if (participant) {
            let presentParticipant = arrayToAddTo.filter(p => p.FIO == participant.FIO);

            isPresent = presentParticipant && presentParticipant.length > 0

            if (isPresent) {
                presentParticipant = presentParticipant[0]
            } else {
                // presentParticipant = JSON.parse(JSON.stringify(participant))
                presentParticipant = participant;
                arrayToAddTo.push(presentParticipant)
                presentParticipant.totalPoints = 0;
            }

            if (isVictory) {
                presentParticipant.totalPoints += +points;
            }
        }

        return arrayToAddTo;
    }

    let addParticipantIfNotPresentByBlocks = (participant, arrayToAddTo, isVictory, points, block) => {
        if (participant) {
            if (block > 0) {
                if (arrayToAddTo) {
                    if (typeof arrayToAddTo[block - 1] == "undefined") {
                        arrayToAddTo[block - 1] = []
                    }

                    arrayToAddTo[block - 1] = addParticipantIfNotPresent(participant, arrayToAddTo[block - 1], isVictory, points)
                }
            }
        }

        return arrayToAddTo;
    }

    return fights.reduce((participants, fight) => {
        participants = addParticipantIfNotPresentByBlocks(fight.red, participants, fight.details.WinnerRed == "1", fight.details.pointsRed, fight.details.BlockNum)
        participants = addParticipantIfNotPresentByBlocks(fight.white, participants, fight.details.WinnerWhite == "1", fight.details.pointsWhite, fight.details.BlockNum)

        return participants
    }, [])
}

/** Used in circle draw */
getPoints(fighter1, fighter2, fights) {
    let points = 0;

    let getFightByParticipants = (p1, p2) => {
        // Null here why??
        let fight = fights.filter((fight) => fight?.red?.FIO == p1.FIO && fight?.white?.FIO == p2.FIO);

        fight = fight && fight.length > 0 ? fight[0] : null

        return fight;
    }

    let fight = getFightByParticipants(fighter1, fighter2)

    if (fight) {
        points = fight.details.WinnerRed == "1" ? fight.details.pointsRed : 0;
    } else {
      fight = getFightByParticipants(fighter2, fighter1)

      if (fight) {
          points = fight.details.WinnerWhite == "1" ? fight.details.pointsWhite : 0;
      }
    }

    if (!this.fightAlreadyHadPlace(fight) || this.areAllFightsFinished(fights) && points == 0) {
      return ''
    }

    return points;
}

areAllFightsFinished(fights) {
    let notFinished = fights.filter(f => f.details.DuelIsPlace == "0")

    let areNotFinished = notFinished && notFinished.length > 0

    return !areNotFinished;
}

// Not Used - not correct
calculatePlacesFromTotalPoints(participants) {
  // if (participants.length == 1) {
      participants = participants
        .map(
            participantsBlock => participantsBlock &&
                participantsBlock
                    .map(p => JSON.parse(JSON.stringify(p)))
                    .sort((p1, p2) => {
                        // if p1 > p2 - sort p2 before p1
                        let pointsDiff = p2.totalPoints - p1.totalPoints;
                        let p2IsWinner = pointsDiff > 0;

                        if (pointsDiff == 0) {
                            p2IsWinner = p2.Weight < p1.Weight;
                        }

                        return p2IsWinner;
                    })
                    // .filter((p, i) => i < 4)
                    .map((p, i) => {
                          p.place = i + 1;
                          return p
                    })
        )
  // } else {

  // }

    return participants
}

}
