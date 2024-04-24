import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'result-entity',
  templateUrl: './result-entity.component.html',
  styleUrls: ['./result-entity.component.css']
})
export class ResultEntityComponent implements OnInit {
  @Input()
  data;

  @Input()
  champType

  @Input()
  entityName

  readonly logosDir = `${environment.logosDir}`;

  nameOfChampionship: string;


  constructor(private activeRoute: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.data = this.prepare(this.data)
  }

  prepare(data) {
    let prepared: Array<any> = Object.values(data);

    // console.log(prepared[0].medals[2]);

    if (this.entityName == 'club-count') {
      // prepared = prepared.sort((entity1, entity2) => entity2.medals[1] - entity1.medals[1])
      prepared = prepared.sort(function (entity1, entity2){
        let result = entity2.medals[1] - entity1.medals[1];
        if (result == 0){
          result = entity2.medals[2] - entity1.medals[2];
          if (result == 0){
            result = entity2.medals[3] - entity1.medals[3];
          }
        }
        return result
      })
        .reduce((entityAtSinglePlace, entity, index) => {
          let sharedPlaceEntities = prepared.filter(filteredEntity => filteredEntity.medals[1] == entity.medals[1]);

          if (entityAtSinglePlace.length > 0
            && entityAtSinglePlace[entityAtSinglePlace.length - 1].entities
            && entityAtSinglePlace[entityAtSinglePlace.length - 1]?.entities.length > 0
            && entityAtSinglePlace[entityAtSinglePlace.length - 1].entities[0].medals[1] == entity.medals[1]) {
            // sharedPlaceClubs = [];
          } else {
            entityAtSinglePlace[entityAtSinglePlace.length] = {
              "entities": sharedPlaceEntities,
              "place": (index + 1) + (sharedPlaceEntities.length > 1 ? (" - " + (index + sharedPlaceEntities.length)) : "")
            }
          }

          return entityAtSinglePlace;
        }, []);
    }
    else {
      prepared = prepared.sort((entity1, entity2) => entity2.points - entity1.points)
        .reduce((entityAtSinglePlace, entity, index) => {
          let sharedPlaceEntities = prepared.filter(filteredEntity => filteredEntity.points == entity.points);

          if (entityAtSinglePlace.length > 0
            && entityAtSinglePlace[entityAtSinglePlace.length - 1].entities
            && entityAtSinglePlace[entityAtSinglePlace.length - 1]?.entities.length > 0
            && entityAtSinglePlace[entityAtSinglePlace.length - 1].entities[0].points == entity.points) {
            // sharedPlaceClubs = [];
          } else {
            entityAtSinglePlace[entityAtSinglePlace.length] = {
              "entities": sharedPlaceEntities,
              "place": (index + 1) + (sharedPlaceEntities.length > 1 ? (" - " + (index + sharedPlaceEntities.length)) : "")
            }
          }

          return entityAtSinglePlace;
        }, []);
    }
    if (prepared && prepared.length == 0) {
      prepared = null
    }

    return prepared;
  }
}
