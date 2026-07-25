// Everything a user can change lives here: login credentials, username, and preferences.
// One settings entry per user, linked by userId (no separate settingsId).
//
// Plaintext passwords (for testing only, never stored):
//   Eran: eran1234 | Omri: omri1234 | Yael: yael1234
//   Roni: roni1234 | Dana: dana1234 | Tal: tal1234

const settings = [
  {
    userId: 1,
    username: 'eranv',
    email: 'eran@unipathway.com',
    passwordSalt: '90a66f9fdf95e187d56397b189467e40',
    passwordHash: 'b763c1722c5df1c5badaee779fb85efc9cd6201e04366267796e3838917b51a9273ec9717bbc22bf8e8b5747fcb4409bbff95be3f2580e2c74ca36d45cf7062c',
    theme: 'light'
  },
  {
    userId: 2,
    username: 'omrih',
    email: 'omri@unipathway.com',
    passwordSalt: 'a71b78b08c9781da3d70695f29c24f1d',
    passwordHash: 'fc145ba12cf7900c9e235a16c1907d93a723eab1e37fee1dfb34666d5d1994189366c746cd8b69247c35735c496f3590d9dd526d076464de700477068310dfb1',
    theme: 'dark'
  },
  {
    userId: 3,
    username: 'yaell',
    email: 'yael@unipathway.com',
    passwordSalt: '8f5c63e4c362992c41f871105b7499ee',
    passwordHash: '42a51e6a523107db40dd4992b4ac569e8c17a91f13b5f12ec03798bde2b3208e4e9e90b4ce7c273366f25ba53fa49a15ee8db67f4bffa0cea89ab5d157452926',
    theme: 'light'
  },
  {
    userId: 4,
    username: 'ronib',
    email: 'roni@unipathway.com',
    passwordSalt: '20fd0720e805a0591612d72e3668462f',
    passwordHash: '624cce433d1fbd48cd7eac72f06176905f1cda9c73d7803febd2c890ea63ef15fe5606154dc62134618a70656b0bad00f3ba97294bc9f9951322104cc800bd59',
    theme: 'light'
  },
  {
    userId: 5,
    username: 'danac',
    email: 'dana@unipathway.com',
    passwordSalt: '9b31f6e15a10ad251e063385a912ba7e',
    passwordHash: '1ec74aabaf5dae0f62763949f5a1543967c827d6096b9c09729c08f9650d4b6eead2a98adf7e018fed377a8edbbf2c4bda0118e3b227db72604474e22228fa06',
    theme: 'dark'
  },
  {
    userId: 6,
    username: 'tals',
    email: 'tal@unipathway.com',
    passwordSalt: 'a448cec0a9613438fbd1b1a94dadbcce',
    passwordHash: '7337d180972c710bbaf3c69dcb4e7fc8c210cf7acd6bf246374a61300fba8d6db4a4382c79c33e5f18bb90e74277e2dab25396695b943ba537551c7bee24d8b3',
    theme: 'light'
  }
];

function getDefaultSettings(userId) {
  return { userId, username: null, email: null, passwordSalt: null, passwordHash: null, theme: 'light' };
}

module.exports = { settings, getDefaultSettings };
