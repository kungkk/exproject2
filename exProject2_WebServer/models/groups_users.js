// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#import
// @link http://sequelize.readthedocs.org/en/latest/api/sequelize/#define
// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#definition
Model = function (sequelize, DataTypes) {

    GroupUser = sequelize.define('GroupUser', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        /*
        group_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Group,
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
         */
    }, {
        // @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
        tableName: 'groups_users',
        createdAt: false,
        updatedAt: false,
        underscored: true
    });
    
    // @link http://docs.sequelizejs.com/en/latest/docs/legacy/#foreign-keys
    //GroupUser.belongsTo(Group);
    //GroupUser.belongsTo(User);
    
    Group.belongsToMany(User, { through: GroupUser });
    User.belongsToMany(Group, { through: GroupUser });

    return GroupUser;
}

module.exports = Model;