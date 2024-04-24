import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
    private _needsConfirmation = new BehaviorSubject<string>(null)
    private needsConfirmation$ = this._needsConfirmation.asObservable();

    private _resetTimer = new BehaviorSubject<string>(null)
    private resetTimer$ = this._resetTimer.asObservable();

    private _pauseTimer = new BehaviorSubject<string>(null)
    private pauseTimer$ = this._pauseTimer.asObservable();

    private _stopTimer = new BehaviorSubject<string>(null)
    private stopTimer$ = this._stopTimer.asObservable();

    private _winner = new BehaviorSubject<string>(null)
    private winner$ = this._winner.asObservable();

    private _buttons = new BehaviorSubject<string>(null)
    private buttons$ = this._buttons.asObservable();

    private _winnerBtns = new BehaviorSubject<string>(null)
    private winnerBtns$ = this._winnerBtns.asObservable();

    private _currentFight = new BehaviorSubject<string>(null)
    private currentFight$ = this._currentFight.asObservable();


    message;
    onConfirm;
    onDecline;
    alertMode: boolean;

    currentFight;
    previousFightWinner;
    points;

    winnerBtnEnabledAndActivated;

    listenForConfirmationNeeded(callback) {
        return  this.needsConfirmation$.subscribe(callback)
    }

    confirm(message: any, onConfirm, onDecline, shift?) {
        this.message = message;

        this.onConfirm = onConfirm;
        this.onDecline = onDecline;
        this.alertMode = false;
        this._needsConfirmation.next(shift);
    }

    alert(message: any, onConfirm, shift?) {
        this.message = message;

        this.onConfirm = onConfirm;
        this.alertMode = true;
        this._needsConfirmation.next(shift);
    }

    listenForResetTimer(callback) {
        return this.resetTimer$.subscribe(callback)
    }

    resetTimer(resetTimer: string) {
        this._resetTimer.next(resetTimer);
    }

    listenForPauseTimer(callback) {
        return  this.pauseTimer$.subscribe(callback)
    }

    pauseTimer(pauseTimer: string) {
        this._pauseTimer.next(pauseTimer);
    }

    listenForStopTimer(callback) {
        return this.stopTimer$.subscribe(callback)
    }

    stopTimer(stopTimer: string) {
        this._stopTimer.next(stopTimer);
    }

    listenForFightWinnerSet(callback) {
        return this.winner$.subscribe(callback)
    }

    updateFightsAfterWinnerSet(currentFight, previousFightWinner, points) {
      this.currentFight = currentFight;
      this.previousFightWinner = previousFightWinner;
      this.points = points;
      this._winner.next('asd');
    }

    listenForResetButtons(callback) {
        return this.buttons$.subscribe(callback)
    }

    resetButtons() {
      this._buttons.next('asdss');
    }

    listenForWinnerButtons(callback) {
        return  this.winnerBtns$.subscribe(callback)
    }

    // setWinnerButtons
    enableAndActivateWinnerButtons(winnerBtnEnabledAndActivated) {
        this.winnerBtnEnabledAndActivated = winnerBtnEnabledAndActivated;
        this._winnerBtns.next('asd');
    }

    getAndListenCurrentFightUpdate(callback) { //the receiver component calls this function
        return this.currentFight$.subscribe(callback); //it returns as an observable to which the receiver funtion will subscribe
    }

    sendCurrentFightUpdate(newData: any) { //the component that wants to update something, calls this fn
        // console.log("sendCurrentFightUpdate ", newData)
        this._currentFight.next(newData); //next() will feed the value in Subject
    }
}
