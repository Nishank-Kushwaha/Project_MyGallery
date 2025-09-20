const fs = require("fs");
const path = require("path");
const rootDir = require("../utils/pathUtil");

const filePath = path.join(rootDir, "data", "users.json");

module.exports = class Users {
  constructor(userData) {
    this.userData = userData;
  }

  save(callback) {
    Users.fetchAll((usersArray) => {
      usersArray.push(this.userData);
      fs.writeFile(filePath, JSON.stringify(usersArray), (err) => {
        if (err) {
          console.log("Error saving user:", err);
          if (callback) callback(false);
        } else {
          if (callback) callback(true);
        }
      });
    });
  }

  static fetchAll(callback) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // File might not exist → start fresh
        return callback([]);
      }
      try {
        const usersArray = data.length > 0 ? JSON.parse(data) : [];
        callback(usersArray);
      } catch (e) {
        console.log("JSON parse error:", e);
        callback([]);
      }
    });
  }

  static fetchByEmailandPassword(email, password, callback) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return callback(null); // no user
      }
      try {
        const usersArray = data.length > 0 ? JSON.parse(data) : [];
        const user = usersArray.find(
          (u) => u.email === email && u.password === password
        );
        callback(user || null); // return matched user or null
      } catch (e) {
        console.log("JSON parse error:", e);
        callback(null);
      }
    });
  }
};
