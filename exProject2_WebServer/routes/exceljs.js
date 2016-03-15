var express = require('express');
var router = express.Router();

// @link https://www.npmjs.com/package/exceljs
var Excel = require("exceljs");

// @link http://momentjs.com
var moment = require('moment');

var started;
var ended;

var where_clause_builder = function (req) {
    var arrWhere = {};
    var year;
    var week = "01";
    var string;
    
    if (Object.keys(req.query).length === 0) {
        return { id: -1 };
    }
    else {
        for (var param in req.query) {
            switch (param) {
                case 'user_id':
                    arrWhere[param] = req.query[param];
                    break;
                case 'year':
                    year = req.query[param];
                    break;
                case 'week':
                    week = req.query[param];
                    if (week < 10) week = "0" + week;
                    break;
            }
        }
        
        string = year + "W" + week;
        started = moment(string).format('YYYY-MM-DD');
        ended = moment(string).weekday(7).format('YYYY-MM-DD');
        
        arrWhere['worked'] = { $between: [started, ended] };
        arrWhere['active'] = true;
        
        logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(arrWhere, null, '    '));
        return arrWhere;
    }
}


var excel_header = function(req, worksheet, worksheet_name) {
    worksheet.getCell("A1").value = "Developer";
    worksheet.getCell("B1").value = req.session.given_name + ", " + req.session.family_name;
    worksheet.getCell("A2").value = "Email";
    worksheet.getCell("B2").value = req.session.email;
    worksheet.getCell("A3").value = "No. of Week";
    worksheet.getCell("B3").value = req.query.week;

    // @link https://www.npmjs.com/package/exceljs#styles
    worksheet.getCell("A1").font = { bold: true };
    worksheet.getCell("A2").font = { bold: true };
    worksheet.getCell("A3").font = { bold: true };
    
    switch (worksheet_name) {
        case "weekly":
            // @link https://www.npmjs.com/package/exceljs#styles
            worksheet.getCell("A5").value = "DateTime";
            worksheet.getCell("B5").value = "Project Name";
            worksheet.getCell("C5").value = "Module Name";
            worksheet.getCell("D5").value = "Items";
            worksheet.getCell("E5").value = "Hours";
            worksheet.getCell("F5").value = "Memo";
            
            
            worksheet.getCell("A5").font = { bold: true };
            worksheet.getCell("B5").font = { bold: true };
            worksheet.getCell("C5").font = { bold: true };
            worksheet.getCell("D5").font = { bold: true };
            worksheet.getCell("E5").font = { bold: true };
            worksheet.getCell("F5").font = { bold: true };
            break;
        case "issues":
            worksheet.getCell("B5").value = "Item";
            worksheet.getCell("C5").value = "Issue";
            worksheet.getCell("D5").value = "Description";
            worksheet.getCell("E5").value = "Created";
            worksheet.getCell("F5").value = "Due Date";
            
            worksheet.getCell("B5").font = { bold: true };
            worksheet.getCell("C5").font = { bold: true };
            worksheet.getCell("D5").font = { bold: true };
            worksheet.getCell("E5").font = { bold: true };
            worksheet.getCell("F5").font = { bold: true };
            break;
    }
    
    var colA = worksheet.getColumn(1);
    var colB = worksheet.getColumn(2);
    var colC= worksheet.getColumn(3);
    var colD = worksheet.getColumn(4);
    var colE = worksheet.getColumn(5);
    var colF = worksheet.getColumn(6);
    switch (worksheet_name) {
        case "weekly":
            colA.width = 15;
            colB.width = 32;
            colC.width = 32;
            colD.width = 50;
            colE.width = 8;
            colF.width = 50;
            break;
        case "issues":
            colA.width = 15;
            colB.width = 50;
            colC.width = 32;
            colD.width = 50;
            colE.width = 32;
            colF.width = 32;
            break;
    }
}


var excel_data = function(req, worksheet, worksheet_name, dataset) {
    var strCell;
    var nRow = 6;
    switch (worksheet_name) {
        case "weekly":
            for (var i = 0; i < dataset.length; i++) {
                var rowValues = [];
                rowValues[1] = dataset[i]['datetime'];
                rowValues[2] = dataset[i]['project_name'];
                rowValues[3] = dataset[i]['module_name'];
                rowValues[4] = dataset[i]['item_name'];
                rowValues[5] = dataset[i]['hours'];
                rowValues[6] = dataset[i]['memo'];
                worksheet.addRow(rowValues);
                nRow++;
            }
            
            strCell = "E" + nRow;
            nRow--;
            strLastCell = "E" + nRow;
            worksheet.getCell(strCell).value = { formula: "SUM(E6:" + strLastCell + ")", result: 40 };
            worksheet.getCell(strCell).font = { bold: true };
            break;
        case "issues":
            for (var i = 0; i < dataset.length; i++) {
                var rowValues = [];
                rowValues[1] = "";
                rowValues[2] = dataset[i]['item_name'];
                rowValues[3] = dataset[i]['issue_name'];
                rowValues[4] = dataset[i]['issue_description'];
                rowValues[5] = dataset[i]['due_date'];
                rowValues[6] = dataset[i]['created'];
                worksheet.addRow(rowValues);
                nRow++;
            }
            break;
    }
}


/* GET API: /exceljs/ */
router.get('/', function (req, res) {
    var arrWhere = where_clause_builder(req);

    // @link http://stackoverflow.com/questions/31839074/overwrite-an-excel-file-with-nodejs    
    
    var filepath = __dirname.replace("routes", "public\\excel\\");
    var week_id = "W" + req.query.year + req.query.week;
    var filename = req.session.given_name + "_" + req.session.family_name + "_" + week_id + ".xlsx";
    filepath = filepath + filename;
    
    var options = {
        //filename: "test.xlsx", // existing filepath
        filename: filepath,
        useStyles: true, // Default
        useSharedStrings: true // Default
    };
    
    var workbook = new Excel.stream.xlsx.WorkbookWriter(options);
    var sheet = workbook.addWorksheet(week_id);
    var worksheet = workbook.getWorksheet(week_id);

    var sql = "SELECT i.worked datetime, p.name project_name, m.name module_name, i.name item_name, i.hours, i.memo " + 
        "FROM items i, modules m, projects p " + 
        "WHERE i.user_id = " + req.session.user_id + " " +
        "AND i.worked BETWEEN '" + started + "' AND '" + ended + "' " +
        "AND i.active = 1 " +
        "AND i.module_id = m.id " +
        "AND i.active = m.active " +
        "AND m.project_id = p.id " +
        "AND m.active = p.active " +
        "ORDER BY i.worked";
    sequelize.query(sql, {
        type: sequelize.QueryTypes.SELECT
    }).then(function (dataset) {
        logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));

        // Weekly Report Worksheet
        excel_header(req, worksheet, "weekly");
        excel_data(req, worksheet, "weekly", dataset);
        
        sql = "SELECT i.name item_name, s.name issue_name, s.description issue_description, s.due_date, s.created " +
            "FROM issues s, items i " +
            "WHERE s.user_id = " + req.session.user_id + " " +
            "AND s.is_solved = 0 " +
            "AND s.active = 1 " +
            "AND s.item_id = i.id " +
            "AND s.active = i.active " +
            "ORDER BY s.created";
        sequelize.query(sql, {
            type: sequelize.QueryTypes.SELECT
        }).then(function (dataset) {
            logger.info(_spaceLoop(ErrorLevel.INFO), JSON.stringify(dataset, null, '    '));
            
            // Issues Worksheet
            sheet = workbook.addWorksheet("issues");
            worksheet = workbook.getWorksheet("issues");
            
            excel_header(req, worksheet, "issues");
            excel_data(req, worksheet, "issues", dataset);
            
            worksheet.commit(); // Need to commit the changes to the worksheet
            workbook.commit(); // Finish the workb
        });
    });

    
    /*
    res.locals.button = 'create';
    res.locals.layout = 'default';
    if (req.xhr == true) res.locals.layout = 'ajax';
    res.render(app.locals.action_name);
     */
});


router.get('/abc', function (req, res) {
    var fs = require('fs');
    fs.readFile('public\\Excel\\KK_Kung_W20162.xlsx', function (err, data) {
        if (err) throw err; // Fail if the file can't be read.

        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "KK_Kung_W20162.xlsx");
        res.end(data, 'binary');
    });    
});



module.exports = router;