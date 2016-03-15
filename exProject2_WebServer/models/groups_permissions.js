// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#import
// @link http://sequelize.readthedocs.org/en/latest/api/sequelize/#define
// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#definition
Model = function (sequelize, DataTypes) {

    GroupPermission = sequelize.define('GroupPermission', {
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
        permission_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Permission,
                key: 'id',
            }
        },
         */
        select_: {
            type: DataTypes.BOOLEAN,
        },
        insert_: {
            type: DataTypes.BOOLEAN,
        },
        update_: {
            type: DataTypes.BOOLEAN,
        },
        delete_: {
            type: DataTypes.BOOLEAN,
        },
    }, {
        // @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
        tableName: 'groups_permissions',
        createdAt: false,
        updatedAt: false,
        underscored: true
    });
    
    // @link http://docs.sequelizejs.com/en/latest/docs/legacy/#foreign-keys
    //GroupPermission.belongsTo(Group);
    //GroupPermission.belongsTo(User);
    
    Group.belongsToMany(Permission, { through: GroupPermission });
    Permission.belongsToMany(Group, { through: GroupPermission });

    return GroupPermission;
}

module.exports = Model;