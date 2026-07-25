// status (user intent):   'Interested' | 'Applied'
// sekemStatus (server):   'passed-required-acceptance-score' | 'below-required-acceptance-score' | 'no-data'
// userSekem (server):     calculated Sekem score for this user + department, or null if no data
//
// Values are recalculated automatically whenever academic scores or watchlist
// entries are created/updated through the API.
//
// Reference sekems (new formula — bagrut 0-100, psychometric 200-800):
//   Dana (5): Law=442.25, Psych=442.25, Comm=388.55
//   Tal  (6): CS@BGU=486.31, CS@TAU=518.67, SE@Tech=539.61, IE@BGU=486.31

const userWatchlist = [
  // Dana (userId 5 — verbal profile)
  { watchlistId: 1, userId: 5, departmentId: 6, status: 'Interested', sekemStatus: 'passed-required-acceptance-score', userSekem: 437.85 }, // Law     vs minSekem 430
  { watchlistId: 2, userId: 5, departmentId: 7, status: 'Applied',    sekemStatus: 'below-required-acceptance-score',  userSekem: 437.85 }, // Psych   vs minSekem 445
  { watchlistId: 3, userId: 5, departmentId: 9, status: 'Interested', sekemStatus: 'below-required-acceptance-score',  userSekem: 388.55 }, // Comm    vs minSekem 400

  // Tal (userId 6 — quantitative profile)
  { watchlistId: 4, userId: 6, departmentId: 1, status: 'Applied',    sekemStatus: 'passed-required-acceptance-score', userSekem: 480.31 }, // CS@BGU  vs minSekem 460
  { watchlistId: 5, userId: 6, departmentId: 2, status: 'Interested', sekemStatus: 'passed-required-acceptance-score', userSekem: 512.17 }, // CS@TAU  vs minSekem 500
  { watchlistId: 6, userId: 6, departmentId: 4, status: 'Interested', sekemStatus: 'passed-required-acceptance-score', userSekem: 527.55 }, // SE@Tech vs minSekem 510
  { watchlistId: 7, userId: 6, departmentId: 5, status: 'Applied',    sekemStatus: 'passed-required-acceptance-score', userSekem: 480.31 }  // IE@BGU  vs minSekem 425
];

let nextId = 8;
function getNextId() { return nextId++; }

module.exports = { userWatchlist, getNextId };