import { InjectionToken } from '@angular/core';

// TODO: put it in correct place.
export interface PopoutData {
    fight?: any;
    time?: any;
    champType?: string,
    title?: string,
    numRound?: any,
    titleString?: string,
    marks: any,
    kataAka: any,
    kataShiro: any
}

export const POPOUT_MODAL_DATA = new InjectionToken<PopoutData>('POPOUT_MODAL_DATA');

export enum PopoutModalName {
    'fightDetail' = 'FIGHT_DETAIL'
}

export let POPOUT_MODALS = {
    FIGHT_DETAIL: {}
}
