module.exports = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Auth0 - User Invitations - Change Password</title>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="shortcut icon" href="https://cdn.auth0.com/styleguide/4.8.10/lib/logos/img/favicon.png">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/styles/zocial.min.css">
  <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/manage/v0.3.1715/css/index.min.css">
  <link rel="stylesheet" type="text/css" href="https://cdn.auth0.com/styleguide/4.8.10/index.css">
  <% if (assets.customCss) { %><link rel="stylesheet" type="text/css" href="<%= assets.customCss %>" /><% } %>
</head>
<body class="a0-extension">
  <!-- Header -->
  <header class="dashboard-header">
    <nav role="navigation" class="navbar navbar-default">
      <div class="container">
        <div class="navbar-header">
          <h1 class="navbar-brand" style={{ paddingTop: 0 }}>
            <a href="http://manage.auth0.com/">
              <span>Auth0</span>
            </a>
          </h1>
        </div>
        <div id="navbar-collapse" class="collapse navbar-collapse">
          <ul class="nav navbar-nav navbar-right">
            <li>
              <a target="_blank" href="https://auth0.com/support">Help &amp; Support</a>
            </li>
            <li>
              <a target="_blank" href="https://auth0.com/docs">Documentation</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
  <!-- / Header -->

  <!-- Content -->
  <div class="container">
    <div id="form-wrapper" class="col-xs-12">
      <h1>Change Password</h1>
      <p>Congratulations, you have been invited. Please set a new password for your account.</p>
      <div id="form-area">Loading... </div>
    </div>
  </div>
  <!-- / Content -->
</body>
<script src="https://code.jquery.com/jquery-3.1.0.min.js" integrity="sha256-cCueBR6CsyA4/9szpPfrX3s49M9vUU5BgtiJj06wt/s=" crossorigin="anonymous"></script>
<script>
  var userData;
  var token;
  var messageElement;
  var wrapperElement = document.getElementById("form-wrapper");
  var formAreaElement;
  // document.getElementById("saveBtn").addEventListener("click", handleSubmit);


  function setMessage(element, message) {
    element["innerHTML"] = message;
  }

  function handleSubmit() {

    var password = document.getElementById("password").value;
    var retypePassword = document.getElementById("retype-password").value;

    if(password !== retypePassword) {
      messageElement = document.getElementById("message");
      setMessage(messageElement, "<div>Passwords do not <b>match</b>.</div>")
      return false;
    }

    $.ajax({
      url: "/api/changepassword",
      type: "POST",
      data: {
        "password": password,
        "id": userData.user_id,
        "token": token // token from params and not token from user
      },
      success: function(data) {
        setMessage(wrapperElement, "Password was set.");
      },
      error: function(error) {
        var errorObj = JSON.parse(error.responseText);
        if (errorObj && errorObj.message) {
          setMessage(wrapperElement, errorObj.message);
        }
      }
    });

    return false;
    // return true;
  }

  var formTemplate = '<div><%- formTemplate %></div>';


  $( document ).ready(function() {

    var url = window.location.href;
    var urlTokens = url.split("/");
    token = urlTokens[urlTokens.length - 1];

    $.ajax({
      url: "/api/changepassword?token=" + token,
      type: "PUT",
      success: function(data) {
        userData = data;
        formAreaElement = document.getElementById("form-area");
        setMessage(formAreaElement, formTemplate);
        // document.getElementById("saveBtn").addEventListener("click", handleSubmit);
      },
      error: function(error) {
        var errorObj = JSON.parse(error.responseText);
        if (errorObj && errorObj.message) {
          setMessage(wrapperElement, errorObj.message);
        }
      }
    });

  });
</script>
</html>`;
