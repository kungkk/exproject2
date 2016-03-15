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

    Group = sequelize.define('Group', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(20),
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
        tableName: 'groups',
        createdAt: 'created',
        updatedAt: 'modified',
        underscored: true
    });
    
    // @link http://docs.sequelizejs.com/en/latest/docs/legacy/#foreign-keys
    Group.belongsTo(Creator, { foreignKey: 'created_by' });
    Group.belongsTo(Modifier, { foreignKey: 'modified_by' });
    
    

    return Group;
}

module.exports = Model;