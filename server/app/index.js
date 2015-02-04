// ~> Server
// ~A Scott Smereka

/*
 * Create, configure, and start the server.
 */

var app    = require("foxjs"),
    path   = require("path");

// Configuration file.
var Config = require(path.resolve(__dirname, "../configs/config.js"));

// Socket Handle
//************************ Added by Xiao for Demo*********************************
var enableSocket = function(app, db, config){
 if(config && config.socketio && config.socketio.enabled) {
	  var preMsg = "[DEMO-SMARTLINKDEVICE] -- ".yellow;
      	var Demo= db.model("Demo");
      	var sdl_core_dev = {};   // store connected devices to sdlcore
            app.io.sockets.on('connection', function (socket) {
 				var key = socket.handshake.address.address;
 				var msg = "SDL Core from " + key + " is connected to the SDL Server";
 				sdl_core_dev[key] = [];
 				console.log(preMsg + msg.blue);

 				socket.on('message', function(data){
 				});

   				socket.on('disconnect', function(){
	 				var key = socket.handshake.address.address;
	 				var msg = "SDL Core from " + key + " is disconnected to the SDL Server";
	 				console.log(preMsg + msg.blue);
	 				for (var i = 0; i < sdl_core_dev[key].length; i++){
	 					var dev = {};
						var name = sdl_core_dev[key][i];
						dev.name = name;
						dev.allowd = false;
	 	 				toogleOnline(dev, false, function(status){});
	 				}
				});

				socket.on('sdl_message', function(data){
 					var name;
		  			var devlist = [];
		  			var key = socket.handshake.address.address;
 					for (var i in data){
	 					var dev = {};
						if (data.hasOwnProperty(i)){
 							dev.name = data[i].name;
 							dev.allowed = data[i].allowed;
 							devlist.push(dev);
 							var info = data[i].allowed ? data[i].name + " is connected to the Core ------- Allowed" : data[i].name + " is connected to the Core -------- Not Allowed";
							info = preMsg + info.blue;
 							console.log(info);
 						}
 					}
		 			for (var i =0; i < devlist.length; i++){
		 				var newone = true;
		 				var dev = devlist[i];
		 				for(var j = 0; j < sdl_core_dev[key].length; j++){
		 					if (sdl_core_dev[key][j] == dev.name) {
		 						newone = false;
		 						break;
		 					}
		 				}
		 				if (newone) {
		 					sdl_core_dev[key].push(dev.name);
	 					}
	 				    toogleOnline(dev, true, function(status){
	 							dev.allowed = status;
								socket.emit('sdl_device_allowed', dev );
								info = dev.allowed ? "Allowed" : "Not Allowed";
	 							console.log(preMsg + dev.name + "   " + info.green + "  is sent back to SDL Core ");
	 					});
 					}
 				});
       		 });


			function toogleOnline(dev, status, fn){
	   		  var query = {name: dev.name};
	   		  rtdev={};
	   		  rtdev.name = dev.name;
	   		  rtdev.allowed = dev.allowed;

   			   Demo.findOne(query, function(err, dev){
					if(err) { next(err);}

					if(dev){
						fn(dev.allowable);
						dev.online = status;
						dev.save(function(err, dev){
							if (err) {next(err);}
							info = dev.name + " is put ";
							info_online =  dev.online ? "online" : "offline";
							console.log(preMsg + info.blue + info_online.blue);
						});
					} else {

						Demo.create({ name: rtdev.name,
											 description: "New Device",
											 allowable: rtdev.allowed,
											 online: true
											 }, function(err, newdev){
													if (err) { next(err);}
													info = "New device " + newdev.name + " is connected and put online";
													console.log(preMsg + info.blue);
											});
					}
				});
			}

       		app.io.route('ready', function(req){
       			req.io.emit('talk', {
       				message: 'io event from an io route on the server'
       		})
       		});
      }
};
//********************************** End of Xiao update******************************************


// Contains predefined methods used to manage the server instance.
var server = {

  // Setup and configure the server for use.
  install: function(app, db, config, log) {
    var installer;

    if (config.paths["serverInstallerLib"]) {
      var Installer = require(config.paths.serverInstallerLib);
      installer = new Installer(db, config, log);
    } else {
      return log.e("Invalid path or no path specified for paths.serverInstallerLib in the configuration object.");
    }

    installer.install(function (err, results) {
      if (err) {
        return log.e(err);
      }

      if(results) {
        log.s("Server installed successfully!");
      }
    });
  },

  uninstall: function(app, db, config, log) {
    var installer;

    if (config.paths["serverInstallerLib"]) {
      var Installer = require(config.paths.serverInstallerLib);
      installer = new Installer(db, config, log);
    } else {
      return log.e("Invalid path or no path specified for paths.serverInstallerLib in the configuration object.");
    }

    installer.uninstall(function (err, results) {
      if (err) {
        return log.e(err);
      }

      if(results) {
        log.s("Server uninstalled successfully!");
      }
    });
  },

  start: function(config, next) {
    var installServer = this.install,
        uninstallServer = this.uninstall;

    // Get the arguments from commandline.
    var args = process.argv.slice(2);

    // Perform any additional configuration of the server
    // before it starts loading routes and finishing up.

    app.start(config, function(err, app, db, config, server, fox, io) {
      if(err) {
        return console.log(err);
      }

      // Handle install flag in arguments.
      if(args.indexOf('-i') > -1) {
        installServer(app, db, config, fox.log);
      } else if(args.indexOf('-u') > -1) {
        uninstallServer(app, db, config, fox.log);
      }

      enableSocket(app,db, config);  // added by Xiao
    });

 },

  stop: function(config, next) {

    // Perform any additional tasks before the server
    // is shutdown.  Make them quick you only have
    // 4 seconds for this entire method to finish.

    // Gracefully shutdown the server.
    app.stop(next);
  }
};

// Handle messages sent to the server, such as start, stop, restart, etc.
app.message.handler(server);

// Start the server using the config.
server.start(new Config());