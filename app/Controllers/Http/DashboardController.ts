import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Patient from 'App/Models/Patient'
import Appointment from 'App/Models/Appointment'
import AiAlert from 'App/Models/AiAlert'
import { DateTime } from 'luxon'

export default class DashboardController {
  public async index({ response }: HttpContextContract) {
    const highRiskPatientsCount = await AiAlert.query()
export default class DashboardController {}
