// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#import
// @link http://sequelize.readthedocs.org/en/latest/api/sequelize/#define
// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#definition
Model = function (sequelize, DataTypes) {

    Task = sequelize.define('Task', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        plan_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Plan,
                key: 'id',
            }
        },
        module_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Module,
                key: 'id',
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: 'id',
            }
        },
        started: {
            type: DataTypes.DATE,
        },
        ended: {
            type: DataTypes.DATE,
        },
        hours: {
            type: DataTypes.FLOAT,
        },
    }, {
        // @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
        tableName: 'tasks',
        createdAt: 'created',
        updatedAt: 'modified',
        underscored: true
    });
    
    // @link http://docs.sequelizejs.com/en/latest/docs/legacy/#foreign-keys
    Task.belongsTo(Plan);
    Task.belongsTo(Module);
    Task.belongsTo(User);
    
    Plan.hasMany(Task);
    Module.hasMany(Task);
    User.hasMany(Task);

    return Task;
}

module.exports = Model;