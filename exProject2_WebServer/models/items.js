// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#import
// @link http://sequelize.readthedocs.org/en/latest/api/sequelize/#define
// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#definition
Model = function (sequelize, DataTypes) {

    Item = sequelize.define('Item', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
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
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        worked: {
            type: DataTypes.DATE,
        },
        memo: {
            type: DataTypes.STRING,
        },
        hours: {
            type: DataTypes.FLOAT,
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        }
    }, {
        // @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
        tableName: 'items',
        createdAt: 'created',
        updatedAt: 'modified',
        underscored: true
    });
    
    // @link http://docs.sequelizejs.com/en/latest/docs/legacy/#foreign-keys
    Item.belongsTo(Module);
    Item.belongsTo(User);
    
    Module.hasMany(Item);
    User.hasMany(Item);

    return Item;
}

module.exports = Model;