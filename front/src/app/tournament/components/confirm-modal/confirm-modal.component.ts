import { Component, OnInit, Input, TemplateRef, ViewChild, ElementRef, HostBinding } from '@angular/core';
import { BsModalService, BsModalRef, ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { ConfirmService } from './../../services/confirm.service';

// TODO: use cached responses.
// https://gist.github.com/staltz/868e7e9bc2a7b8c1f754
// https://medium.com/kanade-dev/using-rxjs-services-in-angular-to-communicate-state-between-two-components-6b4d1f6ae351

@Component({
    selector: 'confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrls: ['./confirm-modal.component.css']
})
export class ConfirmModalComponent implements OnInit {
    @ViewChild('confirmModal') modalTemplate : TemplateRef<any>;
    modalRef?: BsModalRef;

    @Input()
    text: string = null;

    @Input()
    yesText: string = 'ok';

    @Input()
    noText: string = 'cancel';

    alertMode: boolean

    subscriptions = [];

    constructor(private сonfirmService: ConfirmService,
                private modalService: BsModalService) {}

    ngOnInit(): void {
        let s = this.сonfirmService.listenForConfirmationNeeded(
            (msg: string) => {
                this.alertMode = this.сonfirmService.alertMode

                this.show({shift: msg == "shift" ? true : false
            })}
        )

        this.subscriptions.push(s)
    }

    ngOnDestroy() {
        this.subscriptions.forEach(x => {
            if(!x.closed) {
                x.unsubscribe();
            }
        });
    }

    ngAfterViewInit() {
        // TODO: do it without jquery
        // $(".modal-body").on("shown.bs.modal", function() {
        //     $(this).find(".btn-primary").focus() // also tried wrapping in setTimeout
        // });
    };

    show(options?: any) {
        if (typeof this.modalTemplate != 'undefined') {
            let config:ModalOptions = options?.shift
                ? { class: "shiftRight" }
                : null

            this.modalRef = this.modalService.show(this.modalTemplate, config);
            this.text = this.сonfirmService.message;
        }
    }

    confirm(): void {
      this.modalRef?.hide();

      if (typeof this.сonfirmService.onConfirm == "function") {
          this.сonfirmService.onConfirm()
      }
    }

    decline(): void {
      this.modalRef?.hide();

      if (typeof this.сonfirmService.onDecline == "function") {
          this.сonfirmService.onDecline()
      }
    }
}
