var express = require('express');
// @link https://github.com/jshttp/accepts
var accepts = require('accepts')
var bodyParser = require('body-parser');
// @link https://www.npmjs.com/package/compression
var compression = require('compression');
var cookieParser = require('cookie-parser');
// @link https://www.npmjs.com/package/cors
var cors = require('cors');
var favicon = require('serve-favicon');

// @link http://momentjs.com
var moment = require('moment');


// @link https://github.com/expressjs/multer
// @description Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. 
var multer = require('multer');

// attachment = multer({ dest: 'public/attachments/' });
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        //var arrFile = file.originalname.split('.');
        //console.log(arrFile.length);
        //console.log(arrFile[arrFile.length-1]);
        
        //cb(null, file.fieldname + '-' + Date.now() + '.' + arrFile[arrFile.length - 1])
        
        // rewrite previous one, if the file name same
        cb(null, moment().format('YYYYMMDDhhmmss') + "___" + file.originalname);
    }
});

upload = multer({ storage: storage });


var path = require('path');

// @link http://paularmstrong.github.io/swig/
// @link https://www.npmjs.com/package/swig
var swig = require('swig');
// @link https://www.npmjs.com/package/node-uuid
var uuid = require('node-uuid');

// @link https://github.com/expressjs/vhost
var vhost = require('vhost');


// @link https://www.npmjs.com/package/express-session
var session = require('express-session')
var FileStore = require('session-file-store')(session);

// @link https://www.npmjs.com/package/log4js
var log4js = require('log4js');
//log4js.configure('./log4js.json');
log4js.configure({
    "appenders": [
        {
            "type": "console"
        },
        {
            "type": "dateFile",
            "filename": "logs/jccwebserver.log",
            "pattern": "_yyyy-MM-dd",
            "alwaysIncludePattern": false,
            "layout": {
                "type": "pattern",
                "pattern": "%d{ISO8601} %m"
            },
            "category": "logFile"
        }
    ],
    "levels": {
        "[all]": "TRACE",
        "logFile": "TRACE",
        "category2": "WARN"
    },
    "replaceConsole": true
});
logger = log4js.getLogger("logFile");


ErrorLevel = {
    FATAL: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
    TRACE: 5
};

_spaceLoop = function (n) {
    var space = "";
    for (var i = 0; i < n; i++)
        space += "\t";
    return (space);
}


checkAuth = function (req, res, next) {
    // @link http://stackoverflow.com/questions/6331776/accessing-express-js-req-or-session-from-jade-template
    
    //logger.info(_spaceLoop(ErrorLevel.INFO), "oracle auth check index");
    // @link http://stackoverflow.com/questions/25463423/res-sendfile-absolute-path
    if (req.session.username === undefined) {
        res.status(401).sendFile(path.join(__dirname, '/public', '401.html'));
    } 
    else {
        //console.log(req.method);
        var field_name = "";
        switch (req.method.toUpperCase()) {
            case "GET":
                field_name = "select_";
                break;
            case "POST":
                field_name = "insert_";
                break;
            case "PUT":
                field_name = "update_";
                break;
            case "DELETE":
                field_name = "delete_";
                break;
        }
        
        // NOTE: move from "action_name" to "baseUrl" variable, because of continue testing caused global variable polluted
        //logger.info(_spaceLoop(ErrorLevel.INFO), "req.baseUrl: " + req.baseUrl);
        var baseUrl = req.baseUrl;
        baseUrl = baseUrl.replace("/", "");
        
        // got some error on continue testing (loop)
        var sql = "SELECT id FROM permissions WHERE name = '" + baseUrl + "'";
        
        sql = "SELECT group_id FROM groups_permissions WHERE permission_id IN (" + sql + ") AND " + field_name + " = 1";
        
        sql = "SELECT * FROM groups_users WHERE group_id IN (" + sql + ") AND user_id = " + req.session.user_id;
        //logger.info(_spaceLoop(ErrorLevel.INFO), sql);
        
        db.query(sql, function (err, recordset) {
            if (err) logger.error(_spaceLoop(ErrorLevel.ERROR) + err['message']);
            
            //logger.fatal(_spaceLoop(ErrorLevel.FATAL), 'record:' + recordset.length);
            if (recordset.length > 0) {
                next();
            }
            else {
                //next();
                if (req.xhr == true) res.status(403).send('FORBIDDEN');
                else {
                    //console.log(path.join(__dirname, '/public', '403.html'));
                    res.status(403).sendFile(path.join(__dirname, '/public', '403.html'));
                }
                //logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
            }
        });
    }
};

checkSession = function (req, res, next) {
    if (req.session.username === undefined) {
        res.status(401).sendFile(path.join(__dirname, '/public', '401.html'));
    } 
    else {
        next();
    }
};

get_db_datetime = function () {
    switch (config.dbms) {
        case 'mssql':
            return "'" + getDateTime() + "'";
            break;
        case 'oracle':
            return "to_date('" + getDateTime() + "', 'YYYY-MM-DD HH24:MI:SS')";
            break;
        case 'sqlite':
            return "datetime('now')";
            break;
    }
}

// @link http://stackoverflow.com/questions/5878682/node-js-hash-string
generateHash = function (value) {
    var crypto = require('crypto');
    var hash = crypto.createHash('md5').update(value).digest('hex');
    //console.log('%s %s', value, hash);
    return hash;
}

time_started = " 00:00:00";
time_ended = " 23:59:59";

config = require('./jccwebserver.json');
// MUST BE after load jccwebserver.json
db = require("./db");


// run-time configuration and rewrite json file
/*
var jsonfile = require('jsonfile')
jsonfile.spaces = 4;
var file = 'jccwebserver.json'
config.message_protocol = "udp";
jsonfile.writeFileSync(file, config)
*/

//#region sequelize
// @link http://sequelize.readthedocs.org/en/1.7.0/docs/usage/#options
var Sequelize = require('sequelize');
//var sequelize = new Sequelize('spc', 'sa', 'fgas147', {
sequelize = new Sequelize(null, null, null, {
    host: config.db_sqlite_config.server,
    dialect: 'sqlite',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    logging: false,
    // SQLite only
    storage: config.db_sqlite_config.storage
});

Group = sequelize.import("./models/groups");
Permission = sequelize.import("./models/permissions");
User = sequelize.import("./models/users");

Session = sequelize.import("./models/sessions");

Plan = sequelize.import("./models/plans");
Project = sequelize.import("./models/projects");

GroupUser = sequelize.import("./models/groups_users");
GroupPermission = sequelize.import("./models/groups_permissions");

Member = sequelize.import("./models/members");
Module = sequelize.import("./models/modules");

ModuleUser = sequelize.import("./models/modules_users");

Item = sequelize.import("./models/items");
Attachment = sequelize.import("./models/attachments");
Issue = sequelize.import("./models/issues");

Task = sequelize.import("./models/tasks");
//#endregion


/////////////////////////////////

// 2015-10-22 important global variable ??? WHY TO DO SO.
//var app = express();
app = express();

app.set('config', config);
app.locals.config = app.get('config');

var domain_name = config['web']['domain'];
if (config['url_address'] == "ip") domain_name = config['web']['host'];
app.set('domain_name', domain_name);
app.locals.domain_name = app.get('domain_name');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// use swig view engine
app.engine('html', swig.renderFile);
app.set('view engine', 'html');

// @link http://paularmstrong.github.io/swig/docs/#express
swig.setDefaults({ cache: false });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// GZIP all assets
app.use(compression());
app.use(cookieParser());
// CORS
app.use(cors());
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// @link https://www.npmjs.com/package/session-file-store
app.use(session({
    name: 'jcc_sid',
    store: new FileStore(config.session_stores.file),
    secret: 'jcc',
    resave: true,
    saveUninitialized: true
}));

// NOTE: pass session variable to view
app.use(function (req, res, next) {
    res.locals.session = req.session;
    //app.locals.query = req.query;
    
    next();
});

// review this code setting, izzit necessary?
app.locals.layout = 'default';

action_name = '';
app.use(function (req, res, next) {
    var accept = accepts(req)
    
    app.locals.layout = 'default';
    
    if (accept.types().length > 0) {
        //logger.info('accept.types()[0]:', accept.types()[0]);
        switch (accept.types()[0]) {
            case 'text/html':
                // NOTE: check: might be caused global variable polluted? if failed move back node.js local controller!
                if (req.xhr == true) app.locals.layout = 'ajax';
                //logger.fatal(_spaceLoop(ErrorLevel.FATAL), req.method + ' ' + req.url + ' (' + app.locals.layout + ')');
                
                http://www.w3schools.com/jsref/jsref_split.asp
                //var url = req.url;
                    var url = req.path;
                var actions = url.split("/", 2)
                
                app.locals.action_name = actions[1];
                //logger.info('action_name:', actions[1]);
                action_name = actions[1];
                //console.log('action_name:' + action_name);
                break;
            case 'application/json':
                // NOTE: don't merge the case, because of action_name will be overwrite with 'javascript'
                if (req.xhr == true) app.locals.layout = 'ajax';
                //logger.fatal(_spaceLoop(ErrorLevel.FATAL), req.method + ' ' + req.url + ' (' + app.locals.layout + ')');
                
                break;
        }
    }
    
    //console.log('%s %s %s', req.method, req.url, req.path);
    next();
});


// define routing
for (i = 0; i < config.actions.length; i++) {
    if (config.actions[i] == 'index') app.use('/', require('./routes/' + config.actions[i]));
    else app.use('/' + config.actions[i], require('./routes/' + config.actions[i]));
}


// 400 Bad Request 
app.use(function (err, req, res, next) {
    switch (err.status) {
        case 400:
            res.status(err.status).sendFile(path.join(__dirname, '/public', '400.html'));
            break;
    }
});

// @link http://blog.carloscerrato.com/?p=13
//app.use(vhost('*.' + app.get('domain_name'), express()));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

logger.fatal(_spaceLoop(ErrorLevel.FATAL) + "WEBSERVER Started");


module.exports = app;