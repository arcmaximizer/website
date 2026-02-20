// Helpers
function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function yearsFracActualActualWithTime(start: Date, end: Date) {
  // Work with copies so we don't mutate inputs
  let s = new Date(start.getTime());
  let e = new Date(end.getTime());

  if (e < s) [s, e] = [e, s]; // ensure s <= e

  let total = 0;

  for (let year = s.getFullYear(); year <= e.getFullYear(); year++) {
    const yearStart = new Date(year, 0, 1, 0, 0, 0, 0);          // local midnight
    const yearEnd   = new Date(year + 1, 0, 1, 0, 0, 0, 0);      // start of next year

    const periodStart = s > yearStart ? s : yearStart;
    const periodEnd   = e < yearEnd ? e : yearEnd;

    if (periodEnd <= periodStart) continue;

    const ms = periodEnd.getTime() - periodStart.getTime();
    const msPerYear = (isLeapYear(year) ? 366 : 365) * 24 * 60 * 60 * 1000;

    total += ms / msPerYear;
  }

  return total;
}

function setupAgeClock() {
  const ageClock = document.getElementById("age")!
  const birthday = new Date("2009-04-20T00:00:00Z")
  
  let lastUpdate = 0; // ms since page load

  function frame(now: number) {
    // now is high‑res time since page load
    if (now - lastUpdate >= 100) { // ~10 fps
      const age = yearsFracActualActualWithTime(birthday, new Date());
      ageClock.textContent = age.toFixed(10);
      lastUpdate = now;
    }
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

setupAgeClock()