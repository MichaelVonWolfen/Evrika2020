'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull:false
      },
      email: {
        type: Sequelize.STRING,
        allowNull:false,
        unique:true
      },
      password: {
        type: Sequelize.STRING(1000),
        allowNull:false
      },
      phone: {
        type: Sequelize.STRING(16)
      },
      faculty: {
        type: Sequelize.STRING
      },
      team_id: {
        type: Sequelize.INTEGER,
        references:{model: 'teams', key: 'id'}
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue:0,
        allowNull:false
      },
      role: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('users');
  }
};