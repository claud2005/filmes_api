/**
 * @param { import("knex").Knex } knex
 */
export async function up(knex) {
  await knex.schema.createTable("filmes_atores", (table) => {
    table.integer("filme_id").notNullable()
         .references("id").inTable("filmes").onDelete("CASCADE");
    table.uuid("ator_id").notNullable()
         .references("id").inTable("atores").onDelete("CASCADE");
    table.primary(["filme_id", "ator_id"]);
  });
}

/**
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("filmes_atores");
}
