import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Appointment from './Appointment'
import AiAlert from './AiAlert'

export default class Patient extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public gender: string

  @column()
  public age: number

  @column({
    serialize: (value: string | null) => value ? parseFloat(value) : null // Convert to number if it exists
  })
  public bloodSugar: string

  @column()
  public medication: string

  @column()
  public exercise: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => Appointment)
  public appointments: HasMany<typeof Appointment>

  @hasMany(() => AiAlert)
  public aiAlerts: HasMany<typeof AiAlert>
}
