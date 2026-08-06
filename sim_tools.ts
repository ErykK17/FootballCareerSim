import { Footballer, Club, Position } from "./entities";

export const getRandomFloat = (min: number, max: number): number => {
    return Number((Math.random() * (max - min) + min).toFixed(2));
}

export const determinePlaytime = (footballer: Footballer, club: Club): number => {
    let ovrDiff: number = footballer.ovr - club.ovr;

    if (ovrDiff >= 5) {
        footballer.club_status = "Gwiazda";
        let playTime = getRandomFloat(0.9, 0.95);
        return playTime;
    }
    else if (ovrDiff >= 3) {
        footballer.club_status = "Kluczowy Zawodnik";
        let playTime = getRandomFloat(0.8, 0.9);
        return playTime;
    }
    else if (ovrDiff >= 0) {
        footballer.club_status = "Pierwszy skład";
        let playTime = getRandomFloat(0.7, 0.8);
        return playTime;
    }
    else if (ovrDiff >= -2) {
        footballer.club_status = "Zawodnik Rotacyjny";
        let playTime = getRandomFloat(0.3, 0.5);
        return playTime;
    }
    else {
        footballer.club_status = "Rezerwowy";
        let playTime = getRandomFloat(0.05, 0.2);
        return playTime;
    }

}

export const POSITION_GA_RATES: Record<string, [number, number]> = {
    "ST": [0.35, 0.10],
    "LW": [0.25, 0.20],
    "RW": [0.25, 0.20],
    "CAM": [0.20, 0.20],
    "CM": [0.10, 0.15],
    "CDM": [0.05, 0.15],
    "LB": [0.025, 0.10],
    "RB": [0.025, 0.10],
    "CB": [0.05, 0.025],
}

export const baseGAPerGame = (position: Position): [number, number] => {
    return POSITION_GA_RATES[position.toUpperCase()] ?? [0.0, 0.0]
}

export interface SeasonalFormResult {
    name: string;
    multiplier: number;
    gamesPenalty: number; // np. -0.30 oznacza -30%
}

export const seasonalForm = (professionalism: number): SeasonalFormResult => {
    const form = getRandomFloat(0, 100) + professionalism;

    if (form <= 5) {
        return { name: "Beznadziejna", multiplier: 0.5, gamesPenalty: -0.30 };
    }
    if (form <= 20) {
        return { name: "Slaba", multiplier: 0.8, gamesPenalty: -0.15 };
    }
    if (form <= 70) {
        return { name: "Srednia", multiplier: 1.0, gamesPenalty: 0 };
    }
    if (form <= 90) {
        return { name: "Dobra", multiplier: 1.2, gamesPenalty: 0 };
    }
    if (form <= 98) {
        return { name: "Bardzo Dobra", multiplier: 1.4, gamesPenalty: 0 };
    }

    return { name: "Sezon Zycia", multiplier: 1.75, gamesPenalty: 0 };
};

