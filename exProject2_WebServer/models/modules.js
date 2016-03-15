// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#import
// @link http://sequelize.readthedocs.org/en/latest/api/sequelize/#define
// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#definition
Model = function (sequelize, DataTypes) {

    Module = sequelize.define('Module', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        project_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Project,
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
        name: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        plan_started: {
            type: DataTypes.DATE,
        },
        plan_ended: {
            type: DataTypes.DATE,
        },
        started: {
            type: DataTypes.DATE,
        },
        ended: {
            type: DataTypes.DATE,
        },
        is_completed: {
            type: DataTypes.BOOLEAN,
        },
        is_endless: {
            type: DataTypes.BOOLEAN,
        },
        note: {
            type: DataTypes.STRING,
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            references: {
                model: Creator,
                key: 'id',
            }
        },
        modified_by: {
            type: DataTypes.INTEGER,
            references: {
                model: Modifier,
                key: 'id',
            }
        }
    }, {
        // @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
        tableName: 'modules',
        createdAt: 'created',
        updatedAt: 'modified',
        underscored: true
    });
    
    // @link http://docs.sequelizejs.com/en/latest/docs/legacy/#foreign-keys
    Module.belongsTo(Project);
    Module.belongsTo(User);
    
    Project.hasMany(Module);
    User.hasMany(Module);

    return Module;
}

module.exports = Model;