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

    User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        /*
        position_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Position,
                key: 'id',
            }
        },
         */
        username: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        /* security issue
        password: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
         */
        email: {
            type: DataTypes.STRING(30),
            allowNull: false,
            validate: {
                isEmail: true,  
                msg: 'Invalid email address',
            }
        },
        family_name: {
            type: DataTypes.STRING(50),
        },
        given_name: {
            type: DataTypes.STRING(50),
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
        tableName: 'users',
        createdAt: 'created',
        updatedAt: 'modified',
        underscored: true
    });
    
    // @link http://docs.sequelizejs.com/en/latest/docs/legacy/#foreign-keys
    User.belongsTo(Creator, { foreignKey: 'created_by' });
    User.belongsTo(Modifier, { foreignKey: 'modified_by' });

    return User;
}

module.exports = Model;