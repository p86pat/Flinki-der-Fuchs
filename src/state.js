// Gemeinsamer, veränderlicher Spielzustand. Alle Module lesen/schreiben hier.
export const G = {
  state: 'title', // title | map | play | pause | quiz | done | win
  mapSel: 0, mapFrom: 0, mapT: 1, pauseSel: 0, record: false, quiz: null,
  time: 0, cam: 0, doneT: 0,
  levelIdx: 0, starsGot: 0, run: [],
  lvl: null,
  parts: [], msgs: []
};

export const P = { x: 0, y: 0, w: 34, h: 42, vx: 0, vy: 0, onGround: false, face: 1, coyote: 0, buffer: 0, inv: 0, sq: 0, bounced: false, walk: 0, rx: 0, ry: 0, climb: false, swim: false, plat: null };
