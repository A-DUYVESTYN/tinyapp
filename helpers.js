const getUserByEmail = function (findThisEmail, database) {
  for (const user in database) {
    if (database[user].email === findThisEmail) {
      return user
    }
  }
  return null
}

module.exports = {
  getUserByEmail
};
