# Symulator Kariery Piłkarskiej — Dokumentacja Logiki

## 1. Atrybuty Początkowe Zawodnika

* **`poczatkowy_ovr`**: Wartość losowa z przedziału $[50, 65]$.
* **`potencjal`**: Wartość losowa z przedziału $[\text{poczatkowyOvr}, 99]$.
* **`profesjonalizm`**: Wartość losowa z przedziału $[-20, 20]$ (wpływa na stabilność formy i rozwój zawodnika).
* **`injuryRisk`**: Podatność na kontuzje, przyjmuje wartości z przedziału $[1, 20]$ (`clamp(1, 20)`).

---

## 2. Status w Zespole i Czas Gry

Rola zawodnika w drużynie zależy od różnicy między jego poziomem (`ovr`) a średnim poziomem klubu (`club_ovr`):

$$\text{pozycjaWSkladzie} = \text{ovr} - \text{clubOvr}$$

Mnożnik czasu gry ($\text{mnoznikRoli}$) losowany jest z przedziału przypisanego do danej roli:

| Różnica OVR | Rola w zespole | Mnożnik czasu gry ($\text{mnoznikRoli}$) |
| :--- | :--- | :--- |
| $\ge +5$ | **Gwiazda** | $0.90 - 0.95$ |
| $+3$ do $+4$ | **Ważny zawodnik** | $0.80 - 0.90$ |
| $0$ do $+2$ | **Pierwszy skład** | $0.70 - 0.80$ |
| $-2$ do $0$ | **Zawodnik rotacyjny** | $0.30 - 0.50$ |
| $\le -3$ | **Rezerwowy** | $0.05 - 0.20$ |

---

## 3. Bazowa Liczba Meczów w Sezonie

Liczba meczów dostępnych dla klubu w sezonie ($\text{bazowaIloscMeczow}$):

* **Bez Ligi Mistrzów (NO UCL):** $40$ meczów
* **Z Ligą Mistrzów (UCL):** $60$ meczów

---

## 4. Bazowe Statystyki na Mecz (G, A)

Średnia bazowa liczba bramek ($G$) i asyst ($A$) generowana na mecz przez zawodnika bez uwzględnienia jego umiejętności oraz formy, zależna od pozycji:

| Pozycja | Bazowe Gole na mecz ($G$) | Bazowe Asysty na mecz ($A$) |
| :--- | :--- | :--- |
| **ST** (Napastnik) | $0.35$ | $0.10$ |
| **LW / RW** (Skrzydłowy) | $0.25$ | $0.20$ |
| **CAM** (Ofensywny pomocnik) | $0.20$ | $0.20$ |
| **CM** (Środkowy pomocnik) | $0.10$ | $0.15$ |
| **CDM** (Defensywny pomocnik) | $0.05$ | $0.15$ |
| **LB / RB** (Boczny obrońca) | $0.025$ | $0.10$ |
| **CB** (Środkowy obrońca) | $0.05$ | $0.025$ |

---

## 5. Dyspozycja Sezonowa i Forma

Przed każdym sezonem losowany jest ogólny poziom dyspozycji zawodnika.

### Tabela Dyspozycji Sezonowej:

| Szansa | Dyspozycja | Mnożnik statystyk ($\text{formMult}$) | Kara do meczów ($\text{karaDoMeczow}$) |
| :--- | :--- | :--- | :--- |
| **5%** | Beznadziejna | $0.50$ | $-50\%$ ($0.50$) |
| **15%** | Słaba | $0.80$ | $-25\%$ ($0.25$) |
| **50%** | Średnia | $1.00$ | $0\%$ ($0.00$) |
| **20%** | Dobra | $1.20$ | $0\%$ ($0.00$) |
| **8%** | Bardzo Dobra | $1.40$ | $0\%$ ($0.00$) |
| **2%** | Sezon Życia | $1.6$ | $0\%$ ($0.00$) |

### Obliczanie bieżącej formy:
$$\text{forma} = \text{rand}(0, 100) + \text{profesjonalizm}$$

Do rzutu na formę dodawany jest profesjonalizm. Ujemny profesjonalizm zwiększy szanse na słaby sezon, a wysoki profesjonalizm, zwiększy szanse na dobry sezon. 
Np. professionalism=10 zwiększy szansę na sezon życia z 2%->12% oraz sprawi, że najgorsza forma jaka może się wylosować to słaba itp.

---

## 6. Kontuzje i Podatność na Urazy

W każdym sezonie przeprowadzana jest symulacja zdrowia zawodnika na podstawie jego parametru `injuryRisk` ($1 - 20$).

### 1. Test na wystąpienie kontuzji:
$$\text{injuryRoll} = \text{rand}(0.0, 100.0)$$

Jeśli $\text{injuryRoll} \le \text{injuryRisk}$, gracz odnosi kontuzję.

### 2. Wybór typu kontuzji:
Losowana jest wartość $\text{injurySeverityRoll} = \text{rand}(0.0, 100.0)$, a typ urazu dobierany jest z tabeli ważonej.

### Tabela Urazów (`INJURIES`):

| Nazwa Urazu | Waga (%) | Opuszczone Mecze (`gamesMissed`) | Spadek OVR (`ovrDrop`) | Koniec Kariery (`careerEnding`) |
| :--- | :--- | :--- | :--- | :--- |
| **Lekkie urazy** | | | | |
| Stłuczenie mięśnia | $30.0\%$ | $1 - 2$ | $0$ | NIE |
| Lekkie skręcenie kostki | $25.0\%$ | $1 - 3$ | $0$ | NIE |
| Naciągnięcie mięśnia dwugłowego | $15.0\%$ | $2 - 4$ | $0$ | NIE |
| Przeciążenie pachwiny | $12.0\%$ | $2 - 5$ | $0$ | NIE |
| **Średnie urazy** | | | | |
| Skręcenie stawu skokowego (II st.) | $5.0\%$ | $4 - 8$ | $-1$ | NIE |
| Złamanie palca u nogi | $4.0\%$ | $3 - 6$ | $-1$ | NIE |
| Naderwanie mięśnia pachwiny | $2.0\%$ | $5 - 10$ | $-1$ | NIE |
| Wstrząśnienie mózgu | $2.0\%$ | $2 - 4$ | $0$ | NIE |
| **Ciężkie urazy** | | | | |
| Uszkodzenie łąkotki | $1.0\%$ | $8 - 16$ | $-2$ | NIE |
| Złamanie kości piszczelowej | $1.0\%$ | $15 - 25$ | $-3$ | NIE |
| Zerwanie ścięgna Achillesa | $1.0\%$ | $25 - 35$ | $-4$ | NIE |
| Zerwanie więzadeł (ACL) | $1.0\%$ | $30 - 40$ | $-5$ | NIE |
| **Urazy kończące karierę** | | | | |
| Zawał serca | $1.0\%$ | $0$ | $0$ | **TAK** |

---

## 7. Wzory Końcowe Statystyk Sezonowych

### 1. Liczba rozegranych meczów w sezonie:

$$\text{efektywneMecze} = \max\left(0, \; \left(\text{bazowaIloscMeczow} \times \text{pozycjaWSkladzie} \times (1 - \text{karaDoMeczow})\right) - \text{gamesMissed}\right)$$

$$\text{gamesPlayedRatio} = \frac{\text{efektywneMecze}}{40}$$

### 2. Funkcja calculateGA

Funkcja `calculateGA(position, ovr, formMultiplier, clubOVR, leagueOVR)` oblicza oczekiwaną liczbę bramek i asyst na mecz dla danego zawodnika. Najpierw pobiera bazowe wartości `G` i `A` dla pozycji z tabeli 4, a następnie mnoży je przez:
- relatywny poziom zawodnika względem ligi: $\left(\frac{\text{ovr}}{\text{leagueOVR}}\right)^3$
- relatywny poziom klubu względem ligi: $\left(\frac{\text{clubOVR}}{\text{leagueOVR}}\right)^2$
- sezonową formę: `formMultiplier`

Dzięki temu funkcja zwraca wartości `xG` i `xA`, czyli średnią liczbę bramek i asyst oczekiwaną w jednym meczu.

$$\text{xG} = \text{bazoweGnaGre} \times \left(\frac{\text{ovr}}{\text{ovrLiga}}\right)^3 \times \left(\frac{\text{clubOVR}}{\text{ovrLiga}}\right)^2 \times \text{formMult}$$

$$\text{xA} = \text{bazoweAnaGre} \times \left(\frac{\text{ovr}}{\text{ovrLiga}}\right)^3 \times \left(\frac{\text{clubOVR}}{\text{ovrLiga}}\right)^2 \times \text{formMult}$$

### 3. Funkcja samplePoisson

Funkcja `samplePoisson(lambda)` zamienia wartość oczekiwaną (`xG` lub `xA`) w losowy wynik meczu zgodny z rozkładem Poissona. Jeśli `lambda <= 0`, zwraca `0`. W przeciwnym razie losuje liczbę zdarzeń, gdzie prawdopodobieństwo wystąpienia $k$ trafień jest budowane krok po kroku aż do przekroczenia losowej wartości. Dzięki temu z jednej średniej wartości powstaje realistyczna liczba goli lub asyst w konkretnym meczu.

### 4. Wygenerowane bramki i asysty:

Bramki i asysty generowane są na podstawie liczby rozegranych meczów, wartości `xG`/`xA` uzyskanych z `calculateGA` oraz wyniku losowania z `samplePoisson`:

$$\text{bramki} = \text{samplePoisson}(\text{xG})$$

$$\text{asysty} = \text{samplePoisson}(\text{xA})$$

Gdzie:
- **`efektywneMecze`** — liczba faktycznie rozegranych meczów (po uwzględnieniu czasu gry i kontuzji)
- **`bazoweGnaGre`** / **`bazoweAnaGre`** — średnia liczba bramek/asyst na mecz dla danej pozycji (tabela 4)
- **`ovr`** — obecny poziom zawodnika
- **`clubOVR`** — średni poziom zawodników w klubie
- **`ovrLiga`** — średni poziom zawodników w lidze
- **`formMult`** — mnożnik formy sezonowej (tabela 5)
- **`xG` / `xA`** — oczekiwane wartości bramek i asyst na mecz
- **`samplePoisson`** — funkcja losująca realistyczny wynik zgodny z rozkładem Poissona
