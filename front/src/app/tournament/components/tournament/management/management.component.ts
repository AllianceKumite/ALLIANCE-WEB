import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { TournamentService } from '../../../services/tournament.service'
import { ConfirmService } from './../../../services/confirm.service';
import { TranslateService } from '@ngx-translate/core';
import { PopoutService } from '../../../services/popout.service';
import { faLessThanEqual } from '@fortawesome/free-solid-svg-icons';
import { HomeService } from 'src/app/shared/services/home.service';
import { environment } from '../../../../../environments/environment';
import { KataGroup, Kata } from '../../../models/katagroup.model'
import { SelectedkataService } from '../../../services/selectedkata.service';
import { OrderService } from 'src/app/tournament/services/order.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-manage-tournament',
    templateUrl: './management.component.html',
    styleUrls: ['./management.component.css']
})
export class ManagementComponent implements OnInit {
    @ViewChild('timeManageSelector') timeManageSelector: NgSelectComponent;

    champType;
    tatamiType: number;

    tatamiCount;

    tatamis = [];
    subtimes;
    categories;

    filter = {
        title: null,
        tatami: null,
        time: null,
        category: null
    };

    fights;
    fightsMap;
    currentFight;
    selected = [];
    countFight: number;

    katas: Kata[] = [];
    kataGroups: KataGroup[] = [];

    currentFightWndConfig: any;

    ALL_FIGHTS = -1;

    SELECTABLE = false;

    tatamiSubtimes = {
    }

    typeOlimp = environment.typeOlimp;
    typeCircle = environment.typeCircle;
    typeKata = environment.typeKata;
    typeWKB = environment.typeWKB;

    videofile;
    readonly logosDir: string = `${environment.logosDir}`;

    count = 0;
    clickEventsubscription: Subscription;

    constructor(
        private activeRoute: ActivatedRoute,
        private tournamentService: TournamentService,
        private сonfirmService: ConfirmService,
        private sanitizer: DomSanitizer,
        private translateService: TranslateService,
        private popoutService: PopoutService,
        private homeService: HomeService,
        private selectedkataService: SelectedkataService,
        private orderService: OrderService,

    ) { }

    subscriptions = []

    async ngOnInit() {
        this.clickEventsubscription = this.orderService.count.subscribe((count) => this.log(count));
        window.scroll(0, 0);

        this.activeRoute.parent.params.subscribe(params => {
            this.filter.title = params["name"]

            this.tournamentService.getChampType(this.filter.title).subscribe(response => {
                this.champType = response["type"];

                this.loadFilterControls();
            });
        });

        this.homeService._champInfo.subscribe((champInfo) => {
            let tournament = champInfo[1];
            this.tatamiType = tournament ? +tournament['typeTatami'] : null;
        });


        let s = this.сonfirmService.listenForFightWinnerSet(
            (msg: string) => {
                if (this.isWkbFight(this.currentFight) || this.isKankuFight(this.currentFight)) {
                    // TODO: implement some clever algorithm here
                    // (do not refresh on every wkb fight - but only if last in level?)
                    this.loadFights()
                } else {
                    this.unhighLightCurrentFight()
                    this.markWinnerAfterFight();
                    this.promoteWinnerToNextLevel();
                    this.promoteLooserToNextLevel();
                }

                this.setCurrentFight(this.сonfirmService.currentFight)
            }
        );

        let s2 = this.сonfirmService.getAndListenCurrentFightUpdate(update => {
            update.marks = { ...this.currentFightWndConfig?.marks, ...update?.marks }
            this.currentFightWndConfig = { ...this.currentFightWndConfig, ...update }
        })

        this.subscriptions.push(s, s2)

        this.сonfirmService.sendCurrentFightUpdate({
            champType: this.champType,
            title: this.filter.title,
            modalName: 'FIGHT_DETAIL'
        })
        this.getVideoName();
        this.loadKata();
        this.loadLevelKata();
    }

    private log(data: number): void {
        this.count = data;
    }

    getVideoName() {
        let lng = localStorage.getItem('lng');
        if (lng.toUpperCase() == "UA") {
            this.videofile = "https://www.youtube.com/watch?v=3px5MDgDLqU"
        }
        if (lng.toUpperCase() == "RU") {
            this.videofile = "https://www.youtube.com/watch?v=3px5MDgDLqU"
        }
        if (lng.toUpperCase() == "EN") {
            this.videofile = "https://www.youtube.com/watch?v=3px5MDgDLqU"
        }

    }

    getEstimatedTime() {
        const result = this.fights?.reduce((acc, currItem) => {
            if (Number(currItem.details.DuelIsPlace) == 0) {
                if (Number(currItem.details.CategoryType) < 2) { // Это kumite
                    acc += Number(currItem.details?.TimeFDuel1) + Number(currItem.details?.TimeFDuel2) + Number(currItem.details?.TimeFDuel3) + 30
                }
                else if (Number(currItem.details.CategoryType) == 2) { // Это ката WKO
                    acc += 210
                }
                else if (Number(currItem.details.CategoryType) == 3) { // Это ката WKB/KAN
                    acc += 100
                }
            }
            return acc;
        }, 0);
        return `${Math.trunc(result / 3600)}h ${Math.trunc((result - Math.trunc(result / 3600) * 3600) / 60)}min`
    }

    ngOnDestroy() {
        this.subscriptions.forEach(x => {
            if (!x.closed) {
                x.unsubscribe();
            }
        });
    }

    setCurrentFight(fight) {
        this.currentFight = fight;

        this.сonfirmService.sendCurrentFightUpdate({
            fight: this.currentFight,
            marks: {
                aka: { ippon: false, vazari: false, ch1: false, ch2: false, genten: false, sikaku: false },
                shiro: { ippon: false, vazari: false, ch1: false, ch2: false, genten: false, sikaku: false },
            },
            numRound: 0
        })

        this.highLightCurrentFight()
        this.selectCurrentFight()
        // console.log(this.currentFight);

        if (this.currentFight?.details?.Level && this.currentFight?.details?.CategoryType == 2) {
            switch (Number(this.currentFight?.details?.Level)) {
                case 1:
                    this.currentFight.red.lvl1 = -1;
                    this.currentFight.white.lvl1 = -1;
                    break;
                case 2:
                    this.currentFight.red.lvl12 = -1;
                    this.currentFight.white.lvl2 = -1;
                    break;
                case 3:
                    this.currentFight.red.lvl3 = -1;
                    this.currentFight.white.lvl3 = -1;
                case 4:
                    this.currentFight.red.lvl4 = -1;
                    this.currentFight.white.lvl4 = -1;
                    break;
                case 5:
                    this.currentFight.red.lvl5 = -1;
                    this.currentFight.white.lvl5 = -1;
                    break;
                case 6:
                    this.currentFight.red.lvl6 = -1;
                    this.currentFight.white.lvl6 = -1;
                    break;
                case 7:
                    this.currentFight.red.lvl7 = -1;
                    this.currentFight.white.lvl7 = -1;
                    break;
                case 8:
                    this.currentFight.red.lvl8 = -1;
                    this.currentFight.white.lvl8 = -1;
                    break;
                case 12:
                    this.currentFight.red.lvl12 = -1;
                    this.currentFight.white.lvl12 = -1;
                    break;
            }
        }
    }

    updateWkbPointsAfterFight(fight) {
        // currentFightInTheList = currentFightInTheList[0]
        if (typeof this.сonfirmService.points !== "undefined"
            && this.сonfirmService.points !== null
            && typeof this.сonfirmService.points.avg !== "undefined"
        ) {
            fight.details.Avg = this.сonfirmService.points.avg;
        }
    }

    updateWinnerMarkAfterFight(fight) {
        fight.details.DuelIsPlace = "1"

        if (this.сonfirmService.previousFightWinner == "aka") {
            fight.details.WinnerRed = "1"
        } else {
            fight.details.WinnerWhite = "1"
        }
    }

    updateCircularPointsAfterFight(fight) {
        if (fight.details.CategoryType == this.typeCircle) {
            if (fight.details.WinnerRed == "1") {
                fight.details.pointsRed = this.сonfirmService.points + ".0"
                fight.red.CountBall = '' + ((+fight.red.CountBall) + (this.сonfirmService.points)) + ".0"

                if (this.сonfirmService.points == 3) {
                    fight.details.Vaz1R = '1'
                } if (this.сonfirmService.points == 4) {
                    fight.details.IpponR = '1'
                }

                this.fights.forEach(f => {
                    if (f.red.athId == fight.red.athId) {
                        f.red.CountBall = fight.red.CountBall

                    } else if (f.white.athId == fight.red.athId) {
                        f.white.CountBall = fight.red.CountBall
                    }
                })
            } else if (fight.details.WinnerWhite == "1") {
                fight.details.pointsWhite = this.сonfirmService.points + ".0"
                fight.white.CountBall = '' + ((+fight.white.CountBall) + (this.сonfirmService.points)) + ".0"

                if (this.сonfirmService.points == 3) {
                    fight.details.Vaz1W = '1'
                } if (this.сonfirmService.points == 4) {
                    fight.details.IpponW = '1'
                }

                this.fights.forEach(f => {
                    if (f.red.athId == fight.white.athId) {
                        f.red.CountBall = fight.white.CountBall
                    } else if (f.white.athId == fight.white.athId) {
                        f.white.CountBall = fight.white.CountBall
                    }
                })
            }
        }
    }

    markWinnerAfterFight() {
        if (this.fights && this.currentFight && this.currentFight.details) {
            // let currentFightInTheList = this.fights.filter(f => f.details.ownId == this.currentFight.details.ownId)
            let currentFightInTheList = this.fightsMap.get(this.currentFight.details.ownId)

            if (typeof currentFightInTheList != 'undefined' && currentFightInTheList != null) {
                this.updateWkbPointsAfterFight(currentFightInTheList)
                this.updateWinnerMarkAfterFight(currentFightInTheList)
                this.updateCircularPointsAfterFight(currentFightInTheList)
            }
        }
    }

    promoteLooserToNextLevel() {
        if (this.fights && this?.currentFight?.details?.Level == 7) {
            let thirdPlaceFight = this.fights.filter(f => f.details.Level == 8 && this?.currentFight?.details?.CategoryId == f.details?.CategoryId)
            thirdPlaceFight = thirdPlaceFight.length > 0 ? thirdPlaceFight[0] : null;

            if (thirdPlaceFight) {
                let semifinals = this.fights.filter(f => f.details.Level == 7 && this?.currentFight?.details?.CategoryId == f.details?.CategoryId)
                let currentFightPositionInSemifinalsList = semifinals.reduce((acum, f, i) => acum + (f.details.ownId == this.currentFight.details.ownId ? i : 0), 0)

                if (this.сonfirmService.previousFightWinner == "aka") {
                    if (currentFightPositionInSemifinalsList == 0 && (!thirdPlaceFight.red.athId || thirdPlaceFight.red.athId < 0)) {
                        thirdPlaceFight.red = this.currentFight.white
                    } else {
                        thirdPlaceFight.white = this.currentFight.white
                    }
                } else {
                    if (currentFightPositionInSemifinalsList == 0 && (!thirdPlaceFight.red.athId || thirdPlaceFight.red.athId < 0)) {
                        thirdPlaceFight.red = this.currentFight.red
                    } else {
                        thirdPlaceFight.white = this.currentFight.red
                    }
                }
            }
        }
    }

    getPreviousLevel(level) {
        return level = 12 ? 7 : level - 1
    }

    // Olympic
    promoteWinnerToNextLevel() {
        if (this.fights) {
            let nextFight = this.fights.filter(f => f.details.NumDuel == this.currentFight.details.NextDuel)
            nextFight = nextFight.length > 0 ? nextFight[0] : null;

            if (nextFight) {
                let currentFigthLevel = this.currentFight.details.Level;
                let currentLevelPairFights = this.fights.filter(f => f.details.Level == currentFigthLevel && f.details.NextDuel == this.currentFight.details.NextDuel)
                let currentFightPositionInCurrentLevelFightsList = currentLevelPairFights.reduce((acum, f, i) => acum + (f.details.ownId == this.currentFight.details.ownId ? i : 0), 0)


                if (this.сonfirmService.previousFightWinner == "aka") {
                    if (currentFightPositionInCurrentLevelFightsList == 0 && (!nextFight.red.athId || nextFight.red.athId < 0)) {
                        nextFight.red = this.currentFight.red
                    } else {
                        nextFight.white = this.currentFight.red
                    }
                } else {
                    if (currentFightPositionInCurrentLevelFightsList == 0 && (!nextFight.red.athId || nextFight.red.athId < 0)) {
                        nextFight.red = this.currentFight.white
                    } else {
                        nextFight.white = this.currentFight.white
                    }
                }
            }
        }
    }

    checkAndDownshiftIfApplicable(promotedToFight, canceledFight, key, otherKey, isWinner) {
        if (promotedToFight && (promotedToFight[key].athId == canceledFight[key].athId ||
            promotedToFight[key].athId == canceledFight[otherKey].athId)
        ) {
            let sufix = isWinner ? canceledFight.details.NumDuel : -canceledFight.details.NumDuel;
            promotedToFight[key] = { FIO: sufix };
        }
    }

    // For olympic
    checkAndDownshiftWinnerIfApplicable(promotedToFight, canceledFight, key, otherKey) {
        this.checkAndDownshiftIfApplicable(promotedToFight, canceledFight, key, otherKey, true)
    }

    checkAndDownshiftLooserIfApplicable(promotedToFight, canceledFight, key, otherKey) {
        this.checkAndDownshiftIfApplicable(promotedToFight, canceledFight, key, otherKey, false)
    }


    downshiftWinnersAfterCancelOlympic(fight) {
        if (fight.details.CategoryType == this.typeOlimp || fight.details.CategoryType == this.typeKata) {
            let promotedToFight = this.fights.filter(f => f.details.NumDuel == fight.details.NextDuel)
            promotedToFight = promotedToFight.length > 0 ? promotedToFight[0] : null;

            this.checkAndDownshiftWinnerIfApplicable(promotedToFight, fight, 'red', 'white')
            this.checkAndDownshiftWinnerIfApplicable(promotedToFight, fight, 'white', 'red')
        }
    }


    downshiftLoosersAfterCancelOlympic(fight) {
        if ((fight?.details?.CategoryType == this.typeOlimp || fight?.details?.CategoryType == this.typeKata) && fight?.details?.Level == 7) {
            let promotedToFight = this.fights.filter(f => f.details.Level == 8 && fight?.details?.CategoryId == f.details?.CategoryId)
            promotedToFight = promotedToFight.length > 0 ? promotedToFight[0] : null;

            this.checkAndDownshiftLooserIfApplicable(promotedToFight, fight, 'red', 'white')
            this.checkAndDownshiftLooserIfApplicable(promotedToFight, fight, 'white', 'red')
        }
    }

    downshiftWinnersAfterCancelCircular(fight) {
        if (fight.details.CategoryType == this.typeCircle) {
            if (fight.details.WinnerRed == 1) {
                fight.red.CountBall = fight.red.CountBall - fight.details.pointsRed

                this.fights.forEach(f => {
                    if (f.red.athId == fight.red.athId) {
                        f.red.CountBall = fight.red.CountBall
                    } else if (f.white.athId == fight.red.athId) {
                        f.white.CountBall = fight.red.CountBall
                    }
                })

            } else if (fight.details.WinnerWhite == 1) {
                fight.white.CountBall = fight.white.CountBall - fight.details.pointsWhite

                this.fights.forEach(f => {
                    if (f.red.athId == fight.white.athId) {
                        f.red.CountBall = fight.white.CountBall
                    } else if (f.white.athId == fight.white.athId) {
                        f.white.CountBall = fight.white.CountBall
                    }
                })
            }

            // console.log(fight)
            fight.details.pointsRed = 0
            fight.details.pointsWhite = 0
            fight.details.Chu1R = 0
            fight.details.Chu2R = 0
            fight.details.Chu3R = 0
            fight.details.Vaz1R = 0
            fight.details.Vaz2R = 0
            fight.details.IpponR = 0
            fight.details.Chu1W = 0
            fight.details.Chu2W = 0
            fight.details.Chu3W = 0
            fight.details.Vaz1W = 0
            fight.details.Vaz2W = 0
            fight.details.IpponW = 0
        }
    }


    downshiftWinnersAndLoosersAfterCancel(successfullyCanceled) {
        if (this.fights) {
            successfullyCanceled.forEach(canceledFight => {
                this.downshiftWinnersAfterCancelOlympic(canceledFight)
                this.downshiftLoosersAfterCancelOlympic(canceledFight)
                this.downshiftWinnersAfterCancelCircular(canceledFight)
            })
        }
    }

    async loadFilterControls() {
        await this.loadTatamis();
        await this.loadSubtimes();
        this.setUpTatamiSubtimes();
        await this.loadCategories({ saveTime: true/*this.subtimes?.length == 1*/ });
        await this.reloadFights();
    }

    async loadTatamis() {
        var tatami = await this.tournamentService.getAllTatami(this.filter.title).toPromise();

        for (var i = 1; i <= tatami['tatamisCount']; i++) {
            this.tatamis[this.tatamis.length] = i;
        }

        if (this.filter.tatami == null && this.tatamis.length > 0) {
            this.filter.tatami = this.tatamis[0];
        }
    }

    async loadSubtimes() {
        this.subtimes = await this.tournamentService.getSubtimes(this.filter.title).toPromise();

        if (this.subtimes.length > 0) {
            this.filter.time = this.subtimes[0]
        }

        if (this.subtimes.length == 1) {

        }

    }

    async loadCategories(config?) {
        this.categories = await this.tournamentService.getCategoriesByFilter(this.filter, config).toPromise();
    }

    setUpTatamiSubtimes = () => {
        let defaultSubtime = this.subtimes && this.subtimes.length > 0 ? this.subtimes[0] : 0;

        this.tatamis.forEach(t => {
            this.tatamiSubtimes[t] = defaultSubtime;
        })
    };

    unhighLightCurrentFight() {
        let element = this.getCurrentFightElement();

        if (element) {
            element.setAttribute('class', 'online-tatami-next-fight')
        }
        //  else {
        //     let managedFights = document.getElementById('managed-fights');

        //     element = (managedFights?.firstElementChild?.firstElementChild?.firstElementChild?.firstElementChild?.nextElementSibling) as HTMLElement;
        // }
    }

    highLightCurrentFight() {
        let element = this.getCurrentFightElement();

        if (element) {
            element.setAttribute('class', 'online-tatami-next-fight manage-fight-list-item managed-fight')
        } else {
            let managedFights = document.getElementById('managed-fights');

            element = (managedFights?.firstElementChild?.firstElementChild?.firstElementChild?.firstElementChild?.nextElementSibling) as HTMLElement;
        }

        this.scrollToFight(element);
    }

    selectCurrentFight() {
        if (!this.SELECTABLE) {
            return
        }

        let currentFightInTheList = this.fights?.filter(f => f.details?.ownId == this.currentFight?.details?.ownId)

        if (currentFightInTheList && currentFightInTheList.length > 0) {
            currentFightInTheList = currentFightInTheList[0];

            // !! We need theese manipulation for angular to update screen.
            // !! Whithout it the fight becoms not always selected
            currentFightInTheList.selected = false;
            setTimeout(() => { currentFightInTheList.selected = true; }, 100)
        }

        this.deselectOtherFights(currentFightInTheList)
    }

    getCurrentFightElement() {
        let managedElement = null;

        if (this.isCurrentFight()) {
            let managedId = 'mng-' + this.currentFight.details.ownId;
            managedElement = document.getElementById(managedId);
        }

        return managedElement;
    }

    scrollToCurrentFight() {
        this.scrollToFight(null)
    }

    scrollToFight(fightElement) {
        fightElement = fightElement ? fightElement : this.getCurrentFightElement();

        if (fightElement) {
            fightElement.scrollIntoView(true);
        }
    }

    isCurrentFight() {
        return this.currentFight && this.currentFight.details;
    }

    async loadFights() {
        this.tournamentService.getFightsToManage(this.filter).subscribe(response => {

            this.fights = response;
            this.countFight = this.fights.length;
            this.fightsMap = new Map(this.fights.map(f => [f.details.ownId, f]));

            if (this.isCurrentFight()) {
                setTimeout(() => {
                    this.highLightCurrentFight()
                    this.selectCurrentFight()
                }, 100);
            }
        })
    }

    async loadKata() {
        this.tournamentService.getKata(this.filter).subscribe(response => {
            this.katas = Object.values(response);
            // console.log(this.katas);
        })
    }

    async loadLevelKata() {
        this.tournamentService.getLevelKata(this.filter).subscribe(response => {
            this.kataGroups = Object.values(response);
            // console.log(this.kataGroups);
        })
    }

    loadTatamiCurrentFight() {
        this.tournamentService.getTatamisCurrentFight({
            title: this.filter.title,
            tatami: this.filter.tatami,
            time: this.filter.time,
            category: this.filter.category
        }).subscribe(response => this.setCurrentFight(response));
    }

    async reloadFights() {
        await this.loadFights()
        this.loadTatamiCurrentFight()
    }

    async onTatamiChange() {
        this.filter.category = null;
        this.filter.time = this.tatamiSubtimes[this.filter.tatami]
        await this.loadCategories({ saveTime: true });

        // this.loadFights()
        this.reloadFights()
    }

    async doOnUdpadeLevel(level: number) {
        // console.log('doOnUdpadeLevel. LEVEL', level);
        // console.log('doOnUdpadeLevel. AKA', this.selectedkataService.athIdAka);
        // console.log('doOnUdpadeLevel. SHIRO', this.selectedkataService.athIdShiro);
        // setTimeout(() => {
        //     this.reloadFights()
        // }, 300);

        await this.reloadFights();

    }

    async onTimeChange() {
        this.filter.category = null;
        this.tatamiSubtimes[this.filter.tatami] = this.filter.time;
        await this.loadCategories({ saveTime: true });

        this.reloadFights()
    }

    onCategoryChange() {
        this.reloadFights()
    }

    // TODO: move to some common utils place and DRY
    isManageWithFlags(fight) {
        let manageWithFlags = false;

        if (fight && fight.details) {
            let categoryType = +fight.details.CategoryType;

            // this.loadKata();
            // this.loadLevelKata();


            // TODO: recheck - Так же такой вид окна управления поединков используется
            // для кате- горий с типом жеребьевки «КАТА WKB»,
            // если это поединки за 3-е и 1-е место.
            if (categoryType == 0 || categoryType == 2 // Olympic system
                || categoryType == 1  // Circle system
                // Kata WKB 3-place-fight or final
                || (categoryType == 3 && (fight.details.Level == 8 || fight.details.Level == 12))
            ) {
                manageWithFlags = true;
            }
        }

        return manageWithFlags;
    }


    isManageWithMarks(fight) {
        let manageWithMarks = fight && fight.details && !this.isManageWithFlags(fight)

        return manageWithMarks;
    }

    isWkbFight(fight) {
        return this.isManageWithMarks(fight)
    }

    isKankuFight(fight) {
        let isKankuFight = fight?.details?.CategoryType == this.typeCircle && fight?.details?.CategoryBlockCount > 1

        return isKankuFight
    }

    isKataFight(fight) {
        let isKataFight = fight?.details?.CategoryType == this.typeKata

        return isKataFight
    }

    getSelectedFights() {
        return this.fights ? this.fights.filter(f => f.selected == true) : []
    }

    async updateFightsAfterCancel(nextFight, fightsToCancel, notCanceled) {
        if (this.currentFight && this.currentFight.details && (nextFight?.details?.ownId != this.currentFight.details.ownId)) {
            this.unhighLightCurrentFight()
        }

        let successfullyCanceled = fightsToCancel == this.ALL_FIGHTS
            ? this.fights
            : fightsToCancel.filter(f => notCanceled.filter(fi => fi == f.details.ownId).length == 0)

        if (successfullyCanceled.length != 0) {
            if (this.isWkbFight(successfullyCanceled[0]) || this.isKankuFight(successfullyCanceled[0])) {
                // TODO: implement some clever algorithm here
                // (do not refresh on every wkb fight - but only if last in level?)
                await this.loadFights()
            } else {
                // if(this.isKataFight(successfullyCanceled[0])){
                if (this.isKataFight(successfullyCanceled[0])) { await this.loadFights() };
                this.downshiftWinnersAndLoosersAfterCancel(successfullyCanceled)
                this.unmarkWinnersAfterCancel(successfullyCanceled)
            }
        }

        // nextFight = this.fights.filter(f => f.details.ownId ==)
        let nextFightInTheList = this.fights?.filter(f => f.details?.ownId == nextFight?.details?.ownId)

        nextFightInTheList = nextFightInTheList?.length > 0 ? nextFightInTheList[0] : null

        this.setCurrentFight(nextFightInTheList)

        if (notCanceled.length > 0) {
            this.translateService.get('manage.notCanceled').subscribe(
                msg => { this.сonfirmService.alert(msg, () => { }) }
            )
        }
    }

    unmarkWinnersAfterCancel(successfullyCanceled) {
        // For all canceled fights - remove winner indicators
        if (this.fights) {
            successfullyCanceled.forEach(f => {
                f.details.DuelIsPlace = "0"
                f.details.WinnerRed = "0"
                f.details.WinnerWhite = "0"
            })
        }
    }

    getSelectedFightsToCancel() {
        return this.getSelectedFights().filter(this.eligibleToCancel)
    }

    isCancelButtonEnabled() {
        let fights = this.getSelectedFightsToCancel()

        return fights && fights.length > 0;
    }

    cancelFight = (fight) => {
        // console.log('cancelFight', Number(fight.details?.Level));

        this.cancelFights([fight]);
        if (fight.details?.KataGroup && Number(fight.details?.KataGroup) > 0) {
            // this.doOnUdpadeLevel(fight.details?.Level);
            switch (Number(fight.details.Level)) {
                case 1:
                    fight.red.level = -1;
                    fight.white.level = -1;
                    break;
                case 2:
                    fight.red.level = -1;
                    fight.white.level = -1;
                    break;
                case 3:
                    fight.red.level = -1;
                    fight.white.level = -1;
                    break;
                case 4:
                    fight.red.level = -1;
                    fight.white.level = -1;
                    break;
                case 5:
                    fight.red.level = -1;
                    fight.white.level = -1;
                    break;
                case 6:
                    fight.red.level = -1;
                    fight.white.level = -1;
                    break;
                case 7:
                    fight.red.level = -1;
                    fight.white.level = -1;
                    break;
                case 8:
                    fight.red.level = -1;
                    fight.white.level = -1;
                    break;
                case 12:
                    fight.red.level = -1;
                    fight.white.level = -1;
                    break;
            }
        }

    }

    cancelSelected() {
        let selectedFightsToCancel = this.getSelectedFightsToCancel();

        this.cancelFights(selectedFightsToCancel);
    }

    cancelFights(fights) {
        if (fights.length == 0) {
            return
        }

        let fightsDetails = fights
            .map(f => f.details.NumDuel + ": " + f.red.FIO + ' - ' + f.white.FIO)
            .join('<br />');

        this.translateService.get('manage.confirmCancelSelected', {
            fight: fightsDetails
        }).subscribe((confirmMessage: string) => {
            this.сonfirmService.confirm(
                this.sanitizer.bypassSecurityTrustHtml(confirmMessage),
                () => {
                    this.tournamentService.cancelFights({
                        title: this.filter.title,
                        fight: fights.map(f => f.details.ownId),
                        categoryFilter: this.filter.category,
                        tatami: this.filter.tatami,
                        time: this.filter.time
                    }).subscribe(response => {
                        this.updateFightsAfterCancel(
                            (<any>response).nextFight,
                            fights,
                            (<any>response).notCanceled
                        )

                    })
                },
                () => { /* this.declined()*/ }
            );
        })
    }

    cancelAll() {
        this.translateService.get('manage.confirmCancelAll').subscribe((confirmMessage: string) => {
            this.сonfirmService.confirm(
                this.sanitizer.bypassSecurityTrustHtml(confirmMessage),
                () => {
                    this.tournamentService.cancelFights({
                        title: this.filter.title,
                        fight: this.ALL_FIGHTS,
                        tatami: this.filter.tatami,
                        time: this.filter.time,
                        categoryFilter: this.filter.category
                    }).subscribe(response => {
                        this.updateFightsAfterCancel(
                            (<any>response).nextFight,
                            this.ALL_FIGHTS,
                            (<any>response).notCanceled
                        )
                    })
                },
                () => { /* this.declined()*/ }
            );
        });
    }

    getSelectedFightsToPostpone() {
        return this.getSelectedFights().filter(this.eligibleToPostpone)
    }

    isPostponeButtonEnabled() {
        let fights = this.getSelectedFightsToPostpone()

        return fights && fights.length > 0;
    }

    getSelectedFightsToUnpostpone() {
        return this.getSelectedFights().filter(this.eligibleToUnpostpone)
    }

    isUnpostponeButtonEnabled() {
        let fights = this.getSelectedFightsToUnpostpone()

        return fights && fights.length > 0;
    }

    isPostponeCategoryButtonEnabled() {
        return this.filter.category != null
            && this.fights.filter(f => f.details.DuelIsPlace == 0).length > 0
    }

    updateFightsAfterPostponeOrUnpostpone(postpone, nextFight, postponed, notPostponed) {
        if (this.currentFight && this.currentFight.details && (!nextFight || !nextFight.details || nextFight.details.ownId != this.currentFight.details.ownId)) {
            this.unhighLightCurrentFight()
        }

        if (nextFight && nextFight.details) {
            this.setCurrentFight(nextFight)
        } else {
            this.setCurrentFight(null)
        }

        let successfullyPostponed = postponed == this.ALL_FIGHTS ? this.fights :
            postponed.filter(
                f => notPostponed.filter(fi => fi == f.details.ownId).length == 0
            )

        // For all canceled fights - remove winner indicators
        if (this.fights) {
            successfullyPostponed.forEach(f => {
                if (postpone && f.details.DuelIsPlace == "0" ||
                    !postpone && f.details.DuelIsPlace == "1" && f.details.WinnerRed == "0" && f.details.WinnerWhite == "0") {
                    f.details.DuelIsPlace = postpone ? "1" : "0"
                    f.details.WinnerRed = "0"
                    f.details.WinnerWhite = "0"
                }
            })
        }

        if (notPostponed.length > 0) {
            alert('Not postponed/unpostponed ' + notPostponed.length + " fights.")
        }
    }

    updateFightsAfterPostpone(next, postponed, notPostponed) {
        this.updateFightsAfterPostponeOrUnpostpone(true, next, postponed, notPostponed)
    }

    updateFightsAfterUnpostpone(next, unpostponed, notUnpostponed) {
        this.updateFightsAfterPostponeOrUnpostpone(false, next, unpostponed, notUnpostponed)
    }

    postponeFight = (fight) => {
        this.postponeFights([fight])
    }

    postponeSelected() {
        let selectedFightsToPostpone = this.getSelectedFightsToPostpone();

        this.postponeFights(selectedFightsToPostpone)
    }

    postponeFights(fights) {
        if (fights?.length == 0) {
            return
        }

        let fightsDetails = fights
            .map(f => f.details.NumDuel + ": " + f.red.FIO + ' - ' + f.white.FIO)
            .join('<br />');

        this.translateService.get('manage.confirmPostponeSelected', {
            fight: fightsDetails
        }).subscribe((confirmMessage: string) => {
            this.сonfirmService.confirm(
                this.sanitizer.bypassSecurityTrustHtml(confirmMessage),
                () => {
                    this.tournamentService.postponeFights({
                        title: this.filter.title,
                        fight: fights.map(f => f.details.ownId),
                        categoryFilter: this.filter.category,
                        time: this.filter.time,
                        tatami: this.filter.tatami
                    }).subscribe(response => {
                        this.updateFightsAfterPostpone((<any>response).nextFight, fights, (<any>response).notCanceled)
                    })
                },
                () => { /* this.declined()*/ }
            );
        })
    }

    postponeCategory() {
        let category = this.filter.category;

        this.translateService.get('manage.confirmPostponeCategory').subscribe((confirmMessage: string) => {
            this.сonfirmService.confirm(
                this.sanitizer.bypassSecurityTrustHtml(confirmMessage),
                () => {
                    this.tournamentService.postponeFights({
                        title: this.filter.title,
                        category: category,
                        categoryFilter: this.filter.category,
                        time: this.filter.time,
                        tatami: this.filter.tatami
                    }).subscribe(response => {
                        this.updateFightsAfterPostpone((<any>response).nextFight, this.ALL_FIGHTS, (<any>response).notCanceled)
                    })
                },
                () => { /* this.declined()*/ }
            );
        });
    }

    unpostponeFight = (fight) => {
        this.unpostponeFights([fight])
    }

    unpostponeSelected() {
        let selectedFightsToUnpostpone = this.getSelectedFightsToUnpostpone();

        this.unpostponeFights(selectedFightsToUnpostpone)
    }

    unpostponeFights(fights) {
        if (fights.length == 0) {
            return
        }

        let fightsDetails = fights
            .map(f => f.details.NumDuel + ": " + f.red.FIO + ' - ' + f.white.FIO)
            .join('<br />');

        this.translateService.get('manage.confirmUnpostponeSelected', {
            fight: fightsDetails
        }).subscribe((confirmMessage: string) => {
            this.сonfirmService.confirm(
                this.sanitizer.bypassSecurityTrustHtml(confirmMessage),
                () => {
                    this.tournamentService.unpostponeFights({
                        title: this.filter.title,
                        fight: fights.map(f => f.details.ownId),
                        categoryFilter: this.filter.category,
                        time: this.filter.time,
                        tatami: this.filter.tatami
                    }).subscribe(response => {
                        this.updateFightsAfterUnpostpone((<any>response).nextFight, fights, (<any>response).notCanceled)
                    })
                },
                () => { /* this.declined()*/ }
            );
        })
    }

    unpostponeAll() {
        this.translateService.get('manage.confirmUnpostponeAll').subscribe((confirmMessage: string) => {
            this.сonfirmService.confirm(
                this.sanitizer.bypassSecurityTrustHtml(confirmMessage),
                () => {
                    this.tournamentService.unpostponeFights({
                        title: this.filter.title,
                        tatami: this.filter.tatami,
                        fight: this.ALL_FIGHTS,
                        time: this.filter.time,
                        categoryFilter: this.filter.category
                    }).subscribe(response => {
                        this.updateFightsAfterUnpostpone((<any>response).nextFight, this.ALL_FIGHTS, (<any>response).notCanceled)
                    })
                },
                () => { /* this.declined()*/ }
            );
        })
    }

    deselectOtherFights = (fight) => {
        if (!this.SELECTABLE) {
            return
        }

        this.fights?.forEach(f => {
            if (fight?.details?.ownId != f?.details?.ownId) {
                f.selected = false
            }
        })
    }

    openCurrentFightWindow = () => {
        // https://blog.logrocket.com/inject-dynamic-content-angular-components-with-portals/
        // https://stackblitz.com/edit/portal-simple?file=src%2Fapp%2Fapp.component.ts
        // https://medium.com/@saranya.thangaraj/open-angular-component-in-a-new-tab-without-bootstrapping-the-whole-app-again-e329af460e92
        // console.log("Data before open popout", this.currentFightWndConfig)
        // console.log(this.currentFight);

        this.popoutService.openPopoutModal(this.currentFightWndConfig)
    }

    eligibleToCancel = fight => fight?.details?.DuelIsPlace == 1 && (fight.details.WinnerRed == 1 || fight.details.WinnerWhite == 1)
    eligibleToPostpone = (fight) => fight.details.DuelIsPlace == 0
    eligibleToUnpostpone = (fight) => fight.details.DuelIsPlace == 1 && fight.details.WinnerRed == 0 && fight.details.WinnerWhite == 0
}
