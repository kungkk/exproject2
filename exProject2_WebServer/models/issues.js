// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#import
// @link http://sequelize.readthedocs.org/en/latest/api/sequelize/#define
// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#definition
Model = function (sequelize, DataTypes) {

    Issue = sequelize.define('Issue', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        item_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Item,
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
        description: {
            type: DataTypes.STRING,
        },
        is_solved: {
            type: DataTypes.BOOLEAN,
        },
        due_date: {
            type: DataTypes.DATE,
        },
        solved: {
            type: DataTypes.DATE,
        },
        solved_note: {
            type: DataTypes.STRING,
        },
        active: {
            type: DataTypes.BOOLEAN,
        },
    }, {
        // @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
        tableName: 'issues',
        createdAt: 'created',
        updatedAt: 'modified',
        underscored: true
    });
    
    // @link http://docs.sequelizejs.com/en/latest/docs/legacy/#foreign-keys
    Issue.belongsTo(Item);
    Issue.belongsTo(User);
    
    Item.hasMany(Issue);
    User.hasMany(Issue);

    return Issue;
}

module.exports = Model;