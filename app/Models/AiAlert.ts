import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'
import Patient from './Patient'

export default class AiAlert extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public patientId: number

  @column()
  public risk: string

  @column.dateTime({
    serializeAs: null,
  })
  public alertDate: DateTime

  @column()
  public aiRecommendation: string | null

  @column()
  public sentVia: string | null

  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Patient)
  public patient: BelongsTo<typeof Patient>
}
