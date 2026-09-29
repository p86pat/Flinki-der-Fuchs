/* ---------- Rennstrecken ----------
 * pts: Kontrollpunkte (Weltkoordinaten in px), daraus wird eine geschlossene, runde Kurve.
 * Die Strecke startet beim ersten Punkt und führt in Punkt-Reihenfolge.
 * width: Strassenbreite. decor: Deko neben der Strecke (tree | palm | lolly).
 */
export const TRACKS = [
  {
    id: 'wiesenring', name: 'Wiesenring', theme: 'wiese', width: 300, decor: 'tree',
    ground: '#6cc75a', ground2: '#5fb84e', road: '#8e929c', road2: '#9aa0aa', curb: ['#ff4d4d', '#ffffff'],
    pts: [[600, 1200], [650, 650], [1100, 330], [1900, 360], [2500, 650], [2650, 1150], [2300, 1600], [1700, 1650], [1350, 1320], [950, 1650]]
  },
  {
    id: 'strandkurs', name: 'Strandkurs', theme: 'see', width: 290, decor: 'palm',
    ground: '#f3d9a0', ground2: '#e8c886', road: '#9a8f86', road2: '#a89d93', curb: ['#3d8bff', '#ffffff'],
    pts: [[500, 1300], [520, 650], [950, 330], [1550, 420], [1750, 850], [2250, 780], [2800, 450], [3250, 750], [3150, 1350], [2600, 1600], [1950, 1400], [1350, 1700], [850, 1700]]
  },
  {
    id: 'regenbogenbahn', name: 'Regenbogenbahn', theme: 'regenbogen', width: 280, decor: 'lolly',
    ground: '#ffc6e8', ground2: '#ffb3de', road: '#9a86c9', road2: '#a893d6', curb: ['#ffe066', '#69db7c'],
    pts: [[600, 1000], [800, 450], [1300, 330], [1550, 750], [1950, 560], [2450, 330], [2900, 650], [2700, 1150], [3000, 1600], [2450, 1900], [1850, 1650], [1400, 1950], [900, 1800], [500, 1450]]
  }
];
