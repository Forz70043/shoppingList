/* eslint-disable no-unused-vars */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("lists", ["userId"], {
      name: "lists_userId_idx"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("lists", "lists_userId_idx");
  }
};
