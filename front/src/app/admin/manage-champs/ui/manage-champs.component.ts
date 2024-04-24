import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ManageChampsService } from '../service/manage-champs.service';
import { Champ } from '../models/champ';

@Component({
    selector: 'manage-champs',
    templateUrl: './manage-champs.component.html',
    styleUrls: ['./manage-champs.component.css']
})
export class ManageChampsComponent implements OnInit {
  champName: string;
  champs$: Observable<any>;

  constructor(private manageChampsService: ManageChampsService,
              private router: Router
  ) { }

  ngOnInit(): void {
      this.champs$ = this.manageChampsService.getAllChamps()

      this.manageChampsService.init();

      this.manageChampsService.getModyfyChamps().subscribe(modifyAction => {
        if (modifyAction.action === "add") {
          // alert(modifyAction.name + " successfully created.")
          this.router.navigate(['/champ', this.champName])
        } else if (modifyAction.action === "remove") {
          // champ successfully removed
        }
      })
      // TODO: error handling
  }

  onCreateChamp() {
    try {
        this.manageChampsService.createChamp(this.champName)
    } catch(e) {
    }
  }

  // TODO: needs to be fixed on server
  onDeleteChamp(champName: string): void {
 
    let confirmMsg = 'Подтвердите удаление турнира ' + champName + '. Турнир будет удален без возможности восстановления!!!';
    const confirmed = confirm(confirmMsg);

    if (confirmed) {
      this.manageChampsService.deleteChamp(champName)
      this.champs$ = this.manageChampsService.getAllChamps()
    }
    // window.location.reload();
  }


  onManageChamp(champName: string) {
    this.router.navigate(['champ/' + champName + '/manage']);
  }

  // TODO: DRY
  isManageable(champ: Champ) {
    let fromTime = Date.parse(champ.dateFrom + "T09:00:00")
    let toTime = Date.parse(champ.dateTo + "T23:59:59")
    let now = Date.now();

    return (now >= fromTime) && (now <= toTime);
  }

  goToChamp(event) {
    const champName = (event.target.textContent as string).split(' ').join('_');
    this.router.navigate(['champ/' + champName]);
  }
}
