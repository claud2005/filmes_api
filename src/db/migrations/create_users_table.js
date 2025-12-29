/**
 * @param { import("knex").Knex } knex
 */
export async function up(knex) {
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary(); // identificador único
    table.string("email").notNullable().unique(); // email único
    table.string("password").notNullable(); // password encriptada
    table.enu("role", ["view", "edit", "admin"]).defaultTo("view"); // nível de acesso
  });
}

/**
 * @param { import("knex").Knex } knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("users");
}
