// Rename of / and split by multiple files
import { Role } from '../../../shared/types/Role';

export enum Gender {
  MALE = "Ч(M)",
  FEMALE = "Ж(F)"
}

export class GenderOption {
  id: number;
  name: Gender;
}


export enum Dan {
    K0 = '0K',
    K11 = '11K',
    K10 = '10K',
    K9 = '9K',
    K8 = '8K',
    K7 = '7K',
    K6 = '6K',
    K5 = '5K',
    K4 = '4K',
    K3 = '3K',
    K2 = '2K',
    K1 = '1K',
    D1 = '1D',
    D2 = '2D',
    D3 = '3D',
    D4 = '4D',
    D5 = '5D',
    D6 = '6D',
    D7 = '7D',
    D8 = '8D',
    D9 = '9D',
    D10  = '10D'
}

export enum Division {
  KC = 'KnockDown kumite',
  FC = 'Full Contact kumite',
  LC = 'Light Contact kumite',
  SC = 'Semi Contact kumite',
  PC = 'Point Contact kumite',
  K1C = 'Super Fight – Full Contact'
}

export class DanOption {
  id: number;
  name: Dan;
}

export class DivisionOption {
  id: number;
  name: Division;
}

export interface IAthlete {
}

export class Athlete {
  // selected: boolean;
  // current : boolean;
  athId: number;
  FIO: string;
  dateBR: string;
  gender: Gender;
  DAN: Dan;
  Weight: number;
  Photo: string;
  photo_bytes: any;
  Kumite: boolean;
  Kata: boolean;
  KataGroup: boolean;
  Favorit1: boolean;
  Favorit2: boolean;
  Participant: boolean;
  Division: number;
  teamcompetition : boolean;

  title: string;
  coachId: number;

  static DEFAULT_ATHLETE_DATA = {
    gender: Gender.MALE,
    DAN: '0K',
    Division: -1,
  };

  constructor(data?: any) {
    data =
      typeof data !== 'undefined' && data !== null
        ? data
        : Athlete.DEFAULT_ATHLETE_DATA;

    // Object.assign(this, data)

    for (let p in data) {
      this[p] = data[p];
    }
  }

  isNotEmpty(): boolean {
    return (
      (typeof this.FIO != 'undefined' && this.FIO != null && this.FIO != '') ||
      (typeof this.dateBR != 'undefined' &&
        this.dateBR != null &&
        this.dateBR != '') ||
      (typeof this.gender != 'undefined' &&
        this.gender != null &&
        // && this.gender != ""
        this.gender != Athlete.DEFAULT_ATHLETE_DATA.gender) ||
      (typeof this.DAN != 'undefined' &&
        this.DAN != null &&
        // && this.DAN != ""
        this.DAN != Athlete.DEFAULT_ATHLETE_DATA.DAN) ||
      (typeof this.Weight != 'undefined' && this.Weight != null) ||
      // && this.Weight != ""
      (typeof this.Photo != 'undefined' &&
        this.Photo != null &&
        this.Photo != '') ||
      (typeof this.photo_bytes != 'undefined' &&
        this.photo_bytes != null &&
        this.photo_bytes != '') ||
      (typeof this.Photo != 'undefined' &&
        this.Photo != null &&
        this.Photo != '') ||
      (typeof this.Kumite != 'undefined' && this.Kumite != null) ||
      (typeof this.Kata != 'undefined' && this.Kata != null) ||
      (typeof this.Favorit1 != 'undefined' && this.Favorit1 != null) ||
      (typeof this.Favorit2 != 'undefined' && this.Favorit2 != null)
    );
  }

  clone(): Athlete {
    let cloned = new Athlete();

    cloned = Object.assign(cloned, this);

    return cloned;
  }

  dataEquals(otherAthlete) {
    let equals =
      this.FIO === otherAthlete.FIO &&
      this.dateBR === otherAthlete.dateBR &&
      this.gender === otherAthlete.gender &&
      this.DAN === otherAthlete.DAN &&
      this.Weight === otherAthlete.Weight &&
      this.Photo === otherAthlete.Photo &&
      this.photo_bytes === otherAthlete.photo_bytes &&
      this.Kumite === otherAthlete.Kumite &&
      this.Kata === otherAthlete.Kata &&
      this.KataGroup === otherAthlete.KataGroup &&
      this.Favorit1 === otherAthlete.Favorit1 &&
      this.Favorit2 === otherAthlete.Favorit2;

    return equals;
  }
  // Object.assign({}, this.activeAthlete);
}

export class AthleteValidation {
    FIO?: 'exists' | boolean;
    dateBR?: boolean;;
    gender?: boolean;;
    DAN?: boolean;;
    weight?: boolean;;
    Photo?: boolean;;
    photo_bytes?: boolean;;
    Kumite?: boolean;
    Kata?: boolean;
    KataGroup?: boolean;
    Favorit1?: boolean;
    Favorit2?: boolean;
    Participant?: boolean;

}

export class Coach {
    isBlocked: boolean;
    coachId: number;
    club: string;
    coach: string;
    isBranch: boolean;
    isSuperAdmin: boolean;
    branch: string;
}

export class Branch {
    isTmanager: boolean;
    role: Role;
    details: string;
    blocked: boolean;
}

export class Filter {
  title: string;
  coachId: number | null;
  clubId: number | null;
  club: string;
  coach: string;
  branch: string;
  isBranch: boolean;
  isSuperAdmin: boolean;
  filters = {
      participantOption: 'full',
      genderOption: 'all',
      findByName: ''
  }

  Filter() {
    this.title = '';
    this.coachId = null;
    this.clubId = null;
    this.club = '';
    this.coach = '';
    this.branch = '';
    this.isBranch = false;
    this.filters = {
        participantOption: 'full',
        genderOption: 'all',
        findByName: ''
    }
  }

  toParams(superAdminId) {
      let params = Object.assign({}, this);

      if (params.coachId == superAdminId) {
          params.coachId = null
      }

      return params;
  }

  fillFromCoach(coach: Coach) {
      this.coachId = coach.coachId;
      this.club = coach.club;
      this.coach = coach.coach;
      this.isBranch = coach.isBranch;
      this.isSuperAdmin = coach.isSuperAdmin;
      this.branch = coach.branch;
  }
}
