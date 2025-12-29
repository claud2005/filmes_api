/**
 * @param { import("knex").Knex } knex
 */
export async function up(knex) {
  await knex.schema.createTable("atores", (table) => {
    table.uuid("id").primary();
    table.string("nome").notNullable();
    table.integer("idade");
    table.string("nacionalidade");
  });
}

/**
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("atores");
}
