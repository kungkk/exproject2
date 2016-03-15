// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#import
// @link http://sequelize.readthedocs.org/en/latest/api/sequelize/#define
// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#definition
Model = function (sequelize, DataTypes) {
    Creator = sequelize.define('Creator', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
    }, {
        // @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
        tableName: 'users',
        createdAt: false,
        updatedAt: false,
        underscored: true
    });
    
    
    Modifier = sequelize.define('Modifier', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
    }, {
        // @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
        tableName: 'users',
        createdAt: false,
        updatedAt: false,
        underscored: true
    });    

    Project = sequelize.define('Project', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: 'id',
            }
        },
        code: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(50),
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
        note: {
            type: DataTypes.STRING,
            allowNull: false,
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
        tableName: 'projects',
        //createdAt: 'created',
        //updatedAt: 'modified',
        createdAt: false,
        updatedAt: false,
        underscored: true
    });
    
    // @link http://docs.sequelizejs.com/en/latest/docs/legacy/#foreign-keys
    Project.belongsTo(Creator, { foreignKey: 'created_by' });
    Project.belongsTo(Modifier, { foreignKey: 'modified_by' });
    Project.belongsTo(User);
    
    User.hasMany(Project);

    return Project;
}

module.exports = Model;