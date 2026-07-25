// Immutable identity fields only. Anything the user can change
// (email, password, theme, language, notifications) lives in settingsData.js.

const users = [
  // Admins
  { userId: 1, firstName: 'Eran',  lastName: 'Vazana',       createDate: '2024-01-10T10:00:00.000Z', updateDate: '2024-01-10T10:00:00.000Z', userRole: 'admin'  },
  { userId: 2, firstName: 'Omri',  lastName: 'Hershkovich',  createDate: '2024-01-11T09:30:00.000Z', updateDate: '2024-01-11T09:30:00.000Z', userRole: 'admin'  },

  // Editors
  { userId: 3, firstName: 'Yael',  lastName: 'Levi',         createDate: '2024-02-01T08:00:00.000Z', updateDate: '2024-02-01T08:00:00.000Z', userRole: 'editor' },
  { userId: 4, firstName: 'Roni',  lastName: 'Bar',          createDate: '2024-02-15T11:00:00.000Z', updateDate: '2024-02-15T11:00:00.000Z', userRole: 'editor' },

  // Regular users
  { userId: 5, firstName: 'Dana',  lastName: 'Cohen',        createDate: '2024-03-05T14:20:00.000Z', updateDate: '2024-03-05T14:20:00.000Z', userRole: 'user'   },
  { userId: 6, firstName: 'Tal',   lastName: 'Shapira',      createDate: '2024-03-10T16:45:00.000Z', updateDate: '2024-03-10T16:45:00.000Z', userRole: 'user'   }
];

let nextId = 7;
function getNextId() { return nextId++; }

module.exports = { users, getNextId };
