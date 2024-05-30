// Rename of / and split by multiple files
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
  D10 = '10D'
}

export class DanOption {
  id: number;
  name: Dan;
}

export interface IRefery {
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

export class Filter {
  title: string;
  coachId: number | null;
  coach: string;
  clubId: number | null;
  club: string;
  isSuperAdmin: boolean;

  Filter() {
    this.title = '';
    this.coachId = null;
    this.clubId = null;
    this.club = '';
    this.coach = '';
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
      // this.clubId = coach.clubId;
      this.coach = coach.coach;
      this.isSuperAdmin = coach.isSuperAdmin;
  }
}

export class Refery {

  // FIO, DAN, Gender, ReferyId, TatamiId, BrigadeId, sushin, clubs.ClubId, clubs.ClubName, countries.countryId, countryNameEn, countryNameRu, countryNameUa, countryFlag
  
  FIO: string;
  DateBR: Date;
  DAN: Dan;
  Gender: Gender;
  ReferyId : number;
  TatamiId : number;
  BrigadeId : number;
  sushin : number;
  clubId: number;
  ClubName: string;
  countryId: number;
  countryNameEn: string; 
  countryNameRu: string; 
  countryNameUa: string;
  countryFlag : string;
  coachId: number;
  // selectedSushin: any;
  title: string;

  static DEFAULT_REFERY_DATA = {
    Gender: Gender.MALE,
    DAN: '1D',
  };

  constructor(data?: any) {
    data =
      typeof data !== 'undefined' && data !== null
        ? data
        : Refery.DEFAULT_REFERY_DATA;

    for (let p in data) {
      this[p] = data[p];
    }
  }

  isNotEmpty(): boolean {
    return (
      (typeof this.FIO != 'undefined' && this.FIO != null && this.FIO != '') ||
      (typeof this.Gender != 'undefined' && this.Gender != null && this.Gender != Refery.DEFAULT_REFERY_DATA.Gender) ||
      (typeof this.DAN != 'undefined' && this.DAN != null && this.DAN != Refery.DEFAULT_REFERY_DATA.DAN) ||
      (typeof this.DateBR != 'undefined' && this.DateBR != null) ||
      (typeof this.countryId != 'undefined' &&  this.countryId != null ) ||
      (typeof this.clubId != 'undefined' &&  this.clubId != null )
    );
  }

  clone(): Refery {
    let cloned = new Refery();
   
    cloned = Object.assign(cloned, this);

    return cloned;
  }

  dataEquals(otherRefery) {
    let equals =
      this.FIO === otherRefery.FIO &&
      this.Gender === otherRefery.Gender &&
      this.DAN === otherRefery.DAN &&
      this.DateBR === otherRefery.DateBR &&
      this.clubId === otherRefery.clubId &&
      this.countryId === otherRefery.CountryId &&
      this.coachId === otherRefery.CoachId;

    return equals;
  }
}

export class ReferyValidation {
  FIO?: 'exists' | boolean;
  DAN?: boolean;
  DateBR?: boolean;
  Gender?: boolean;
  ClubName?: boolean;
  CountryKod?: boolean;
  CounryFlag?: boolean;
}

