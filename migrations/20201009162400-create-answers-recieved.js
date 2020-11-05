'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('answers_recieved', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      team_id: {
        type: Sequelize.INTEGER,
        references:{model:'teams', key:'id'}
      },
      question_id:{
        type: Sequelize.INTEGER,
        references: {model:'questions', key:'id'}
      },
      answer_id: {
        type: Sequelize.INTEGER,
        references: {model:'answers', key: 'id'}
      },
      total_time: {
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
    await queryInterface.dropTable('answers_recieved');
  }
};