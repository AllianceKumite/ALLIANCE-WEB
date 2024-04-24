/**
 * @author Ilya
 */
import { Component, OnInit } from '@angular/core';
import { Tournament } from './../../interfaces/tournaments';
import { BlogService } from './../../services/blog.service';
import { Router } from '@angular/router';
import { HomeService } from 'src/app/shared/services/home.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-blog',
    templateUrl: './blog.component.html',
    styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
    page = 1;
    pageFutur = 1;
    pageSize = 4;
    pageSizeFutur = 4;
    typeview: number = 1;
    organizations: any[] = [];
    readonly logosDir = `${environment.logosDir}`;

    tournaments: {
        future: {
            next: Tournament,
            following: Tournament[]
        },
        past: Tournament[]
    };

    customPreview: Tournament[];
    endRegistration;
    years =  new Array();
    selectedYear;

    constructor(
        private blogService: BlogService,
        public router: Router, 
        public homeService: HomeService)
    { }

    async ngOnInit() {
        let currYear = new Date().getFullYear();
        let start = currYear - 2;
        this.years.push('All');
        while(start <= currYear){
            this.years.push(start);
            start++;
        }

        this.selectedYear = currYear;
        this.homeService.getAllOrganization().subscribe((response) => {
            this.organizations = Object.values(response);
                
            this.blogService.getTournaments().subscribe(async (res: any) => {
                this.tournaments = await this.parse(res);
                // console.log(this.tournaments);
                
                this.onSelectYear();

            });
        });
    }

    onSelectYear(){
        this.customPreview = this.tournaments.past;       
        if(this.selectedYear && typeof this.selectedYear == 'number'){
            let srcValue = Number(this.selectedYear);
            this.customPreview = this.tournaments.past.filter( function(item){
                let dt = new Date();
                dt.setTime(item?.dateTo);
                let year = dt.getFullYear();
                return year == srcValue;
            })
        }
    }

    isTournamentPassed(tournament) {
        // return tournament.date + 24 * 60 * 60 * 1000 < Date.now();
        // return tournament.date + 24 * 60 * 60 * 1000 <= Date.now();
        return tournament.date + 24 * 60 * 60 * 1000 <= Date.now();
    }

    isTounamentFuture(tournament) {
        return !this.isTournamentPassed(tournament);
    }

    getFullDateSting(dateFrom, dateTo) {
        let df = new Date();
        let dt = new Date();

        df.setTime(dateFrom);
        dt.setTime(dateTo);

        if (df.getDay() === dt.getDay()) {
            return dt.toLocaleString(undefined, {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
            });
        } else {
            return (
                df.toLocaleString(undefined, {
                    day: '2-digit',
                }) +
                '-' +
                dt.toLocaleString(undefined, {
                    year: '2-digit',
                    month: '2-digit',
                    day: '2-digit',
                })
            );
        }
    }

    isEndRegistration(tournament) {
        this.endRegistration = Date.now() > tournament.dateEndReg;
    }

    getDateSting(date) {
        let df = new Date();

        df.setTime(date);

        return df.toLocaleString(undefined, {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
        });
    }

    goToTournament(id: string) {
        this.homeService.cleanCache();
        this.router.navigate([`/champ/${id}/`]);
    }
    
    async parse(data) {
        let tournaments = Object
            .values(data)
            
            .map((d: any) => {
                let t: Tournament = {
                    // "id": champ.champId,
                    id: d.title,
                    type: d.champType,
                    name: d.champNameUa,
                    // TODO: move time to settings
                    date: Date.parse(d.champFrom + 'T00:00:00'),
                    dateTo: Date.parse(d.champTo + 'T00:00:00'),
                    dateEndReg: Date.parse(d.champRegTo + 'T00:00:00'),
                    description:
                        'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Provident quidem rem accusantium eius dolores obcaecati explicabo, ratione aspernatur expedita cumque.',
                    results: '/champ/' + d.title + '/result?offset=0',
                    location: d.champCityUa,
                    orgLogo: d.orgId
                };
                let flag =  this.organizations?.filter(item => item.orgId == Number(t.orgLogo))
                if(flag && flag.length == 1){
                    t.orgLogo = flag[0].orgFlag;
                }
                return t;
            });

        tournaments = tournaments
            .filter(t => ((t.type != 1) && this.isTournamentPassed(t) || this.isTounamentFuture(t)) && t.id && t.id.indexOf('test') == -1)
            .sort((t1, t2) => t2.date - t1.date)

        // For future tournaments normal sorting order
        let future = tournaments
            .filter(t => this.isTounamentFuture(t))
            .sort((t1, t2) => t1.date - t2.date)

        let futureRestruectured = null;

        if (future && future.length > 0) {
            futureRestruectured = {
                next: future.shift(),
                following: future
            }
        }

        this.customPreview = tournaments.filter(t => this.isTournamentPassed(t));

        return {
            future: futureRestruectured,
            past: tournaments.filter(t => this.isTournamentPassed(t))
        }
    }

    onPageChange($event) {
        this.page = $event.page
    }

    onPageFuturChange($event) {
        this.pageFutur = $event.page
    }
}
