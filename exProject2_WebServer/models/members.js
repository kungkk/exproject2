// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#import
// @link http://sequelize.readthedocs.org/en/latest/api/sequelize/#define
// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#definition
Model = function (sequelize, DataTypes) {

    Member = sequelize.define('Member', {
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
        project_leader: {
            type: DataTypes.BOOLEAN,
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        }
    }, {
        // @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
        tableName: 'members',
        createdAt: false,
        updatedAt: false,
        underscored: true
    });
    
    // @link http://docs.sequelizejs.com/en/latest/docs/legacy/#foreign-keys
    Member.belongsTo(Project);
    Member.belongsTo(User);
    
    Project.hasMany(Member);
    User.hasMany(Member);

    return Member;
}

module.exports = Model;