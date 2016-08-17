const uuid = require('uuid');
const csv = require('csv');
const each = require('each-async');
const Email = require('./email');
const getChangePassURL = require('./get-change-password-url');

import _ from 'lodash';
import { Router as router } from 'express';
import { managementClient } from '../lib/middlewares';
import config from './config';
import logger from './logger';

var email = null;

/*
 * List all users.
 */
function getUsers(options, callback) {
  const auth0Options = {
    sort: 'last_login:-1',
    q: `app_metadata.invite.status:${options.filter}`,
    per_page: options.perPage || 100,
    page: options.page || 0,
    include_totals: true,
    fields: 'user_id,name,email,app_metadata',
    search_engine: 'v2'
  };

  options.auth0.users.getAll(auth0Options, function onGetUsers(err, result) {
    if (err) {
      logger.debug('Error getting users:', err);
      return callback(err);
    }
    return callback(null, {
      result,
      filter: options.filter
    });
  });
};

/*
 * Add a new user.
 */
function createUser(options, callback) {
  const token = uuid.v4();
  const auth0Options = {
    "connection": options.connection,
    "email": options.email,
    "password": uuid.v4(), // required field
    "app_metadata": {
      "invite": {
        "status": "pending", // default status
        "token": token
      }
    }
  };
  let changePasswordURL = getChangePassURL(config('NODE_ENV'), options.host, token);
  let transportOptions = {
    to: auth0Options.email
  };
  let templateData = {
    name: 'Auth0 Customer',
    email: auth0Options.email,
    url: changePasswordURL
  };

  let result = null;
  return options.auth0.users.create(auth0Options, function onCreateUser(err, user) {
    result = user;
    if (err) {
      logger.debug('Error creating user', err);
      return callback({ error: err ? err : 'There was an error when creating the user.' });
    }
    email.sendEmail(transportOptions, templateData, function (err, emailResult) {
      if (err) {
        logger.debug('Error sending email', err);
        return callback({ error: err ? err : 'There was an error when sending the email.' });
      }
      return callback(null, result);
    });
  });
}

/*
 * Updates user "email_verified" field.
 */
const updateEmailVerified = (auth0, user, callback) => {

  return auth0.users.update(
    { id: user.user_id },
    {
      "email_verified": true
    })
    .then(user => {
      if (!user) {
        return callback({ error: 'There was a problem when updating the user email_verified field.' });
      }
      return callback(null, user);
    })
    .catch(callback);
}

const validateToken = (auth0, token, callback) => {

  const options = {
    sort: 'last_login:-1',
    q: `app_metadata.invite.token:${token}`,
    include_totals: false,
    fields: 'user_id,email,email_verified,app_metadata',
    search_engine: 'v2'
  };

  return auth0.users.get(options)
    .then(users => {
      if (!users || !users.length || users.length !== 1) {
        return callback({ error: 'Token is invalid or user was not found.' });
      }
      return callback(null, users[0]);
    })
    .catch(callback);
}

/*
 * Validates user token.
 */
function validateUserToken(options, callback) {
  validateToken(options.auth0, options.token, function (err, user) {
    if (err || !user) {
      return callback({ error: (err.error) ? err.error : 'There was an error when validating the token.' });
    }

    if (user.email_verified) {
      return callback(null, user);
    }

    updateEmailVerified(options.auth0, user, function (err, result) {
      if (err) {
        return callback({ error: (err.error) ? err.error : 'There was an error when updating field.' });
      }
      return callback(null, result);
    });
  });
}

/*
 * Updates user with a new password. This also removes token and updates status.
 */
function savePassword(options, callback) {
  validateToken(options.auth0, options.token, function (err, user) {
    if (err || !user || user.user_id !== id) {
      return callback({ error: (err.error) ? err.error : 'There was an error when saving the user.' });
    }

    return req.auth0.users.update(
      { id: id },
      {
        "password": password,
        "app_metadata": {
          "invite": {
            "status": "accepted"
          }
        }
      }, function onUpdateUser(err, user) {
        if (err || !user) {
          return callback({ error: (err && err.error) ? err.error : 'There was an error when saving the user.' });
        }
        return callback(null);
      });
  });
}

const configureEmail = (emailTransport, templates) => {
  email = new Email(emailTransport, templates);
};

module.exports = {
  getUsers: getUsers,
  createUser: createUser,
  validateUserToken: validateUserToken,
  savePassword: savePassword,
  configureEmail
};
