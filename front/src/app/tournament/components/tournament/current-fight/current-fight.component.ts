import { Component, Inject, Input } from '@angular/core';
import {POPOUT_MODAL_DATA, POPOUT_MODALS, PopoutData, PopoutModalName} from '../../../popout/popout.data';
import { ConfirmService } from './../../../services/confirm.service';

@Component({
  selector: 'current-fight',
  templateUrl: './current-fight.component.html',
  styleUrls: ['./current-fight.component.css']
})
export class CurrentFightComponent   {
    fight: any;
    time: any;
    champType: string;
    title: string;
    numRound;
    marks: any;

    constructor(
      @Inject(POPOUT_MODAL_DATA) public data: PopoutData,
        private сonfirmService: ConfirmService
    ) {
        this.fight = this.data.fight;
        this.time = this.data.time;
        this.champType = this.data.champType;
        this.title = this.data.title;
        this.numRound = this.data?.numRound;
        this.marks = this.data?.marks;
    }


    ngOnInit() {
        // console.log("==============================================")
        this.сonfirmService.getAndListenCurrentFightUpdate(updated => {
        //   console.log("==============================================")
        //   console.log("updating data in window", updated)

            if (typeof updated?.fight != "undefined" && updated?.fight != null) {
                this.fight = updated.fight;
            }


            if (typeof updated?.time != "undefined" && updated?.time != null) {
                this.time = updated.time
            }

            if (typeof updated?.numRound != "undefined" && updated?.numRound != null) {
                this.numRound = updated.numRound
            }

            if (updated?.marks?.aka) {
                if (!this.marks) {
                    this.marks = {}
                }

                this.marks.aka = updated?.marks?.aka;
            }

            if (updated?.marks?.shiro) {
                if (!this.marks) {
                    this.marks = {}
                }

                this.marks.shiro = updated?.marks?.shiro;
            }
        })
    }
}
