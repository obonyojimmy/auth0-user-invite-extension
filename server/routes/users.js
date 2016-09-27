import users from '../lib/users';

function getUsersHandler(req, res, next) {
  const options = {
    auth0: req.auth0,
    filter: req.query.filter,
    perPage: req.query.per_page,
    page: req.query.page
  };
  users.getUsers(options, function onGetUsers(err, result) {
    if (err) {
      return (err && err.statusCode) ? res.status(err.statusCode).send(err.message) : res.status(500).send(err);
    }
    return res.json(result);
  });
}

function createUserHandler(req, res, next) {
  const options = {
    auth0: req.auth0,
    connection: req.body.user.connection,
    email: req.body.user.email,
    username: req.body.user.username,
    host: req.get('host')
  };
  users.createUser(options, function onCreateUser(err, result) {
    if (err) {
      return (err && err.statusCode) ? res.status(err.statusCode).send(err.message) : res.status(500).send(err);
    }
    return res.json(result);
  });
}

function validateUserTokenHandler(req, res, next) {
  const options = {
    auth0: req.auth0,
    token: req.query.token
  };
  users.validateUserToken(options, function onValidateToken(err, result) {
    if (err) {
      return (err && err.statusCode) ? res.status(err.statusCode).send(err.message) : res.status(500).send(err);
    }
    return res.json(result);
  });
}

function savePasswordHandler(req, res, next) {
  const options = {
    auth0: req.auth0,
    id: req.body.id,
    password: req.body.password,
    token: req.body.token
  };
  users.savePassword(options, function onSavePassword(err, result) {
    if (err) {
      return (err && err.statusCode) ? res.status(err.statusCode).send(err.message) : res.status(500).send(err);
    }
    return res.send(result);
  });
}

module.exports = {
  getUsersHandler,
  createUserHandler,
  validateUserTokenHandler,
  savePasswordHandler
};
