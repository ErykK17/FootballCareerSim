# Symulator Kariery Piłkarskiej — Dokumentacja Logiki

## 1. Atrybuty Początkowe Zawodnika

* **`poczatkowy_ovr`**: Wartość losowa z przedziału $[50, 65]$.
* **`potencjal`**: Wartość losowa z przedziału $[\mathtt{poczatkowy\_ovr}, 99]$.
* **`profesjonalizm`**: Wartość losowa z przedziału $[-20, 20]$ (wpływa na stabilność formy i rozwój zawodnika).
* **`injuryRisk`**: Podatność na kontuzje, przyjmuje wartości z przedziału $[1, 20]$ (`clamp(1, 20)`).

---

## 2. Status w Zespole i Czas Gry

Rola zawodnika w drużynie zależy od różnicy między jego poziomem (`ovr`) a średnim poziomem klubu (`club_ovr`):

$$\mathtt{pozycja\_w\_skladzie} = \mathtt{ovr} - \mathtt{club\_ovr}$$

Mnożnik czasu gry ($\mathtt{mnoznik\_roli}$) losowany jest z przedziału przypisanego do danej roli:

| Różnica OVR | Rola w zespole | Mnożnik czasu gry ($\mathtt{mnoznik\_roli}$) |
| :--- | :--- | :--- |
| $\ge +5$ | **Gwiazda** | $0.90 - 0.95$ |
| $+3$ do $+4$ | **Ważny zawodnik** | $0.80 - 0.90$ |
| $0$ do $+2$ | **Pierwszy skład** | $0.70 - 0.80$ |
| $-2$ do $0$ | **Zawodnik rotacyjny** | $0.30 - 0.50$ |
| $\le -3$ | **Rezerwowy** | $0.05 - 0.20$ |

---

## 3. Bazowa Liczba Meczów w Sezonie

Liczba meczów dostępnych dla klubu w sezonie ($\mathtt{bazowa\_ilosc\_meczow}$):

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

| Szansa | Dyspozycja | Mnożnik statystyk ($\mathtt{form\_mult}$) | Kara do meczów ($\mathtt{kara\_do\_meczow}$) |
| :--- | :--- | :--- | :--- |
| **5%** | Beznadziejna | $0.50$ | $-30\%$ ($0.30$) |
| **15%** | Słaba | $0.80$ | $-15\%$ ($0.15$) |
| **50%** | Średnia | $1.00$ | $0\%$ ($0.00$) |
| **20%** | Dobra | $1.20$ | $0\%$ ($0.00$) |
| **8%** | Bardzo Dobra | $1.40$ | $0\%$ ($0.00$) |
| **2%** | Sezon Życia | $1.75$ | $0\%$ ($0.00$) |

### Obliczanie bieżącej formy:
$$\mathtt{forma} = \mathtt{rand}(0, 100) + \mathtt{profesjonalizm}$$

---

## 6. Kontuzje i Podatność na Urazy

W każdym sezonie przeprowadzana jest symulacja zdrowia zawodnika na podstawie jego parametru `injuryRisk` ($1 - 20$).

### 1. Test na wystąpienie kontuzji:
$$\mathtt{injuryRoll} = \mathtt{rand}(0.0, 100.0)$$

Jeśli $\mathtt{injuryRoll} \le \mathtt{injuryRisk}$, gracz odnosi kontuzję.

### 2. Wybór typu kontuzji:
Losowana jest wartość $\mathtt{injurySeverityRoll} = \mathtt{rand}(0.0, 100.0)$, a typ urazu dobierany jest z tabeli ważonej.

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

Współczynnik dominacji ligowej wynosi **$E = 6.5$**.

### 1. Liczba rozegranych meczów w sezonie:

$$\mathtt{efektywne\_mecze} = \max\left(0, \; \left(\mathtt{bazowa\_ilosc\_meczow} \times \mathtt{pozycja\_w\_skladzie} \times (1 - \mathtt{kara\_do\_meczow})\right) - \mathtt{gamesMissed}\right)$$

$$\mathtt{games\_played\_ratio} = \frac{\mathtt{efektywne\_mecze}}{40}$$

### 2. Wygenerowane bramki i asysty:

$$\mathtt{bramki} = \mathtt{efektywne\_mecze} \times \mathtt{bazowe\_g\_na\_gre} \times \left(\frac{\mathtt{ovr}}{\mathtt{ovr\_liga}}\right)^{6.5} \times \mathtt{form\_mult}$$

$$\mathtt{asysty} = \mathtt{efektywne\_mecze} \times \mathtt{bazowe\_a\_na\_gre} \times \left(\frac{\mathtt{ovr}}{\mathtt{ovr\_liga}}\right)^{6.5} \times \mathtt{form\_mult}$$