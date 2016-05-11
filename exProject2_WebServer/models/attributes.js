// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#import
// @link http://sequelize.readthedocs.org/en/latest/api/sequelize/#define
// @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#definition
Model = function (sequelize, DataTypes) {

    Attribute = sequelize.define('Attribute', {
        table_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        key_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        key_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        key_value: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        // @link http://docs.sequelizejs.com/en/latest/docs/models-definition/#configuration
        tableName: 'attributes',
        createdAt: 'created',
        updatedAt: 'modified',
        underscored: true
    });
    
    return Attribute;
}

module.exports = Model;