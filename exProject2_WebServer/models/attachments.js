// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#import
// @link http://sequelize.readthedocs.org/en/latest/api/sequelize/#define
// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#definition
Model = function (sequelize, DataTypes) {

    Attachment = sequelize.define('Attachment', {
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
        //files: {
        //    type: DataTypes.BLOB,
        //},
        file_name: {
            type: DataTypes.STRING,
        },
    }, {
        // @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
        tableName: 'attachments',
        createdAt: 'created',
        updatedAt: 'modified',
        underscored: true
    });
    
    // @link http://docs.sequelizejs.com/en/latest/docs/legacy/#foreign-keys
    Attachment.belongsTo(Item);
    Attachment.belongsTo(User);
    
    Item.hasMany(Attachment);
    User.hasMany(Attachment);

    return Attachment;
}

module.exports = Model;