// @link http://www.sitepoint.com/understanding-module-exports-exports-node-js/

//config = require('./jccwebserver.json');

switch (config.dbms) {
    case 'mssql':
        var mssql = require('mssql');
        
        // @link http://stackoverflow.com/questions/16041341/read-result-from-an-exported-function-callback
        exports.query = function (sql, callback) {
            var connection = new mssql.Connection(config.db_mssql_config, function (err) {
                if (err) { callback(err, null); return; }
                
                var request = new mssql.Request(connection); // or: var request = connection.request(); 
                request.query(sql, function (err, recordset) {
                    if (err) { callback(err, null); return; }
                    
                    callback(err, recordset);
                    
                    // sql server check number of connections
                    // @link http://stackoverflow.com/questions/216007/how-to-determine-total-number-of-open-active-connections-in-ms-sql-server-2005
                    //SELECT DB_NAME(dbid) as DBName, COUNT(dbid) as NumberOfConnections, loginame as LoginName
                    //FROM sys.sysprocesses
                    //WHERE dbid > 0
                    //GROUP BY dbid, loginame

                    // ???
                    connection.close();
                });
            });
        }
		break;
    case 'oracle':
        // write oracle code
        break;
    case 'sqlite':
        var sqlite3 = require('sqlite3').verbose();
        var file = config.db_sqlite_config.storage;

        exports.query = function (sql, callback) {
            var db = new sqlite3.Database(file);
            db.all(sql, function (err, rows) {
                if (err) { callback(err, null); return; }
                
                //console.log(rows);

                callback(err, rows);
            });
            db.close();              
        }
        
        //exports.run = function (sql, callback) {
        //    var db = new sqlite3.Database(file);
        //    db.all(sql, function (err, rows) {
        //        if (err) { callback(err, null); return; }
                
        //        //console.log(rows);
                
        //        callback(err, rows);
        //    });
        //    db.close();
        //}
        break;        
}