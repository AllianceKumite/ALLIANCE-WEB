export interface KataGroup {
    KataGrpId: number, 
    AlwaysNoRepet: boolean, 
    KataGrpNameEn: string, 
    KataGrpNameRu: string, 
    KataGrpNameUa: string, 
    KataGrpMandatList: string,
    KataGrpChooseList: string
}

export interface Kata {
    KataId: number, 
    KataNameEn: string, 
    KataNameRu: string, 
    KataNameUa: string, 
}