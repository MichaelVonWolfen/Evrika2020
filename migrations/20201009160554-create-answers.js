'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('answers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      answer: {
        type: Sequelize.STRING
      },
      question_id: {
        type: Sequelize.INTEGER,
        references:{model:'questions', key:'id'}
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        defaultValue:0
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
    await queryInterface.dropTable('answers');
  }
};