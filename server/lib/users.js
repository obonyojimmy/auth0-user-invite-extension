const uuid = require('uuid');
const csv = require('csv');
const each = require('each-async');
const Email = require('./email');

import _ from 'lodash';
import { Router as router } from 'express';
import { managementClient } from '../lib/middlewares';

var email = null;

/*
 * List all users.
 */
const getUsers = () => {
  return (req, res, next) => {
    const options = {
      sort: 'last_login:-1',
      q: `app_metadata.invite.status:${req.query.filter}`,
      per_page: req.query.per_page || 100,
      page: req.query.page || 0,
      include_totals: true,
      fields: 'user_id,name,email,app_metadata',
      search_engine: 'v2'
    };

    return req.auth0.users.getAll(options)
      .then(result => res.json({
        result,
        filter: req.query.filter
      }))
      .catch(next);
  }
};

/*
 * Add a new user.
 */
const createUser = () => {
  return (req, res, next) => {
    const token = uuid.v4();
    const options = {
      "connection": req.body.user.connection,
      "email": req.body.user.email,
      "password": uuid.v4(), // required field
      "app_metadata": {
        "invite": {
          "status": "pending", // default status
          "token": token
        }
      }
    };
    let transportOptions = {
      to: options.email
    };
    let templateData = {
      name: 'Auth0 Customer',
      token: token
    };

    let result = { emailSent: false, user: null };
    return req.auth0.users.create(options, function onCreateUser(err, user) {
      result.user = user;
      if (err) {
        return next(err, result);
      }
      email.sendEmail(transportOptions, templateData, function (err, emailResult) {
        if (err) {
          return next(err, result);
        }
        result.emailSent = true;
        return next(null, result);
      });
    });
  }
};

/*
 * Validates user token.
 */
const validateUserToken = () => {
  return (req, res, next) => {

    let token = req.query.token;

    const options = {
      sort: 'last_login:-1',
      q: `app_metadata.invite.token:${token}`,
      include_totals: false,
      fields: 'user_id,email,app_metadata',
      search_engine: 'v2'
    };

    return req.auth0.users.get(options)
      // .then(user => res.json({ user }))
      .then(result => {
        if (!result || !result.length || result.length !== 1) {
          return res.status(500).send('Token is invalid or user was not found.');
        }
        return res.json(result[0]);
      })
      .catch(next);
  }
};

/*
 * Updates user with a new password. This also removes token and updates status.
 */
const savePassword = () => {
  return (req, res, next) => {

    let id = req.body.user.id;
    let password = req.body.user.password;
    let token = req.body.user.token; // TODO: confirm if we need to use it again

    req.auth0.users.update(
      { id: id },
      {
        "password": password,
        // "email_verified": true,
        "app_metadata": {
          "invite": {
            "status": "accepted"
          }
        }
      })
      .then(user => {
        if (!user) {
          return res.status(500).send('There was a problem when saving the user.');
        }
        return res.sendStatus(200);
      })
      .catch(next);
  }
};

const configureEmail = (emailTransport, templates) => {
  email = new Email(emailTransport, templates);
};

module.exports = {
  getUsers,
  createUser,
  validateUserToken,
  savePassword,
  configureEmail
};
