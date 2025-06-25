import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Appointment from 'App/Models/Appointment'
import { DateTime } from 'luxon'

export default class AppointmentsController {
  public async index({ request, response }: HttpContextContract) {
    const { status } = request.qs()

    const appointmentsQuery = Appointment.query().preload('patient')

    if (status === 'upcoming') {
      appointmentsQuery.where('time', '>=', DateTime.local().toISODate())
    } else if (status === 'completed') {
      appointmentsQuery.where('time', '<', DateTime.local().toISODate())
    }

    const appointments = await appointmentsQuery.orderBy('time', 'asc')
    return response.ok(appointments.map(appointment => ({ ...appointment.serialize(), patientName: appointment.patient.name })))
  }

  public async store({ request, response }: HttpContextContract) {
    const { patientId, address, time, status, note } = request.all()

    const appointment = await Appointment.create({
      patientId,
      address,
      time,
      status,
      note,
    })

    return response.created(appointment)
  }

  public async updateNote({ params, request, response }: HttpContextContract) {
    const appointment = await Appointment.findOrFail(params.id)
    appointment.note = request.input('note')
    await appointment.save()

    return response.ok(appointment)
  }
}
