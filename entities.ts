export interface FootballerParameters {
    ovr: number;
    potential: number;
    professionalism: number;
    position: Position;
    club: Club;
    age?: number;
    club_status?: string;
    form?: string;
}

export class League {
    constructor(
        public ovr: number,
        public country: string
    ) { }
}

export class Club {
    constructor(
        public league: League,
        public ovr: number
    ) { }
}

export type Position = "ST" | "LW" | "RW" | "CAM" | "CM" | "CDM" | "LB" | "RB" | "CB";

export class Footballer {
    private _ovr: number = 1;
    private _potential: number = 1;
    private _professionalism: number = 0;
    private _age: number;

    public position: Position;
    public club: Club;
    public club_status: string;
    public form: string;

    constructor(parameters: FootballerParameters) {
        this.ovr = parameters.ovr;
        this.potential = parameters.potential;
        this.professionalism = parameters.professionalism;

        this.position = parameters.position;
        this.club = parameters.club;
        this._age = parameters.age ?? 16;
        this.club_status = parameters.club_status ?? "Rezerwowy";
        this.form = parameters.form ?? "Srednia";
    }

    get ovr(): number {
        return this._ovr;
    }
    set ovr(value: number) {
        if (value < 1) this._ovr = 1;
        else if (value > 99) this._ovr = 99;
        else this._ovr = value;
    }

    get potential(): number {
        return this._potential;
    }
    set potential(value: number) {
        if (value < 1) this._potential = 1;
        else if (value > 99) this._potential = 99;
        else this._potential = value;
    }

    get professionalism(): number {
        return this._professionalism;
    }
    set professionalism(value: number) {
        if (value < -10) this._professionalism = -10;
        else if (value > 10) this._professionalism = 10;
        else this._professionalism = value;
    }

    get age(): number {
        return this._age;
    }

    public ageUp(): void {
        this._age += 1;
    }
}