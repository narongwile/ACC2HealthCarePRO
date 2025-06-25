import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Report from 'App/Models/Report'

export default class ReportsController {
  public async index({ response }: HttpContextContract) {
    const reports = await Report.query().orderBy('date_generated', 'desc')
    return response.ok(reports)
  }
}
