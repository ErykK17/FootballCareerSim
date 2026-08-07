# Football Player Simulation Core

Kompleksowy silnik symulacji piłkarskiej przeznaczony do zarządzania atrybutami, rozwojem, regresem wiekowym, wydajnością meczową, generowaniem formy oraz dynamiką kontuzji zawodników. Projekt wykorzystuje architekturę zorientowaną obiektowo (OOP) napisaną w języku TypeScript.

---

## System Klas i Struktura Danych

### Klasa Footballer
Główna encja systemu reprezentująca piłkarza. Metody dostępowe gwarantują walidację wartości w dopuszczalnych zakresach (enkapsulacja danych).

* **ovr** (`number`): Aktualne umiejętności ogólne zawodnika **[Zakres: 1–99]**.
* **potential** (`number`): Maksymalny pułap umiejętności, jaki gracz może osiągnąć **[Zakres: 1–99]**.
* **professionalism** (`number`): Wpływ cech osobowości na podejście do treningów i regeneracji **[Zakres: -10 do 10]**.
* **injuryRisk** (`number`): Bazowe ryzyko odniesienia kontuzji podczas meczu lub treningu **[Zakres: 1 do 20]**.
* **age** (`number`): Wiek zawodnika **[Domyślnie: 16]**. Modyfikowany bezpośrednio metodą `ageUp()`.
* **position** (`Position`): Przypisana nominalna pozycja boiskowa.
* **club** (`Club`): Klub, w którym aktualnie występuje gracz.
* **clubStatus** (`string`): Rola zawodnika w zespole (np. Wychowanek, Kluczowy gracz, Rezerwowy).
* **form** (`string`): Aktualna dyspozycja psychofizyczna (np. Tragiczna, Słaba, Przeciętna, Wysoka, Fenomenalna).

### Klasy Wspierające
* **Club**: Zawiera statystyki zespołu, w tym ogólny poziom drużyny (`clubOvr`) oraz przypisanie do ligi.
* **League**: Reprezentuje ligę piłkarską ze skorelowanym poziomem trudności/renomy (`leagueOvr`) oraz krajem.

---

## Logika Rozwoju i Regresu

Progres zawodnika jest wyliczany dynamicznie na podstawie kombinacji wieku, potencjału, profesjonalizmu oraz poziomu klubu, w którym występuje.

### 1. Wpływ Wieku (AGE GROWTH FACTOR)
Zgodnie z naturalną krzywą rozwoju sportowca, tempo zdobywania umiejętności zależy od przedziału wiekowego:

| Przedział Wiekowy | Mnożnik Rozwoju | Charakterystyka |
| :--- | :---: | :--- |
| **Młodzi ($\le$ 21 lat)** | `1.00` | Maksymalny przyrost punktów umiejętności. |
| **Wcześni Seniorzy (22–25 lat)** | `0.80` | Ustabilizowany rozwój, szlifowanie talentu. |
| **Doświadczeni (26–29 lat)** | `0.45` | Osiągnięcie szczytu możliwości (Prime). |
| **Weterani ($\ge$ 30 lat)** | `0.20` | Wyhamowanie rozwoju, podatność na regres. |

### 2. Ogranicznik Klubowy (growthSoftCap)
Zawodnik występujący w klubie o niskim poziomie (`clubOvr`) w stosunku do swoich umiejętności napotyka opór w dalszym rozwoju:

$$\text{Różnica OVR} = \text{ovr} - \text{clubOvr}$$

* **Różnica $\le$ 4 pkt**: `1.00` (100% wydajności treningu)
* **Różnica 5–7 pkt**: `0.80` (80% wydajności treningu)
* **Różnica 8–9 pkt**: `0.50` (50% wydajności treningu)
* **Różnica 10–11 pkt**: `0.20` (20% wydajności treningu)
* **Różnica $\ge$ 12 pkt**: `0.00` (Brak dalszego rozwoju w tym klubie)

---

## Mechanika Losowania Formy Zawodnika

Forma gracza determinowana jest na początku każdego okresu symulacji lub przed rozegraniem serii spotkań. Losowanie bazuje na rozkładzie prawdopodobieństwa zmodyfikowanym o parametr **professionalism**:

* **Wysoki Profesjonalizm (> 5)**: Przesuwa wagę losowania w stronę wyższych poziomów formy (mniejsza fluktuacja dyspozycji).
* **Niski Profesjonalizm (< 0)**: Zwiększa prawdopodobieństwo wylosowania słabej lub tragicznej formy.

### Mnożniki Wpływu Formy na OVR i Rozwój

| Poziom Formy | Mnożnik Statystyk Meczowych | Mnożnik Przyrostu OVR |
| :--- | :---: | :---: |
| **Tragiczna** | `0.70` | `0.20` |
| **Słaba** | `0.85` | `0.60` |
| **Przeciętna** | `1.00` | `1.00` |
| **Wysoka** | `1.15` | `1.25` |
| **Fenomenalna** | `1.30` | `1.50` |

---

## Generator Statystyk Sezonowych (Koniec Sezonu)

Na koniec roku symulacyjnego silnik wylicza końcowy dorobek meczowy zawodnika (Liczba Meczów, Bramki, Asysty, Żółte i Czerwone Kartki).

### 1. Liczba Rozegranych Meczów
Liczba występów w sezonie zależy od pozycji w klubie (`clubStatus`) oraz absencji spowodowanych kontuzjami:
* **Kluczowy gracz**: 85%–95% możliwych spotkań w sezonie.
* **Wychowanek / Rezerwowy**: 30%–60% możliwych spotkań w sezonie.
* **Korekta o Kontuzje**: Od łącznej liczby odejmowane są mecze opuszczone przez urazy z tabeli `INJURIES`.

### 2. Wyliczanie Bramek i Asyst (G/A)
Wyjściowa liczba ramek i asyst wyliczana jest na podstawie średniej dla pozycji (`POSITION GA RATES`) oraz liczby rozegranych meczów, a następnie modyfikowana przez formę i poziom umiejętności:

$$\text{Oczekiwane Bramki} = \text{Mecze} \times \text{Bramki Na Mecz} \times \left(\frac{\text{ovr}}{75}\right) \times \text{Mnożnik Formy}$$

---

## Wydajność na Boisku (POSITION GA RATES)

| Pozycja | Kod | Oczekiwane Bramki / Mecz | Oczekiwane Asysty / Mecz |
| :--- | :---: | :---: | :---: |
| **Napastnik** | `ST` | 0.35 | 0.10 |
| **Lewoskrzydłowy** | `LW` | 0.25 | 0.20 |
| **Prawoskrzydłowy** | `RW` | 0.25 | 0.15 |
| **Ofensywny Pomocnik** | `CAM` | 0.20 | 0.18 |
| **Środkowy Pomocnik** | `CM` | 0.08 | 0.10 |
| **Defensywny Pomocnik** | `CDM` | 0.03 | 0.05 |
| **Lewy Obrońca** | `LB` | 0.02 | 0.07 |
| **Prawy Obrońca** | `RB` | 0.02 | 0.07 |
| **Środkowy Obrońca** | `CB` | 0.035 | 0.015 |

---

## System Kontuzji i Urazów (INJURIES)

Zdarzenia medyczne generowane są na podstawie parametru `injuryRisk`. Kontuzje podzielone są według stopnia dolegliwości i wpływu na karierę:

### Kategoria 1: Urazy Lekkie
* **Cechy**: Brak permanentnego spadku statystyk. Krótki czas absencji.
* **Przykłady**: Stłuczenie mięśnia (1-2 mecze), Lekkie skręcenie kostki (2-4 mecze), Naciągnięcie dwugłowego (2-5 meczów), Przeciążenie pachwiny (1-3 mecze).

### Kategoria 2: Urazy Średnie
* **Cechy**: Ryzyko chwilowego lub trwałego spadku umiejętności o **-1 OVR**.
* **Przykłady**: Skręcenie kostki II stopnia (3-6 meczów), Złamanie palca (2-5 meczów), Naderwanie pachwiny (4-8 meczów), Wstrząśnienie mózgu (2-4 mecze).

### Kategoria 3: Urazy Ciężkie
* **Cechy**: Długa przerwa od gry oraz gwarantowany spadek umiejętności `OVR`:
  * **Uszkodzenie łąkotki**: Przerwa 8–16 meczów | Spadek: **-2 OVR**
  * **Złamanie kości piszczelowej**: Przerwa 12–25 meczów | Spadek: **-3 OVR**
  * **Zerwanie ścięgna Achillesa**: Przerwa 20–35 meczów | Spadek: **-4 OVR**
  * **Zerwanie więzadeł krzyżowych (ACL)**: Przerwa 25–40 meczów | Spadek: **-5 OVR**

### Kategoria 4: Urazy Krytyczne
* **Zawał serca / Poważna wada kardiologiczna**: Skutkuje natychmiastowym wymuszonym zakończeniem kariery sportowej (`careerEnding: true`).

---

## Przykłady Inicjalizacji i Użycia

### Kompletny Przepływ Kodowy

```typescript
import { Footballer, Club, League } from './footballer';

// 1. Definiowanie Struktury Ligi i Klubu
const laLiga = new League(85, "Spain");
const realMadrid = new Club(laLiga, 86);

// 2. Inicjalizacja Nowego Gracza
const player = new Footballer({
    ovr: 75,
    potential: 90,
    professionalism: 9,
    position: "CAM",
    club: realMadrid,
    injuryRisk: 3,
    age: 17,
    clubStatus: "Młody Talent",
    form: "Bardzo Wysoka"
});

// 3. Weryfikacja Danych
console.log(`Początkowy wiek: ${player.age}`); // 17
console.log(`Początkowy OVR: ${player.ovr}`);   // 75

// 4. Symulacja Upływu Czasu
player.ageUp();

console.log(`Wiek po sezonie: ${player.age}`); // 18
