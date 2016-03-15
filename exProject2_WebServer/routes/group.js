var express = require('express');
var router = express.Router();
var path = require('path');
var table = "groups";


var sql_builder = function (id) {
    return "SELECT * FROM " + table + " WHERE id = " + id + " AND active = 1";
}


/* GET API: /group/###/.json */
router.get('/:id\/\.json', checkAuth, function (req, res) {
    var sql = sql_builder(req.params.id);
    //logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    
    // @link http://stackoverflow.com/questions/16041341/read-result-from-an-exported-function-callback
    db.query(sql, function (err, recordset) {
        if (err) console.log(err['message']);
        res.json({ dataset: recordset });
        res.status(200);
    });
});


/* GET API: /group/###/permissions/.json */
router.get('/:id/permissions/\.json', checkAuth, function (req, res) {
    var sql = "SELECT CASE WHEN gp.id IS NULL THEN 0 ELSE 1 END checkbox, " +
        "0 is_dirty, 0 is_dirty_put, '' http_method, " +
        "gp.id group_permission_id, p.id permission_id, p.name name, " +
        "CASE WHEN gp.select_ IS NULL OR gp.select_ = 0 THEN 0 ELSE 1 END select_, " +
        "CASE WHEN gp.insert_ IS NULL OR gp.insert_ = 0 THEN 0 ELSE 1 END insert_, " +
        "CASE WHEN gp.update_ IS NULL OR gp.update_ = 0 THEN 0 ELSE 1 END update_, " +
        "CASE WHEN gp.delete_ IS NULL OR gp.delete_ = 0 THEN 0 ELSE 1 END delete_ " +
        //"gp.select_, gp.insert_, gp.update_, gp.delete_ "  +
        "FROM (SELECT * FROM permissions WHERE active = 1) p LEFT JOIN groups_permissions gp " +
        "ON p.id = gp.permission_id " +
        "AND gp.group_id = " + req.params.id + " " +
        "ORDER BY p.name";
    //logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) console.log(err['message']);
        //logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(recordset, null, '    '));

        res.json({ dataset: recordset });
        res.status(200);
    });
});


/* GET API: /group/###/users/.json */
router.get('/:id/users/\.json', checkAuth, function (req, res) {
    var sql = "SELECT CASE WHEN gu.id IS NULL THEN 0 ELSE 1 END checkbox, " +
        "gu.id group_user_id, u.id user_id, u.username, u.email, u.family_name, u.given_name " +
        "FROM (SELECT * FROM users WHERE active = 1) u LEFT JOIN groups_users gu " +
        "ON u.id = gu.user_id " +
        "AND gu.group_id = " + req.params.id;

    sql = "SELECT a.* FROM (" + sql + ") a " +
        "ORDER BY a.checkbox DESC, a.username";
    
    //logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) console.log(err['message']);
        res.json({ dataset: recordset });
        res.status(200);
    });
});


/* GET API: /group/ */
router.get('/', checkAuth, function (req, res) {
    res.locals.button = 'create';
    res.locals.layout = 'default';
    if (req.xhr == true) res.locals.layout = 'ajax';
    res.render(app.locals.action_name);
});


/* GET API: /group/### */
router.get('/:id', checkAuth, function (req, res) {
    res.locals.button = 'save';
    res.locals.layout = 'default';
    //if (req.xhr == true) res.locals.layout = 'ajax';
    //res.render(app.locals.action_name);

    var sql = sql_builder(req.params.id);
    //logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    
    // @link http://stackoverflow.com/questions/16041341/read-result-from-an-exported-function-callback
    db.query(sql, function (err, recordset) {
        if (err) {
            logger.error(_spaceLoop(ErrorLevel.ERROR) + err);
            res.status(404).sendFile(path.join(__dirname, '../public', '404.html'));
            return;
        }
        
        if (recordset.length > 0) {
            if (req.xhr == true) res.locals.layout = 'ajax';
            res.render(app.locals.action_name);
        }
        else {
            res.status(404).sendFile(path.join(__dirname, '../public', '404.html'));
        }
    });
});


/* POST API: /group/ */
router.post('/', checkAuth, function (req, res) {
    var post = req.body;
    //logger.info(_spaceLoop(ErrorLevel.INFO), post);    
    
    var sql = "SELECT * FROM " + table + " WHERE name = '" + post.name + "' AND active = 1";
    //logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (recordset.length == 0) {
            sql = "INSERT INTO " + table + " (name) VALUES (" +
                "'" + post.name + "')";
            //logger.info(_spaceLoop(ErrorLevel.INFO), sql);
            db.query(sql, function (err, recordset) {
                if (err) res.sendStatus(400)
                else res.sendStatus(200); // equivalent to res.status(200).send('OK')

                logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
            });
        }
        else {
            res.status(400).send('Duplicate name');
            logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode + ":DUPLICATE_NAME");
        }
    });    
});


// form format
/*
    checkbox
    is_dirty
    is_dirty_put
    http_method
    group_permission_id
    permission_id
    name                 --> permission_name
    select_
    insert_
    update_
    delete_
 */
// NOTE: http_method & is_dirty is pair 
// NOTE: is_dirty_put -> update groups_permissions ONLY 

var execute_sql = function (sql) {
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sub_sql, function (err, recordset) {
        if (err) console.log(err);

        return "";
        //else res.sendStatus(200); // equivalent to res.status(200).send('OK')
        
        //logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
}

/* POST API: /group/###/permissions */
router.post('/:id/permissions', checkAuth, function (req, res) {
    var post = req.body;
    //logger.info(_spaceLoop(ErrorLevel.INFO), post);
    
    var sql = "";
    var sub_sql = "";
    var counter = 0;
    for (i = 0; i < post.length; i++) {
        // reset sql
        sub_sql = "";
        //logger.info(_spaceLoop(ErrorLevel.INFO), post[i]);
        switch (post[i].http_method) {
            case 'POST':
                sub_sql = "INSERT INTO groups_permissions (group_id, permission_id, select_, insert_, update_, delete_) VALUES (" +
                        req.params.id + ", " +
                        post[i].permission_id + ", " +
                        post[i].select_ + ", " +
                        post[i].insert_ + ", " +
                        post[i].update_ + ", " +
                        post[i].delete_ + ");";
                break;
            case 'DELETE':
                sub_sql = "DELETE FROM groups_permissions WHERE id = " + post[i].group_permission_id + ";";
                break;
            default:
                if (post[i].is_dirty_put == 1) {
                    sub_sql = "UPDATE groups_permissions SET select_ = '" + post[i].select_ + "', " +
                              "insert_ = '" + post[i].insert_ + "', " +
                              "update_ = '" + post[i].update_ + "', " +
                              "delete_ = '" + post[i].delete_ + "' " +
                              "WHERE id = " + post[i].group_permission_id + ";";
                }
                break;
        }
        
        if (sub_sql != "") {
            //logger.info(_spaceLoop(ErrorLevel.INFO), post[i]);
            //logger.info(_spaceLoop(ErrorLevel.INFO), sub_sql);
            sql = sql + sub_sql;
        }
    }

    // standard code cannot works properly in sqlite with ";"
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) res.sendStatus(400)
        else res.sendStatus(200); // equivalent to res.status(200).send('OK')

        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
});


/* POST API: /group/###/users */
router.post('/:id/users', checkAuth, function (req, res) {
    var post = req.body;
    //logger.info(_spaceLoop(ErrorLevel.INFO), post);
    
    var sql = "";
    var sub_sql = "";
    
    for (i = 0; i < post.length; i++) {
        // reset sql
        sub_sql = "";
        //logger.info(_spaceLoop(ErrorLevel.INFO), post[i]);
        switch (post[i].http_method) {
            case 'POST':
                sub_sql = "INSERT INTO groups_users (group_id, user_id) VALUES (" +
                           req.params.id + ", " +
                           post[i].user_id + ");";
                break;
            case 'DELETE':
                sub_sql = "DELETE FROM groups_users WHERE id = " + post[i].group_user_id + ";";
                break;
            default:
                //  NOTHING
                break;
        }
        
        if (sub_sql != "") {
            //logger.info(_spaceLoop(ErrorLevel.INFO), sub_sql);
            sql = sql + sub_sql;
        }
    }
    //logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) res.sendStatus(400)
        else res.sendStatus(200); // equivalent to res.status(200).send('OK')
        
        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
});


/* PUT API: /group/### */
router.put('/:id', checkAuth, function (req, res) {
    var post = req.body;
    //logger.info(_spaceLoop(ErrorLevel.INFO), post);
    
    var sql = "UPDATE " + table + " SET name = '" + post.name + "', " +
        "modified = " + get_db_datetime() + " " +
        "WHERE id = " + req.params.id + " AND active = 1";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) res.status(400).send(err['message']);
        else res.sendStatus(200); // equivalent to res.status(200).send('OK')
        
        logger.fatal(_spaceLoop(ErrorLevel.FATAL) + 'http_status_code:' + res.statusCode);
    });
});


module.exports = router;