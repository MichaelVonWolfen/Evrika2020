'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('teams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        unique:true,
        allowNull:false
      },
      role: {
        type: Sequelize.STRING,
        allowNull:false
      },
      total_time: {
        type: Sequelize.STRING
      },
      corecte_answers: {
        type: Sequelize.INTEGER
      },
      total_points: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        defaultValue:Sequelize.NOW,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        defaultValue:Sequelize.NOW,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('teams');
  }
};