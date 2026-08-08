export interface FootballerParameters {
    ovr: number;
    potential: number;
    professionalism: number;
    position: Position;
    club: Club;
    injuryRisk: number;
    age?: number;
    club_status?: string;
    form?: string;
};

export interface Injury {
    name: string;
    gamesMissed: [number, number];
    probability: number;
    ovrDrop?: number;
    careerEnding?: boolean;
};

export class League {
    constructor(
        public ovr: number,
        public country: string,
        public name: string,
    ) { }
};

export class Club {
    constructor(
        public league: League,
        public ovr: number,
        public name: string,
    ) { }
};

export type Position = "ST" | "LW" | "RW" | "CAM" | "CM" | "CDM" | "LB" | "RB" | "CB";

export class Footballer {
    private _ovr: number = 1;
    private _potential: number = 1;
    private _professionalism: number = 0;
    private _age: number;
    private _injuryRisk: number = 10;

    public position: Position;
    public club: Club;
    public club_status: string;
    public form: string;

    constructor(parameters: FootballerParameters) {
        this.ovr = parameters.ovr;
        this.potential = parameters.potential;
        this.professionalism = parameters.professionalism;
        this.injuryRisk = parameters.injuryRisk;

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
        if (value < this.ovr) this._potential = this.ovr;
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

    get injuryRisk(): number {
        return this._injuryRisk;
    }

    set injuryRisk(value: number) {
        if (value<1) {
            this._injuryRisk = 1;
        }
        else if (value>20) {
            this._injuryRisk = 20;
        }
        else {
            this._injuryRisk = value;
        }
    }

};

export const INJURIES: Record<string, Injury> = {
    // --- LEKKIE URAZY (Brak spadku overall) ---
    stluczenie_miesnia: {
        name: "Stłuczenie mięśnia",
        gamesMissed: [1, 2],
        probability: 30.0,
    },
    skrecenie_kostki_I: {
        name: "Lekkie skręcenie kostki",
        gamesMissed: [1, 3],
        probability: 25.0,
    },
    naciagniecie_dwuglowego: {
        name: "Naciągnięcie mięśnia dwugłowego",
        gamesMissed: [2, 4],
        probability: 15.0,
    },
    przeciazenie_pachwiny: {
        name: "Przeciążenie pachwiny",
        gamesMissed: [2, 5],
        probability: 12.0,
    },

    // --- ŚREDNIE URAZY (Niewielki spadek overall) ---
    skrecenie_kostki_II: {
        name: "Skręcenie stawu skokowego (II stopień)",
        gamesMissed: [4, 8],
        probability: 5.0,
        ovrDrop: 1,
    },
    zlamanie_palca: {
        name: "Złamanie palca u nogi",
        gamesMissed: [3, 6],
        probability: 4.0,
        ovrDrop: 1,
    },
    naderwanie_pachwiny: {
        name: "Naderwanie mięśnia pachwiny",
        gamesMissed: [5, 10],
        probability: 2.0,
        ovrDrop: 1,
    },
    wstrzasnienie_mozgu: {
        name: "Wstrząśnienie mózgu",
        gamesMissed: [2, 4],
        probability: 2.0,
    },

    // --- CIĘŻKIE URAZY (Odczuwalny spadek overall) ---
    uszkodzenie_lakotki: {
        name: "Uszkodzenie łąkotki",
        gamesMissed: [8, 16],
        probability: 1.0,
        ovrDrop: 2,
    },
    zlamanie_piszczeli: {
        name: "Złamanie kości piszczelowej",
        gamesMissed: [15, 25],
        probability: 1.0,
        ovrDrop: 3,
    },
    zerwanie_achillesa: {
        name: "Zerwanie ścięgna Achillesa",
        gamesMissed: [25, 35],
        probability: 1.0,
        ovrDrop: 4,
    },
    zerwanie_acl: {
        name: "Zerwanie więzadeł krzyżowych (ACL)",
        gamesMissed: [30, 40],
        probability: 1.0,
        ovrDrop: 5,
    },

    // --- URAZY KOŃCZĄCE KARIERE (Koniec Kariery) ---
    zawal_serca: {
        name: "Zawał serca",
        gamesMissed: [0, 0],
        probability: 1.0,
        careerEnding: true,
    },
    
};

export const POSITION_GA_RATES: Record<string, [number, number]> = {
    "ST": [0.35, 0.10],
    "LW": [0.25, 0.2],
    "RW": [0.25, 0.15],
    "CAM": [0.20, 0.18],
    "CM": [0.08, 0.10],
    "CDM": [0.03, 0.05],
    "LB": [0.02, 0.07],
    "RB": [0.02, 0.07],
    "CB": [0.035, 0.015],
};

export const AGE_GROWTH_FACTOR = (age: number): number => {
    if (age <= 21) {
        return 1.0;
    }
    else if (age <= 25) {
        return 0.8;
    }
    else if(age <=29) {
        return 0.45;
    }
    else {
        return 0.2;
    }

}

export const growthSoftCap = (
    ovr: number,
    clubOvr: number
): number => {
    const ovrDiff = ovr - clubOvr;
    if (ovrDiff <= 4) {
        return 1.00;
    } else if (ovrDiff <= 7) {
        return 0.80;
    } else if (ovrDiff <= 9) {
        return 0.50;
    } else if (ovrDiff <= 11) {
        return 0.20;
    } else {
        return 0.00;
    }
}