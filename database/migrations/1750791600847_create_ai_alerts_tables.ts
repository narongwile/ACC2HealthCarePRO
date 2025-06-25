import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'ai_alerts'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('patient_id').unsigned().references('patients.id').onDelete('CASCADE').notNullable()
      table.string('risk', 255).notNullable()
      table.timestamp('alert_date', { useTz: true }).notNullable()
      table.string('ai_recommendation', 255).nullable()
      table.string('sent_via', 50).nullable()
      table.string('status', 50).notNullable() // e.g., Unresolved, Resolved

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
