var express = require('express');
var router = express.Router();


/* GET API: /report_project_based/##/.json */
router.get('/:id\/\.json', checkAuth, function (req, res) {
    Project.findAll({
        include: [
            { model: Member },
            { model: Module }
        ],
        where: {
            id: req.params.id,
            active: true
        }
    }).then(function (dataset) {
        //logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
        res.json({ dataset: dataset });
        res.status(200);
    });
});


/* GET API: /report_project_based/##/modules/.json */
router.get('/:id/modules\/\.json', checkAuth, function (req, res) {
    var sql = "SELECT m.id, m.project_id, m.name, m.plan_started, m.plan_ended, m.started, m.ended, m.is_completed, m.is_endless, " +
              "mu.hours mu_hours, mu.user_id " +
              "FROM modules m, modules_users mu " +
              "WHERE m.project_id = " + req.params.id + " " +
              "AND m.active = 1 " +
              "AND m.id = mu.module_id " +
              "AND m.active = mu.active";
    
    sql = "SELECT mm.project_id, mm.id, mm.name, mm.plan_started, mm.plan_ended, mm.started, mm.ended, mm.is_completed, mm.is_endless, mm.user_id, " +
          "SUM(mm.mu_hours)/COUNT(mm.mu_hours) mu_hours, SUM(i.hours) hours " +
          "FROM (" + sql + ") mm, items i " +
          "WHERE mm.id = i.module_id " +
          "AND mm.user_id = i.user_id " +
          "AND i.active = 1 " +
          "GROUP BY mm.project_id, mm.id, mm.name, mm.plan_started, mm.plan_ended, mm.started, mm.ended, mm.is_completed, mm.is_endless, mm.user_id";
    
    sql = "SELECT a.project_id, a.id, a.name, a.plan_started, a.plan_ended, a.started, a.ended, a.is_completed, a.is_endless, " +
          "SUM(a.mu_hours) mu_hours, SUM(a.hours) items_hours " +
          "FROM (" + sql + ") a " +
          "GROUP BY a.project_id, a.id, a.name, a.plan_started, a.plan_ended, a.started, a.ended, a.is_completed, a.is_endless;";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) logger.error(_spaceLoop(ErrorLevel.ERROR) + err['message']);
        
        res.json({ dataset: recordset });
        res.status(200);
    });
});


/* GET API: /report_project_based/##/module/##/users/.json */
router.get('/:id/module/:module_id/users\/\.json', checkAuth, function (req, res) {
    
    var sql = "SELECT m.id, m.project_id, m.name, m.plan_started, m.plan_ended, m.started, m.ended, m.is_completed, m.is_endless, " +
              "mu.hours mu_hours, mu.user_id " +
              "FROM modules m, modules_users mu " +
              "WHERE m.id = " + req.params.module_id + " " +
              "AND m.active = 1 " +
              "AND m.id = mu.module_id " +
              "AND m.active = mu.active";
    
    sql = "SELECT mm.id, mm.name, mm.plan_started, mm.plan_ended, mm.started, mm.ended, mm.is_completed, mm.is_endless, mm.user_id, " +
          "SUM(mm.mu_hours)/COUNT(mm.mu_hours) mu_hours, SUM(i.hours) hours " +
          "FROM (" + sql + ") mm, items i " +
          "WHERE mm.id = i.module_id " +
          "AND mm.user_id = i.user_id " +
          "AND i.active = 1 " +
          "GROUP BY mm.id, mm.name, mm.plan_started, mm.plan_ended, mm.started, mm.ended, mm.is_completed, mm.is_endless, mm.user_id";
    
    sql = "SELECT a.id, a.name, a.plan_started, a.plan_ended, a.started, a.ended, a.is_completed, a.is_endless, " +
          "a.user_id, u.family_name, u.given_name, a.mu_hours, a.hours " +
          "FROM (" + sql + ") a, users u " +
          "WHERE a.user_id = u.id";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) logger.error(_spaceLoop(ErrorLevel.ERROR) + err['message']);
        
        res.json({ dataset: recordset });
        res.status(200);
    });
});


/* GET API: /report_project_based/##/module/##/items/.json?user_id=## */
router.get('/:id/module/:module_id/items\/\.json', checkAuth, function (req, res) {
    
    var sql = "SELECT * FROM items " +
              "WHERE module_id = " + req.params.module_id + " " +
              "AND user_id = " + req.query.user_id + " " +
              "AND active = 1";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) logger.error(_spaceLoop(ErrorLevel.ERROR) + err['message']);
        
        res.json({ dataset: recordset });
        res.status(200);
    });
});

/* GET API: /report_project_based */
router.get('/', checkAuth, function (req, res) {
    res.render(app.locals.action_name);
});


module.exports = router;