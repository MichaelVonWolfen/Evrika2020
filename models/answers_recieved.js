'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class answers_recieved extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  answers_recieved.init({
    team_id: DataTypes.INTEGER,
    answer_id: DataTypes.INTEGER,
    total_time: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'answers_recieved',
  });
  return answers_recieved;
};