// Helpers
function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function yearsFracActualActualWithTime(start: Date, end: Date) {
  let s = new Date(start.getTime());
  let e = new Date(end.getTime());

  if (e < s) [s, e] = [e, s]; // ensure s <= e

  let total = 0;

  for (let year = s.getFullYear(); year <= e.getFullYear(); year++) {
    const yearStart = new Date(year, 0, 1, 0, 0, 0, 0); // local midnight
    const yearEnd = new Date(year + 1, 0, 1, 0, 0, 0, 0); // start of next year

    const periodStart = s > yearStart ? s : yearStart;
    const periodEnd = e < yearEnd ? e : yearEnd;

    if (periodEnd <= periodStart) continue;

    const ms = periodEnd.getTime() - periodStart.getTime();
    const msPerYear = (isLeapYear(year) ? 366 : 365) * 24 * 60 * 60 * 1000;

    total += ms / msPerYear;
  }

  return total;
}

function setupAgeClock() {
  const ageClock = document.getElementById("age")!;
  const birthday = new Date("2009-04-20T00:00:00Z");

  let lastUpdate = 0;

  function frame(now: number) {
    if (now - lastUpdate >= 100) {
      // ~10 fps
      const age = yearsFracActualActualWithTime(birthday, new Date());
      ageClock.textContent = age.toFixed(10);
      lastUpdate = now;
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

setupAgeClock();

// Code taken from unknown source.

function setupRotatingCube() {
  const container = document.getElementById("ascii-container");

  // --- Configuración de la animación ---
  const WIDTH = 80;
  const HEIGHT = 80;

  const ASPECT_CORRECTION = 0.6; //  para que el cubo se vea cuadrado.

  const ASCII_CHARS = [
    " ",
    ".",
    ",",
    "-",
    "=",
    "+",
    "o",
    "*",
    "#",
    "$",
    "@",
    "X",
  ];

  let angleX = 0;
  let angleY = 0;

  // --- Definición del Cubo ---
  const CUBE_SCALE = 20;
  const vertices = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1], // 0, 1, 2, 3 (Frente)
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1], // 4, 5, 6, 7 (Atrás)
  ].map((v) => v.map((coord) => coord * CUBE_SCALE));

  const faces = [
    { indices: [0, 1, 2, 3], colorRange: [8, 11] }, // Frente ('#' a '@')
    { indices: [4, 5, 6, 7], colorRange: [0, 3] }, // Atrás (' ' a '-')
    { indices: [0, 4, 7, 3], colorRange: [3, 6] }, // Izquierda ('-' a '+')
    { indices: [1, 5, 6, 2], colorRange: [6, 9] }, // Derecha ('+' a '*')
    { indices: [0, 1, 5, 4], colorRange: [10, 12] }, // Abajo ('$' a 'X')
    { indices: [3, 2, 6, 7], colorRange: [4, 7] }, // Arriba ('=' a 'o')
  ];

  // ** RESTAURADA LA DEFINICIÓN CORRECTA DE LAS ARISTAS POR ÍNDICES DE VÉRTICES **
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0], // Cara frontal
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4], // Cara trasera
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7], // Conexiones entre caras
  ];

  // --- Funciones de Transformación 3D ---
  function rotateX(p: number[], angle: number): number[] {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [p[0], p[1] * cos - p[2] * sin, p[1] * sin + p[2] * cos];
  }

  function rotateY(p: number[], angle: number): number[] {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [p[0] * cos + p[2] * sin, p[1], -p[0] * sin + p[2] * cos];
  }

  function project(p: number[]): number[] {
    const focalLength = 300;
    const z = p[2] + focalLength;
    const scale = focalLength / z;
    return [p[0] * scale, p[1] * scale * ASPECT_CORRECTION, p[2]];
  }

  // --- Bucle de Animación ---
  function animate() {
    const frameBuffer = Array(HEIGHT)
      .fill(null)
      .map(() => Array(WIDTH).fill(" "));
    const zBuffer = Array(HEIGHT)
      .fill(null)
      .map(() => Array(WIDTH).fill(Infinity));

    angleX += 0.02;
    angleY += 0.03;

    const transformedVertices: number[][] = [];
    const projectedVertices: number[][] = [];

    for (const v of vertices) {
      let rotatedV = rotateX(v, angleX);
      rotatedV = rotateY(rotatedV, angleY);
      transformedVertices.push(rotatedV);
      projectedVertices.push(project(rotatedV));
    }

    const sortedFaces = faces
      .map((face) => {
        let avgZ = 0;
        for (const vertexIndex of face.indices) {
          avgZ += transformedVertices[vertexIndex][2];
        }
        return { faceData: face, avgZ: avgZ / face.indices.length };
      })
      .sort((a, b) => b.avgZ - a.avgZ);

    for (const { faceData, avgZ } of sortedFaces) {
      const faceIndices = faceData.indices;

      // Seleccionar el rango de caracteres para esta cara
      const [minCharIndex, maxCharIndex] = faceData.colorRange;
      const rangeSize = maxCharIndex - minCharIndex + 1;

      // Simular un brillo uniforme dentro del rango
      const charIndex = Math.floor(minCharIndex + rangeSize / 2); // Carácter del medio del rango
      const faceChar = ASCII_CHARS[charIndex];

      const polyPoints = faceIndices.map((idx) => {
        const px = projectedVertices[idx][0] + WIDTH / 2;
        const py = projectedVertices[idx][1] + HEIGHT / 2;
        return { x: px, y: py, z: projectedVertices[idx][2] };
      });

      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      for (const p of polyPoints) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      }

      minX = Math.floor(Math.max(0, minX));
      minY = Math.floor(Math.max(0, minY));
      maxX = Math.ceil(Math.min(WIDTH - 1, maxX));
      maxY = Math.ceil(Math.min(HEIGHT - 1, maxY));

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          if (isPointInPolygon({ x: x, y: y }, polyPoints)) {
            const currentZ = avgZ;
            if (currentZ < zBuffer[y][x]) {
              frameBuffer[y][x] = faceChar;
              zBuffer[y][x] = currentZ;
            }
          }
        }
      }
    }

    // --- Dibujar aristas sobre el relleno ---
    for (const [v1Index, v2Index] of edges) {
      const p1 = projectedVertices[v1Index];
      const p2 = projectedVertices[v2Index];

      const x1 = Math.floor(p1[0] + WIDTH / 2);
      const y1 = Math.floor(p1[1] + HEIGHT / 2);
      const x2 = Math.floor(p2[0] + WIDTH / 2);
      const y2 = Math.floor(p2[1] + HEIGHT / 2);

      const dx = Math.abs(x2 - x1);
      const dy = Math.abs(y2 - y1);
      const sx = x1 < x2 ? 1 : -1;
      const sy = y1 < y2 ? 1 : -1;
      let err = dx - dy;

      let x = x1;
      let y = y1;

      while (true) {
        if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
          const edgeChar = "#";
          const currentLineZ = Math.min(p1[2], p2[2]);

          if (currentLineZ < zBuffer[y][x] || frameBuffer[y][x] === " ") {
            frameBuffer[y][x] = edgeChar;
            zBuffer[y][x] = currentLineZ;
          }
        }

        if (x === x2 && y === y2) break;
        const e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x += sx;
        }
        if (e2 < dx) {
          err += dx;
          y += sy;
        }
      }
    }

    if (container) {
      container.textContent = frameBuffer.map((row) => row.join("")).join("\n");
    }
    requestAnimationFrame(animate);
  }

  function isPointInPolygon(p: {x: number, y: number}, polygon: {x: number, y: number}[]) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;

      const intersect =
        yi > p.y !== yj > p.y &&
        p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  animate();
}

setupRotatingCube();
