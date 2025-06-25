import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import AiAlert from 'App/Models/AiAlert'

export default class AiAlertsController {
  public async index({ request, response }: HttpContextContract) {
    const { status } = request.qs()

    const aiAlertsQuery = AiAlert.query().preload('patient')

    if (status && status !== 'all') {
      aiAlertsQuery.where('status', status)
    }

    const aiAlerts = await aiAlertsQuery.orderBy('alert_date', 'desc')
    return response.ok(aiAlerts.map(alert => ({ ...alert.serialize(), patientName: alert.patient.name })))
  }

  public async updateStatus({ params, request, response }: HttpContextContract) {
    const aiAlert = await AiAlert.findOrFail(params.id)
    aiAlert.status = request.input('status')
    await aiAlert.save()

    return response.ok(aiAlert)
  }
}
