declare const require: (moduleName: string) => any
declare const process: { stdin: any; stdout: any }

import * as sim_tools from './sim_tools'
import * as entities from './entities'
import * as leagues_and_clubs from './leagues_and_clubs'

const readline = require('readline')
const { createInterface } = readline
const { stdin: input, stdout: output } = process

export { sim_tools, entities }

const rl = createInterface({ input, output })
const startingOvr = sim_tools.getRandomFloat(50, 65)

const eryk_krygier = new entities.Footballer({
    ovr: startingOvr,
    potential: sim_tools.getRandomFloat(startingOvr, 85),
    professionalism: sim_tools.getRandomFloat(-10, 10),
    position: 'ST',
    club: leagues_and_clubs.EKSTRAKLASA_CLUBS.LEGIA_WARSZAWA,
    injuryRisk: sim_tools.getRandomFloat(0, 20),
})

function printPlayerStats(player: entities.Footballer, name: string = "Zawodnik") {
    const age = player.age ?? 'N/A';
    const ovr = typeof player.ovr === 'number' ? player.ovr.toFixed(1) : player.ovr;
    const pot = typeof player.potential === 'number' ? player.potential.toFixed(1) : player.potential;
    const prof = typeof player.professionalism === 'number' ? player.professionalism.toFixed(1) : player.professionalism;
    const inj = typeof player.injuryRisk === 'number' ? player.injuryRisk.toFixed(1) : player.injuryRisk;

    console.log(`
+--------------------------------------------------------+
| PROFIL ZAWODNIKA: ${name.padEnd(36)} |
+--------------------------------------------------------+
| Wiek:            ${String(age).padEnd(37)} |
| Pozycja:         ${String(player.position).padEnd(37)} |
| Klub:            ${String(player.club?.name ?? 'Brak').padEnd(37)} |
| Status w klubie: ${String(player.club_status ?? 'Brak').padEnd(37)} |
+--------------------------------------------------------+
| STATYSTYKI                                             |
| OVR:             ${String(ovr).padEnd(37)} |
| Potencjal:       ${String(pot).padEnd(37)} |
| Profesjonalizm:  ${String(prof).padEnd(37)} |
| Ryzyko kontuzji: ${(inj + '%').padEnd(37)} |
+--------------------------------------------------------+
    `);
}

function simulateSeasonInternal(player: entities.Footballer, seasonIndex: number, debug: boolean = false) {
    let gamesPlayed = 0
    let totalGoals = 0
    let totalAssists = 0
    const startingOvr = player.ovr
    const startingPotential = player.potential
    
    const seasonHeader = ` SEZON ${seasonIndex} — Wiek: ${player.age} `
    console.log("\n" + "#".repeat(60))
    console.log(seasonHeader.padStart(Math.floor((60 + seasonHeader.length) / 2)).padEnd(60))
    console.log("#".repeat(60))
    
    const seasonalFormResult = sim_tools.seasonalForm(player.professionalism)
    
    const injury = sim_tools.simulateInjury(player.injuryRisk)
    let gamesMissed = 0
    if (injury != null) {
        gamesMissed = sim_tools.getRandomFloat(injury.gamesMissed[0], injury.gamesMissed[1])
        console.log('Doznałeś kontuzji: ' + injury.name + ', liczba opuszczonych meczów: ' + gamesMissed.toFixed(0))
    }
    else {
        console.log('Nie doznałeś kontuzji w tym sezonie.')
    }
    
    const expected_g_a = sim_tools.calculateGA(player.position, Math.floor(player.ovr), seasonalFormResult.multiplier, player.club.ovr, player.club.league.ovr)
    const playtime = sim_tools.determinePlaytime(player, player.club) * (1-seasonalFormResult.gamesPenalty)
    
    const gamesInSeason = 45
    const gamesToPlay = Math.max(0, Math.floor(gamesInSeason * playtime) - gamesMissed) + Math.floor(sim_tools.getRandomFloat(0,5))
    
    gamesPlayed = gamesToPlay
    
    for (let i = 0; i < gamesToPlay; i++) {
        const ga = sim_tools.simulateMatchGA(expected_g_a['goals'], expected_g_a['assists'])
        totalGoals += ga['goals']
        totalAssists += ga['assists']
    }
    
    const growth = sim_tools.simulateGrowth(player.age, player.ovr, player.potential, player.club.ovr, gamesPlayed, gamesInSeason, seasonalFormResult.multiplier, player.professionalism, debug)
    
    player.ovr += growth['growth']
    player.potential += growth['potentialChange']
    
    console.log(`Forma sezonowa: ${seasonalFormResult.name}, współczynnik: ${seasonalFormResult.multiplier.toFixed(2)}`)
    console.log(`Wzrost umiejętnosci w tym sezonie: ${growth.growth} (${startingOvr} -> ${player.ovr})`)
    console.log(`Wzrost potencjału w tym sezonie: ${growth.potentialChange} (${startingPotential} -> ${player.potential})`)
    console.log(`Szansa na grę: ${playtime}`)
    console.log(`Rozegrałeś ${gamesToPlay}/${gamesInSeason} (${(gamesToPlay/gamesInSeason*100).toFixed(2)}%) meczy`)
    console.log(`G/A: ${totalGoals}G (${(expected_g_a['goals'] * gamesToPlay).toFixed(2)} xG)/ ${totalAssists} (${(expected_g_a['assists'] * gamesToPlay).toFixed(2)} xA)`)
    printPlayerStats(player, `Sezon ${seasonIndex}`)
}

async function askToContinueNextSeason(): Promise<boolean> {
    const answer = await new Promise<string>((resolve) => {
        rl.question('Czy chcesz symulować kolejny sezon? [t/n]: ', (input: string) => resolve(input))
    })
    
    const normalizedAnswer = answer.trim().toLowerCase()
    return normalizedAnswer === 't' || normalizedAnswer === 'tak' || normalizedAnswer === 'y' || normalizedAnswer === 'yes'
}

async function simulateCareer(player: entities.Footballer) {
    printPlayerStats(player, 'Początek kariery');
    
    let season = 1
    while (true) {
        simulateSeasonInternal(player, season, false)
        player.ageUp()
        
        const shouldContinue = await askToContinueNextSeason()
        if (!shouldContinue) {
            console.log('Statystyki końcowe zawodnika po zakończeniu kariery:');
            break
        }
        
        season++
    }
    
    rl.close()
}

void simulateCareer(eryk_krygier)
