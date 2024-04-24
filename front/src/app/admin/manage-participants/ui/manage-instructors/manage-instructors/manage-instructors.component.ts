import { Component, Input, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ParticipantsService } from '../../../service/participants.service';
import { Branch } from '../../../model/athlete';
import { Role } from '../../../../../shared/types/Role';

@Component({
  selector: 'app-manage-instructors',
  templateUrl: './manage-instructors.component.html',
  styleUrls: ['./manage-instructors.component.css'],
})
export class ManageInstructorsComponent implements OnInit {
  @Input() isSuperAdmin: boolean;
  @Input() champName: string;
  @Input() coachId: number;

  isChamp: boolean;

  branches$: Observable<Branch[]>;
  // branches : Branch[];

  constructor(private participantsService: ParticipantsService) {}

  ngOnInit() {
    this.branches$ = this.participantsService.getCoaches();

    this.participantsService.getAllCochesOrByBranch(
      this.isSuperAdmin,
      this.coachId,
      this.champName
    );
    this.isChamp = this.champName != '' && this.champName != null;
  }

  async blockCoach(branch: Branch) {
    branch.blocked = !branch.blocked;

    try {
      await this.participantsService.blockCoach(branch);
    } catch (e) {
      console.error(e);
    }
  }

  async changeTmanagerRole(branch: Branch) {
    branch.isTmanager = !branch.isTmanager;

    try {
      await this.participantsService.changeTmanagerRole({
        ...branch,
        title: this.champName,
      });
    } catch (e) {
      console.error(e);
    }
  }
}
