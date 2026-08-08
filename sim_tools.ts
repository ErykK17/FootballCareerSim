import { Footballer, Club, Position, Injury, INJURIES, POSITION_GA_RATES, AGE_GROWTH_FACTOR, growthSoftCap } from "./entities";

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

export const simulateGrowth = (
    age: number,
    ovr: number,
    potential: number,
    clubOvr: number,
    gamesPlayed: number,
    gamesToPlay: number,
    seasonalFormMultiplier: number,
    professionalism: number
): { growth: number; potentialChange: number } => {
    // 1. Zabezpieczenie przed dzieleniem przez 0
    const playtimeRatio = gamesToPlay > 0 ? Math.min(1, Math.max(0, gamesPlayed / gamesToPlay)) : 0;

    // Profesjonalizm (-10 do 10) jako mnożnik z zakresu [0.70, 1.30]
    const professionalismFactor = 1 + (professionalism * 0.03);

    let growth = 0;
    let potentialChange = 0;

    // 2. Logika weteranów (>= 32 lata)
    if (age >= 32) {
        const naturalDecline = -2;
        const formShield = (seasonalFormMultiplier - 0.5) * 0.8;
        const profShield = professionalism * 0.06;

        growth = Math.round(naturalDecline + formShield + profShield);
    } else {
        // 3. Logika dla młodzieży (<= 21 lat): Dynamika Potencjału (Wzrost lub Strata)
        let playtimeFactor = 0;

        if (age <= 21) {
            playtimeFactor = Math.max(0, playtimeRatio * 1.5);

            // A) ZYSK POTENCJAŁU (Regularna gra > 70% meczów)
            if (playtimeRatio >= 0.70) {
                const basePotentialGain = (playtimeRatio - 0.70) * 8; // Baza: do ok. 2.4 pkt
                
                // Modyfikator profesjonalizmu: [-10 -> 0.5x], [0 -> 1.0x], [10 -> 1.5x]
                const profGainModifier = 1 + (professionalism * 0.05);

                // Bardzo dobra forma dodatkowo zwiększa potencjał (np. Sezon Życia)
                const formBonus = Math.max(0.5, seasonalFormMultiplier);

                const rawGain = basePotentialGain * profGainModifier * formBonus;
                potentialChange = Math.round(rawGain); // Wartość DODATNIA
            }
            // B) STRATA POTENCJAŁU (Brak gry < 40% meczów)
            else if (playtimeRatio < 0.40) {
                const basePenalty = (0.40 - playtimeRatio) * 6; // Baza: do ok. 2.4 pkt
                
                // Modyfikator profesjonalizmu: [-10 -> 1.5x kary], [10 -> 0.5x kary]
                const profPenaltyModifier = 1 - (professionalism * 0.05);

                const rawPenalty = basePenalty * Math.max(0.2, profPenaltyModifier);
                potentialChange = -Math.round(rawPenalty); // Wartość UJEMNA
            }
        } else {
            playtimeFactor = (playtimeRatio * 0.8) + 0.2;
        }

        // Tłumienie / Zwiększenie potencjału na potrzeby aktualnego sezonu
        const currentPotential = Math.min(99, Math.max(ovr, potential + potentialChange));
        const potentialGap = Math.max(0, currentPotential - ovr);
        const baseGrowthRate = (potentialGap / 4) + 0.5;
        const ageFactor = AGE_GROWTH_FACTOR(age);
        const softCap = growthSoftCap(ovr, clubOvr);

        const rawGrowth = baseGrowthRate * ageFactor * professionalismFactor * playtimeFactor * seasonalFormMultiplier * softCap;
        growth = Math.round(rawGrowth);
    }

    // 4. Zabezpieczenie przed przekroczeniem skorygowanego potencjału (chyba że Sezon Życia)
    const targetPotential = Math.min(99, potential + potentialChange);
    if (seasonalFormMultiplier < 1.5 && (ovr + growth) > targetPotential) {
        growth = Math.max(0, targetPotential - ovr);
    }

    return {
        'growth' : growth,
        'potentialChange' : potentialChange
    };
};