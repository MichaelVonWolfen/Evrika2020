'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users_active_namespaces extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  users_active_namespaces.init({
    team_id: DataTypes.INTEGER,
    active_namespace_id: DataTypes.INTEGER,
    total_time: DataTypes.STRING,
    corecte_answers: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'users_active_namespaces',
  });
  return users_active_namespaces;
};