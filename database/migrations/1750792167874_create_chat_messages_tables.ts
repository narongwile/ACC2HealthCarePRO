import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'chat_messages'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('patient_id').unsigned().references('patients.id').onDelete('CASCADE').notNullable()
      table.text('message').notNullable()
      table.string('sender', 50).notNullable() // e.g., 'patient', 'healthcare_pro'
      table.string('type', 50).notNullable() // e.g., 'LINE', 'SMS', 'internal'

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
