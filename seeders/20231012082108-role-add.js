'use strict';
// for crete seeder -> npx sequelize-cli seed:generate --name seedName
// For add seeder in db -> npx sequelize-cli db:seed:all
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert('roles', [
      {
        name: "Admin",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Manager",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Merchant",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "User",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ])

  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
