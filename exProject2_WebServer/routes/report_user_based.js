var express = require('express');
var router = express.Router();


/* GET API: /report_user_based/##/.json */
router.get('/:user_id/\.json', checkAuth, function (req, res) {
    var sql = "SELECT m.project_id, u.id user_id, (u.family_name  || ' ' || u.given_name) full_name " + 
        "FROM members m, users u, projects p " +
        "WHERE m.user_id = " + req.params.user_id + " " +
        "AND m.active = 1 " +
        "AND m.user_id = u.id " +
        "AND m.active = u.active " +
        "AND m.project_id = p.id " +
        "AND m.active = p.active";
    
    sql = "SELECT COUNT(project_id) projects, user_id, full_name FROM (" + sql + ")";
    logger.info(_spaceLoop(ErrorLevel.INFO), sql);
    db.query(sql, function (err, recordset) {
        if (err) logger.error(_spaceLoop(ErrorLevel.ERROR) + err['message']);
        
        res.json({ dataset: recordset });
        res.status(200);
    });
});


/* GET API: /report_user_based/##/projects/.json */
router.get('/:user_id/projects/\.json', checkAuth, function (req, res) {
    Member.findAll({
        attributes: ['project_id'],
        where: {
            user_id: req.params.user_id,
            active: true
        }
    }).then(function (projects) {
        //logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(projects, null, '    '));
        
        var project_ids = [];
        for (i = 0; i < projects.length; i++) {
            project_ids.push(projects[i].project_id);
        }
        
        Project.findAll({
            include: [
                //{ model: Member },
                {
                    model: Module,
                    include: [
                        { model: Item }
                    ],
                    where: {
                        active: true
                    }
                }
            ],
            where: {
                id: { $in: project_ids },
                active: true
            },
            order: [['name', 'ASC']]
        }).then(function (dataset) {
            logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
            
            res.json({ dataset: dataset });
            res.status(200);
        });
    });
});


/* GET API: /report_user_based/##/project/##/.json */
router.get('/:user_id/project/:project_id/modules/\.json', checkAuth, function (req, res) {
    Module.findAll({
        include: [
            { model: Item },
            {
                model: ModuleUser,
                //required: false,
                where: {
                    user_id: req.params.user_id,
                    active: true
                }
            }
        ],
        where: {
            project_id: req.params.project_id,
            user_id: req.params.user_id,
            active: true
        },
        order: [['name', 'ASC']]
    }).then(function (dataset) {
        logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
            
        res.json({ dataset: dataset });
        res.status(200);
    });
});


/* GET API: /report_user_based */
router.get('/', checkAuth, function (req, res) {
    res.render(app.locals.action_name);
});


module.exports = router;