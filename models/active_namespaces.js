'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class active_namespaces extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  active_namespaces.init({
    admin_id: DataTypes.INTEGER,
    namespace_identifier: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'active_namespaces',
  });
  return active_namespaces;
};