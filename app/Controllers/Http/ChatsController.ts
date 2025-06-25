import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ChatMessage from 'App/Models/ChatMessage'

export default class ChatsController {
  public async index({ params, request, response }: HttpContextContract) {
    const { type } = request.qs()
    const patientId = params.patientId // Assuming patientId is passed as a route param

    const chatMessagesQuery = ChatMessage.query().where('patient_id', patientId).preload('patient')

    if (type) {
      chatMessagesQuery.where('type', type)
    }

    const messages = await chatMessagesQuery.orderBy('created_at', 'asc')
    return response.ok(messages.map(message => ({ ...message.serialize(), patientName: message.patient.name })))
  }

  public async store({ request, response }: HttpContextContract) {
    const { patientId, message, sender, type } = request.all()

    const chatMessage = await ChatMessage.create({
      patientId,
      message,
      sender,
      type,
    })

    return response.created(chatMessage)
  }
}
