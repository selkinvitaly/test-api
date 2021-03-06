"use strict";

const app = require('../app');
const request = require('request-promise');

var User = require('../models/user');

function getURL(path) {
  return `http://localhost:3000/test${path}`;
}

describe("User CRUD", function() {

  let existingUserData = {
    _id: "573f1b79a5fe781a82f4394e",
    fullName: "John Bull",
    avatarUrl: "http://avatar.com/john.jpg",
    email: "john@test.ru",
    birthdate: new Date(2015, 1, 1).toJSON(),
    gender: 'M',
    address: 'address john'
  };

  let newUserData = {
    fullName: "Alice Cooper",
    avatarUrl: "http://avatar.com/alice.jpg",
    email: "alice@test.ru",
    birthdate: new Date(2016, 1, 1).toJSON(),
    gender: 'F',
    address: 'address alice'
  };
  let existingUser;

  before(function() {
    app.start();
  });

  after(function() {
    app.stop();
  });

  // load fixtures
  beforeEach(function*() {
    yield User.remove({});
    existingUser = yield User.create(Object.assign({namespace: 'test'}, existingUserData));
  });

  describe("POST /users", function() {
    it("creates a user", function*() {
      let response = yield request.post({
        url:    getURL('/users'),
        json:   true,
        body:   newUserData
      });
      delete response._id;
      response.should.be.eql(newUserData);
    });

    it("returns a validation error in case of bad data", function*() {
      let response = yield request.post({
        url:    getURL('/users'),
        json:   true,
        resolveWithFullResponse: true,
        simple: false,
        body:   {
          // let's try empty
        }
      });

      response.statusCode.should.eql(400);
      response.body.errors.email.should.exist;
      response.body.errors.fullName.should.exist;
    });

  });

  describe("GET /users/:user", function() {
    it("returns the user", function*() {
      let response = yield request.get({
        url:    getURL('/users/' + existingUser.id),
        json:   true
      });
      response.should.be.eql(existingUserData);
    });

    it("returns 404 when no such user", function*() {
      let response = yield request.get({
        url:    getURL('/users/no-such-user'),
        resolveWithFullResponse: true,
        simple: false,
        json:   true
      });
      response.statusCode.should.eql(404);
    })
  });

  describe("GET /users", function() {
    it("returns all users", function*() {
      let response = yield request.get({
        url:    getURL('/users'),
        json:   true
      });
      response.should.be.eql([existingUserData]);
    });
  });

});
