import { Footballer, Club, Position, Injury, INJURIES } from "./entities";

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
    "LW": [0.25, 0.2],
    "RW": [0.25, 0.15],
    "CAM": [0.20, 0.18],
    "CM": [0.08, 0.10],
    "CDM": [0.03, 0.05],
    "LB": [0.02, 0.07],
    "RB": [0.02, 0.07],
    "CB": [0.035, 0.015],
};

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
        return { name: "Beznadziejna", multiplier: 0.5, gamesPenalty: -0.50 };
    }
    if (form <= 20) {
        return { name: "Slaba", multiplier: 0.8, gamesPenalty: -0.25 };
    }
    if (form <= 70) {
        return { name: "Srednia", multiplier: 1.0, gamesPenalty: 0 };
    }
    if (form <= 90) {
        return { name: "Dobra", multiplier: 1.15, gamesPenalty: 0 };
    }
    if (form <= 98) {
        return { name: "Bardzo Dobra", multiplier: 1.3, gamesPenalty: 0 };
    }

    return { name: "Sezon Zycia", multiplier: 1.45, gamesPenalty: 0 };
};

export const simulateInjury = (injuryRisk: number): Injury | null => {
    const injuryRoll = getRandomFloat(0, 100);
    if (injuryRoll <= injuryRisk) {
        let injurySeverityRoll = getRandomFloat(0, 100);
        for (const injury of Object.values(INJURIES)) {
            if (injurySeverityRoll <= injury.probability) {
                return injury;
            }
            injurySeverityRoll -= injury.probability;

        }
    }
    return null;
}

export const calculateGA = (position: Position, ovr: number, formMultiplier: number, clubOVR: number, leagueOVR: number): { goals: number; assists: number } => {
    const [baseXG, baseXA] = baseGAPerGame(position);
    const xgoals = baseXG * Math.pow(ovr / leagueOVR, 3) * Math.pow(clubOVR / leagueOVR, 2) * formMultiplier;
    const xassists = baseXA * Math.pow(ovr / leagueOVR, 3) * Math.pow(clubOVR / leagueOVR, 2) * formMultiplier;
    return { goals: xgoals, assists: xassists };
}


const samplePoisson = (lambda: number): number => {
    // Zabezpieczenie przed xG/xA <= 0
    if (lambda <= 0) return 0;
    
    const rand = Math.random();
    let k = 0;
    let p = Math.exp(-lambda); // P(K = 0)
    let cumulativeProbability = p;
    
    while (rand > cumulativeProbability) {
        k++;
        p = p * (lambda / k);
        cumulativeProbability += p;
    }
    
    return k;
};

export const simulateMatchGA = (xG: number, xA: number): { goals: number; assists: number } => {

    const simulateGoals = (expectedValue: number): number => {
        if (expectedValue <= 0) return 0;

        const p1 = Math.min(expectedValue * 0.82, 0.95);

        let m2 = 0.25; // Dublet
        let m3 = 0.13; // Hat-trick
        let m4 = 0.08; // Poker
        let m5 = 0.03; // Manita

        const p2 = p1 * m2;
        const p3 = p2 * m3;
        const p4 = p3 * m4;
        const p5 = p4 * m5;

        const roll = Math.random();

        if (roll < p5) return 5;
        if (roll < p4) return 4;
        if (roll < p3) return 3;
        if (roll < p2) return 2;
        if (roll < p1) return 1;

        return 0;
    };

    return {
        goals: simulateGoals(xG),
        assists: simulateGoals(xA)
    };
};
let ga = calculateGA("ST", 81, 1, 76, 77);
console.log(ga);

console.log(ga.goals);
console.log(ga.assists);
let totalGoals = 0;
let totalAssists = 0;
let i = 0;
let Hattricks = 0;
let quadruples = 0;
let pentacles = 0;
for (i = 0; i < 34; i++) {
    const matchResult = simulateMatchGA(ga.goals, ga.assists);
    totalGoals += matchResult.goals;
    totalAssists += matchResult.assists;
    if (matchResult.goals >= 3) {
        Hattricks++;
    }
    if (matchResult.goals >= 4) {
        quadruples++;
    }
    if (matchResult.goals >= 5) {
        pentacles++;
    }
}
console.log(`Total Goals in 34 matches: ${totalGoals}, ${(totalGoals / 34).toFixed(2)} per match`);
console.log(`Total Assists in 34 matches: ${totalAssists}, ${(totalAssists / 34).toFixed(2)} per match`);
console.log(`Hattricks: ${Hattricks}`);
console.log(`Quadruples: ${quadruples}`);
console.log(`Pentacles: ${pentacles}`);