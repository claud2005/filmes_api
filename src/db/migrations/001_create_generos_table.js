/**
 * @param { import("knex").Knex } knex
 */
export async function up(knex) {
  await knex.schema.createTable("generos", (table) => {
    table.increments("id").primary(); // integer auto-increment
    table.string("nome").notNullable().unique();
  });
}

/**
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("generos");
}
