/**
 * @author Ilya
 */
export class Tournament {
  constructor(
    public id: string,
    public name: string,
    public date: number,
    public dateTo: number,
    public dateEndReg: number,
    public description: string,
    public results: string,
    public location: string,
    public orgLogo: string,
    public type: number
  ) {}

  /*getDateSting() {
      let d = new Date();

      d.setTime(this.date);

      return d.toLocaleDateString();
  }*/
}

