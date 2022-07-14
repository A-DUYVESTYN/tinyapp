const getUserByEmail = function(findThisEmail, database) {
  for (const user in database) {
    if (database[user].email === findThisEmail) {
      return user;
    }
  }
  return null;
};

const generateRandomString = function() {
  let length = 6;
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const checkLoginByUserId = function(userId, database) {
  for (const user in database) {
    if (user === userId) return true;
  }
  return false;
};

const urlsForUser = function(currentUserId, database) {
  const usersUrls = [];
  for (const urlID in database) {
    if (database[urlID].userID === currentUserId) {
      usersUrls.push(urlID);
    }
  }
  // create object with user's urls, in database format
  return Object.fromEntries(usersUrls.map(key => [key, database[key]]));
};


module.exports = {
  getUserByEmail,
  generateRandomString,
  checkLoginByUserId,
  urlsForUser
};
