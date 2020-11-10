'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users_active_namespaces', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      team_id: {
        type: Sequelize.INTEGER,
        references:{model:'teams',key:'id'}
      },
      active_namespace_id: {
        type: Sequelize.INTEGER,
        references:{model:'active_namespaces', key:'id'}
      },
      corecte_answers: {
        type: Sequelize.INTEGER,
      },
      total_points: {
        type: Sequelize.INTEGER,
        default:0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users_active_namespaces');
  }
};