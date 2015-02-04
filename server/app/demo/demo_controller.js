// ~> Controller
// ~A Scott Smereka

module.exports = function(app, db, config) {

  var fox    = require('foxjs'),
      sender = fox.send,
      auth   = fox.authentication,
      model  = fox.model,
      User   = db.model('User');                                     // Pull in the user schema

	var Demo= db.model("Demo");

  /* ************************************************** *
   * ******************** Routes and Permissions
   * ************************************************** */

  app.get('/demos.:format', read);

  app.get('/demos/:id.:format', getById);


  // Load user roles used for authentication.
  var adminRole = auth.queryRoleByName("admin"),
      selfRole  = auth.queryRoleByName("self");


  /* ************************************************** *
   * ******************** Route Methods
   * ************************************************** */

  function read(req, res, next) {

    Demo.find().exec(function(err, devices) {
      if(err) return next(err);

	 console.log(devices);

      sender.setResponse(devices, req, res, next);
    });
  }

  function getById(req, res, next) {
    Demo.findById(req.params.id).exec(function(err, device) {
      if(err) return next(err);

      sender.setResponse(device, req, res, next);
    });
  }


};