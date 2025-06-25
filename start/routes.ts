/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ view }) => {
  return view.render('welcome')
})

Route.get('/dashboard', async ({ view }) => {
  return view.render('dashboard', { activeRoute: 'dashboard' })
})

Route.get('/patients', async ({ view }) => {
  return view.render('patients', { activeRoute: 'patients' })
})

Route.get('/visits', async ({ view }) => {
  return view.render('visits', { activeRoute: 'visits' })
})

Route.get('/chat', async ({ view }) => {
  return view.render('chat', { activeRoute: 'chat' })
})

Route.get('/ai-alerts', async ({ view }) => {
  return view.render('ai-alerts', { activeRoute: 'ai-alerts' })
})

Route.get('/reports', async ({ view }) => {
  return view.render('reports', { activeRoute: 'reports' })
})

Route.group(() => {
  Route.get('/dashboard-summary', 'DashboardController.index')
  Route.get('/dashboard/high-risk-patients', 'DashboardController.getHighRiskPatients')
  Route.get('/dashboard/today-appointments', 'DashboardController.getTodayAppointments')
  Route.get('/dashboard/recent-ai-alerts', 'DashboardController.getRecentAiAlerts')

  // Patient Routes
  Route.get('/patients', 'PatientsController.index')
  Route.post('/patients', 'PatientsController.store')

  // Appointment Routes
  Route.get('/appointments', 'AppointmentsController.index')
  Route.post('/appointments', 'AppointmentsController.store')
  Route.put('/appointments/:id/note', 'AppointmentsController.updateNote')

  // AI Alert Routes
  Route.get('/ai-alerts', 'AiAlertsController.index')
  Route.put('/ai-alerts/:id/status', 'AiAlertsController.updateStatus')

  // Chat Routes
  Route.get('/chat/:patientId', 'ChatsController.index')
  Route.post('/chat', 'ChatsController.store')

  // Report Routes
  Route.get('/reports', 'ReportsController.index')
}).prefix('/api')
