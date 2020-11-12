'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class teams extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  teams.init({
    name: DataTypes.STRING,
    role: DataTypes.STRING,
    total_time: DataTypes.STRING,
    corecte_answers: DataTypes.INTEGER,
    total_points: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'teams',
  });
  return teams;
};