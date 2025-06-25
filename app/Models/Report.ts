import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Report extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public reportName: string

  @column.dateTime({
    serializeAs: null,
  })
  public dateGenerated: DateTime

  @column()
  public generatedBy: string

  @column()
  public filePath: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
