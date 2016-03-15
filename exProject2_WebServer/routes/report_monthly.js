var express = require('express');
var router = express.Router();
// link: https://www.npmjs.com/package/dateformat
var dateFormat = require('dateformat');


// /report_monthly_plan/.json?year=####&month=##&user_id=###
/* GET API: /report_monthly/.json */
router.get('/\.json', checkAuth, function (req, res) {
    // link: http://stackoverflow.com/questions/13571700/get-first-and-last-date-of-current-month-with-javascript-or-jquery
    // link: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Date
    y = req.query.year;
    m = req.query.month;
    m--;
    var firstDayOfMonth = new Date(y, m, 1);
    m++;
    var lastDayOfMonth = new Date(y, m, 0);
    
    console.log(dateFormat(firstDayOfMonth, "yyyy-mm-dd"));
    console.log(dateFormat(lastDayOfMonth, "yyyy-mm-dd"));

    
    var SQLPlan = "SELECT id FROM plans WHERE user_id = " + req.query.user_id + " " +
                  "AND year = " + req.query.year + " " +
                  "AND month = " + req.query.month;
    
    var SQLA = "SELECT p.id project_id, p.code project_code, p.name project_name, m.id module_id, m.name module_name, t.started, t.ended, t.hours, 'planed' status " +
               "FROM tasks t, modules m, projects p " +
               "WHERE t.plan_id IN (" + SQLPlan + ") " +
               "AND t.module_id = m.id " +
               "AND m.is_endless = 0 " +
               "AND m.project_id = p.id";
    
    // ????
    var SQLB = "SELECT p.id project_id, p.code project_code, p.name project_name, m.id module_id, m.name module_name, null started, null ended, i.hours, 'worked' status " +
               "FROM items i, modules m, projects p " +
               "WHERE i.user_id = " + req.query.user_id + " " +
               "AND i.worked >= '" + dateFormat(firstDayOfMonth, "yyyy-mm-dd") + time_started + "' " +
               "AND i.worked <= '" + dateFormat(lastDayOfMonth, "yyyy-mm-dd") + time_ended + "' " +
               "AND i.module_id = m.id " +
               "AND m.is_endless = 0 " +
               "AND m.project_id = p.id";
    //console.log(SQLB);
    //res.status(200);
    
    SQLB = "SELECT x.project_id, x.project_code, x.project_name, x.module_id, x.module_name, x.started, x.ended, SUM(x.hours) hours, x.status " +
           "FROM (" + SQLB + ") x " +
           "GROUP BY x.project_id, x.project_name, x.module_id, x.module_name, x.started, x.ended, x.status";

    var sql = "SELECT a.project_id, a.project_code, a.project_name, a.module_id, a.module_name, a.started, a.ended, a.hours, a.status " +
              "FROM (" + SQLA + " UNION ALL " + SQLB + ") a " +
              "WHERE a.hours > 0 " +
              "ORDER BY a.project_name DESC, a.module_name, a.status";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    
    db.query(sql, function (err, recordset) {
        if (err) logger.error(_spaceLoop(ErrorLevel.ERROR) + err['message']);

        res.json({ dataset: recordset });
        res.status(200);
    });
});


/* GET API: /report_monthly */
router.get('/', checkAuth, function (req, res) {
    res.render(app.locals.action_name);
});


module.exports = router;