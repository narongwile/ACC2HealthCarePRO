import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Patient from 'App/Models/Patient'

export default class PatientsController {
  public async index({ request, response }: HttpContextContract) {
    const { search, bloodSugar, medication, exercise } = request.qs()

    const patientsQuery = Patient.query()

    if (search) {
      patientsQuery.where('name', 'like', `%${search}%`)
    }

    if (bloodSugar) {
      patientsQuery.where('blood_sugar', bloodSugar)
    }

    if (medication) {
      patientsQuery.where('medication', medication)
    }

    if (exercise) {
      patientsQuery.where('exercise', exercise)
    }

    const patients = await patientsQuery.orderBy('name', 'asc')
    return response.ok(patients)
  }

  public async store({ request, response }: HttpContextContract) {
    const { name, gender, age, bloodSugar, medication, exercise } = request.all()

    const patient = await Patient.create({
      name,
      gender,
      age,
      bloodSugar,
      medication,
      exercise,
    })

    return response.created(patient)
  }
}
