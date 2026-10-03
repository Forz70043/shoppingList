/* eslint-disable no-unused-vars */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("items", ["listId"], {
      name: "items_listId_idx"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("items", "items_listId_idx");
  }
};
