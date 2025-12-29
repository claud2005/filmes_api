/**
 * @param { import("knex").Knex } knex
 */
export async function up(knex) {
  await knex.schema.createTable("filmes", (table) => {
    table.increments("id").primary(); // integer auto-increment
    table.string("titulo").notNullable();
    table.text("descricao");
    table.integer("ano").notNullable();
    table
      .integer("genero_id")
      .references("id")
      .inTable("generos")
      .onDelete("CASCADE");
  });
}

/**
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("filmes");
}
