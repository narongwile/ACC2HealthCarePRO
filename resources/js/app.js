import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// public/assets/js/app.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('App.js loaded successfully!');

  // --- Global Navigation Active State ---
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.sidebar .navigation a');

  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // --- Tab Functionality (reusable for Visits, Chat, AI Alerts, Reports) ---
  const tabsContainers = document.querySelectorAll('.tabs-container');

  tabsContainers.forEach(container => {
    const tabButtons = container.querySelectorAll('.tab-button');
    const tabContents = container.querySelectorAll('.tab-content > div'); // Assuming direct children are tab content

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Deactivate all tab buttons and content in this container
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.style.display = 'none'); // Hide all content

        // Activate clicked tab button
        button.classList.add('active');

        // Determine which content to show based on the button's text or data-attribute
        // For simplicity, we'll assume the order matches or use text.
        // A more robust solution might use data-attributes on buttons/content.
        const tabIndex = Array.from(tabButtons).indexOf(button);
        if (tabContents[tabIndex]) {
          tabContents[tabIndex].style.display = 'block'; // Or 'flex', 'grid' depending on content layout
        }
      });
    });

    // Initialize: show the first tab's content
    if (tabButtons.length > 0) {
      tabButtons[0].classList.add('active');
      if (tabContents[0]) {
        tabContents[0].style.display = 'block';
      }
    }
  });

  // --- Dashboard Specific Functionalities ---
  const fetchDashboardData = async () => {
    try {
      const summaryResponse = await fetch('/api/dashboard-summary');
      const summaryData = await summaryResponse.json();

      document.querySelector('.alert-card .alert-details').textContent = `${summaryData.highRiskPatientsCount} patients need urgent review. Click to view details.`;
      document.querySelector('.appointments-card p').textContent = `${summaryData.todayAppointmentsCount} scheduled home visits. 2 pending completion.`;

      // Fetch and render Recent AI Alerts
      const recentAlertsResponse = await fetch('/api/dashboard/recent-ai-alerts');
      const recentAlertsData = await recentAlertsResponse.json();
      const alertsTable = document.querySelector('.recent-alerts .alerts-table');
      if (alertsTable) {
        alertsTable.innerHTML = ''; // Clear existing placeholders
        recentAlertsData.forEach(alert => {
          const alertItem = `
            <div class="alert-item">
              <span class="alert-icon-small"><i class="fas fa-caret-up"></i></span>
              <span>${alert.patientName}</span>
              <span>${alert.risk}</span>
              <span>${alert.aiRecommendation}</span>
              <span>${alert.createdAt}</span> <!-- You might want to format this date more nicely -->
              <span class="arrow-right"><i class="fas fa-chevron-right"></i></span>
            </div>
          `;
          alertsTable.insertAdjacentHTML('beforeend', alertItem);
        });
      }

      // Fetch and render Today's Appointments (detailed list, not just count)
      const todayAppointmentsResponse = await fetch('/api/dashboard/today-appointments');
      const todayAppointmentsData = await todayAppointmentsResponse.json();
      const appointmentsList = document.querySelector('.appointments-card .appointments-list');
      if (appointmentsList) {
        appointmentsList.innerHTML = ''; // Clear existing placeholders
        todayAppointmentsData.forEach(appointment => {
          const appointmentItem = `
            <p>${appointment.patientName} - ${appointment.address} - ${appointment.time} - ${appointment.status}</p>
          `;
          appointmentsList.insertAdjacentHTML('beforeend', appointmentItem);
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Call dashboard data fetch on page load
  if (window.location.pathname === '/dashboard') {
    fetchDashboardData();
    renderPatientTrendsChart(); // Call chart rendering function
  }

  // --- Patient Page Specific Functionalities ---
  const fetchPatientsData = async (filters = {}) => {
    try {
      const url = new URL('/api/patients', window.location.origin);
      for (const key in filters) {
        if (filters[key]) {
          url.searchParams.append(key, filters[key]);
        }
      }

      const response = await fetch(url.toString());
      const patientsData = await response.json();

      const patientsTableBody = document.querySelector('.patients-table');
      if (patientsTableBody) {
        // Clear existing patient rows, but keep the header
        const existingRows = patientsTableBody.querySelectorAll('.patient-row:not(.header)');
        existingRows.forEach(row => row.remove());

        patientsData.forEach(patient => {
          const patientRow = `
            <div class="patient-row" data-patient-id="${patient.id}">
              <span class="patient-icon"><i class="fas fa-user"></i></span>
              <span>${patient.name}</span>
              <span>${patient.gender}, ${patient.age}</span>
              <span>FBS: ${patient.bloodSugar ? patient.bloodSugar : 'N/A'} mg/dL</span>
              <span>${patient.medication ? patient.medication : 'No medication'}</span>
              <span>${patient.exercise ? patient.exercise : 'No exercise'}</span>
              <span class="view-icon"><i class="fas fa-eye"></i></span>
            </div>
          `;
          patientsTableBody.insertAdjacentHTML('beforeend', patientRow);
        });

        // Attach event listeners to new view icons
        patientsTableBody.querySelectorAll('.view-icon').forEach(icon => {
          icon.addEventListener('click', (event) => {
            const patientId = event.target.closest('.patient-row').dataset.patientId;
            alert(`View details for patient ID: ${patientId} (Frontend placeholder)`);
            // In a real application, you would navigate to a patient detail page or open a modal.
          });
        });
      }

    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  if (window.location.pathname === '/patients') {
    fetchPatientsData();

    const searchNameInput = document.getElementById('search-name');
    const bloodSugarSelect = document.getElementById('blood-sugar');
    const medicationSelect = document.getElementById('medication');
    const exerciseSelect = document.getElementById('exercise');

    const applyPatientFilters = () => {
      const filters = {
        search: searchNameInput ? searchNameInput.value : '',
        bloodSugar: bloodSugarSelect ? bloodSugarSelect.value : '',
        medication: medicationSelect ? medicationSelect.value : '',
        exercise: exerciseSelect ? exerciseSelect.value : '',
      };
      fetchPatientsData(filters);
    };

    searchNameInput?.addEventListener('input', applyPatientFilters);
    bloodSugarSelect?.addEventListener('change', applyPatientFilters);
    medicationSelect?.addEventListener('change', applyPatientFilters);
    exerciseSelect?.addEventListener('change', applyPatientFilters);
  }

  // Update Dashboard quick actions: Add Patient to navigate to /patients
  const dashboardQuickActions = document.querySelector('.quick-actions');
  if (dashboardQuickActions) {
    dashboardQuickActions.addEventListener('click', (event) => {
      if (event.target.textContent.trim() === 'Add Patient') {
        window.location.href = '/patients';
      } else if (event.target.tagName === 'BUTTON') {
        console.log('Quick action clicked:', event.target.textContent);
        // Implement specific actions here (e.g., redirect, open modal)
      }
    });
  }

  // --- Visits Page Specific Functionalities ---
  const fetchVisitsData = async () => {
    try {
      const upcomingAppointmentsResponse = await fetch('/api/appointments?status=upcoming');
      const upcomingAppointments = await upcomingAppointmentsResponse.json();
      const upcomingAppointmentsTable = document.querySelector('.upcoming-appointments .appointment-list');
      if (upcomingAppointmentsTable) {
        upcomingAppointmentsTable.innerHTML = '';
        upcomingAppointments.forEach(appt => {
          const apptRow = `
            <div class="appointment-item" data-appointment-id="${appt.id}">
              <span>${appt.patientName}</span>
              <span>${appt.address}</span>
              <span>${appt.time}</span>
              <span>${appt.status}</span>
              <span class="view-note-icon"><i class="fas fa-file-alt"></i></span>
            </div>
          `;
          upcomingAppointmentsTable.insertAdjacentHTML('beforeend', apptRow);
        });
      }

      const completedAppointmentsResponse = await fetch('/api/appointments?status=completed');
      const completedAppointments = await completedAppointmentsResponse.json();
      const completedAppointmentsTable = document.querySelector('.completed-appointments .appointment-list');
      if (completedAppointmentsTable) {
        completedAppointmentsTable.innerHTML = '';
        completedAppointments.forEach(appt => {
          const apptRow = `
            <div class="appointment-item" data-appointment-id="${appt.id}">
              <span>${appt.patientName}</span>
              <span>${appt.address}</span>
              <span>${appt.time}</span>
              <span>${appt.status}</span>
              <span class="view-note-icon"><i class="fas fa-file-alt"></i></span>
            </div>
          `;
          completedAppointmentsTable.insertAdjacentHTML('beforeend', apptRow);
        });

        // Add event listener for view note icons for both tables
        document.querySelectorAll('.view-note-icon').forEach(icon => {
          icon.addEventListener('click', (event) => {
            const appointmentId = event.target.closest('.appointment-item').dataset.appointmentId;
            // In a real app, you'd fetch the note or open a modal to display it
            alert(`View note for appointment ID: ${appointmentId} (Frontend placeholder)`);
          });
        });
      }

    } catch (error) {
      console.error('Error fetching appointments data:', error);
    }
  };

  if (window.location.pathname === '/visits') {
    fetchVisitsData();
  }

  // Visits: Save Visit Note functionality
  const saveVisitNoteBtn = document.querySelector('.add-note-section .btn-primary');
  if (saveVisitNoteBtn) {
    saveVisitNoteBtn.addEventListener('click', async () => {
      const visitNoteTextarea = document.querySelector('.add-note-section textarea');
      const visitNote = visitNoteTextarea.value;
      // This is a placeholder. In a real application, you'd get the appointment ID dynamically.
      // For now, let's assume a fixed ID or get it from a selected appointment.
      const appointmentId = 1; // Placeholder ID

      try {
        const response = await fetch(`/api/appointments/${appointmentId}/note`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ note: visitNote }),
        });

        if (response.ok) {
          alert('Visit note saved successfully!');
          visitNoteTextarea.value = ''; // Clear textarea
          fetchVisitsData(); // Refresh appointment list
        } else {
          alert('Failed to save visit note.');
        }
      } catch (error) {
        console.error('Error saving visit note:', error);
        alert('Error saving visit note.');
      }
    });
  }

  // --- AI Alerts Page Specific Functionalities ---
  const fetchAiAlertsData = async (statusFilter = 'all') => {
    try {
      const url = new URL('/api/ai-alerts', window.location.origin);
      if (statusFilter !== 'all') {
        url.searchParams.append('status', statusFilter);
      }

      const response = await fetch(url.toString());
      const alertsData = await response.json();

      const alertsTableBody = document.querySelector('.ai-alerts-table tbody');
      if (alertsTableBody) {
        alertsTableBody.innerHTML = ''; // Clear existing alerts

        alertsData.forEach(alert => {
          const alertRow = `
            <tr data-alert-id="${alert.id}">
              <td>${alert.patientName}</td>
              <td>${alert.risk}</td>
              <td>${alert.alertDate}</td>
              <td>${alert.aiRecommendation || 'N/A'}</td>
              <td>${alert.sentVia || 'N/A'}</td>
              <td>${alert.status}</td>
              <td class="alert-actions">
                <button class="btn-resolve" ${alert.status === 'Resolved' || alert.status === 'Dismissed' ? 'disabled' : ''}>Resolve</button>
                <button class="btn-dismiss" ${alert.status === 'Resolved' || alert.status === 'Dismissed' ? 'disabled' : ''}>Dismiss</button>
              </td>
            </tr>
          `;
          alertsTableBody.insertAdjacentHTML('beforeend', alertRow);
        });

        // Add event listeners for resolve/dismiss buttons
        alertsTableBody.querySelectorAll('.btn-resolve').forEach(button => {
          button.addEventListener('click', async (event) => {
            const alertId = event.target.closest('tr').dataset.alertId;
            try {
              const response = await fetch(`/api/ai-alerts/${alertId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Resolved' }),
              });
              if (response.ok) {
                alert('AI Alert resolved successfully!');
                fetchAiAlertsData(document.querySelector('.ai-alerts-tabs .tab-button.active').dataset.status || 'all'); // Refresh data
              } else {
                alert('Failed to resolve AI Alert.');
              }
            } catch (error) {
              console.error('Error resolving AI Alert:', error);
              alert('Error resolving AI Alert.');
            }
          });
        });

        alertsTableBody.querySelectorAll('.btn-dismiss').forEach(button => {
          button.addEventListener('click', async (event) => {
            const alertId = event.target.closest('tr').dataset.alertId;
            try {
              const response = await fetch(`/api/ai-alerts/${alertId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Dismissed' }),
              });
              if (response.ok) {
                alert('AI Alert dismissed successfully!');
                fetchAiAlertsData(document.querySelector('.ai-alerts-tabs .tab-button.active').dataset.status || 'all'); // Refresh data
              } else {
                alert('Failed to dismiss AI Alert.');
              }
            } catch (error) {
              console.error('Error dismissing AI Alert:', error);
              alert('Error dismissing AI Alert.');
            }
          });
        });
      }
    } catch (error) {
      console.error('Error fetching AI alerts data:', error);
    }
  };

  if (window.location.pathname === '/ai-alerts') {
    fetchAiAlertsData(); // Load all alerts by default

    const aiAlertTabs = document.querySelector('.ai-alerts-tabs');
    if (aiAlertTabs) {
      aiAlertTabs.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (event) => {
          const status = event.target.dataset.status;
          fetchAiAlertsData(status);
        });
      });
    }
  }

  // --- Chart.js for Patient Trends ---
  const renderPatientTrendsChart = () => {
    const ctx = document.getElementById('patientTrendsChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Patient Trends',
            data: [70, 75, 68, 80, 72, 85, 78, 90, 88, 92, 80, 95],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  };

  // --- Chat Page Specific Functionalities ---
  const fetchChatMessages = async (patientId, type = '') => {
    if (!patientId) return; // Don't fetch if no patient is selected
    try {
      const url = new URL(`/api/chat/${patientId}`, window.location.origin);
      if (type) {
        url.searchParams.append('type', type);
      }

      const response = await fetch(url.toString());
      const messages = await response.json();

      const chatMessagesContainer = document.querySelector('.patient-qa-section');
      if (chatMessagesContainer) {
        chatMessagesContainer.innerHTML = ''; // Clear existing messages
        messages.forEach(msg => {
          const messageClass = msg.sender === 'healthcare_pro' ? 'sent' : 'received'; // Assuming healthcare_pro sends messages
          const messageHtml = `
            <div class="chat-message ${messageClass}">
              <p>${msg.message}</p>
              <span class="timestamp">${msg.createdAt} by ${msg.patientName} (${msg.sender})</span>
            </div>
          `;
          chatMessagesContainer.insertAdjacentHTML('beforeend', messageHtml);
        });
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; // Scroll to bottom
      }

    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  if (window.location.pathname === '/chat') {
    // Placeholder for selected patient ID. In a real app, this would come from a patient selection mechanism.
    const selectedPatientId = 1; // Example: Assuming patient with ID 1 is currently being chatted with

    // Initial load of messages for LINE tab
    fetchChatMessages(selectedPatientId, 'LINE');

    // Tab switching for chat messages
    const chatTabs = document.querySelector('.chat-tabs');
    if (chatTabs) {
      chatTabs.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (event) => {
          const type = event.target.dataset.type;
          fetchChatMessages(selectedPatientId, type);
        });
      });
    }

    // Chat Send/Cancel functionality
    const chatSendBtn = document.querySelector('.send-reminder-section .btn-primary');
    const chatCancelBtn = document.querySelector('.send-reminder-section .btn-secondary');

    if (chatSendBtn) {
      chatSendBtn.addEventListener('click', async () => {
        const patientNameInput = document.getElementById('patient-name');
        const messageInput = document.getElementById('message');

        const patientName = patientNameInput.value;
        const message = messageInput.value;

        if (!patientName || !message) {
          alert('Please enter patient name and message.');
          return;
        }

        // In a real application, you'd get the patientId based on the patientName
        // For now, using the placeholder selectedPatientId
        const patientId = selectedPatientId;
        const sender = 'healthcare_pro'; // Assuming the user is a healthcare professional
        const type = document.querySelector('.chat-tabs .tab-button.active').dataset.type || 'LINE'; // Get active tab type

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ patientId, message, sender, type }),
          });

          if (response.ok) {
            alert('Message sent successfully!');
            messageInput.value = ''; // Clear message input
            fetchChatMessages(patientId, type); // Refresh chat messages
          } else {
            alert('Failed to send message.');
          }
        } catch (error) {
          console.error('Error sending message:', error);
          alert('Error sending message.');
        }
      });
    }

    if (chatCancelBtn) {
      chatCancelBtn.addEventListener('click', () => {
        document.getElementById('patient-name').value = '';
        document.getElementById('message').value = '';
        alert('Message cancelled! (frontend placeholder)');
      });
    }
  }

  // --- Reports Page Specific Functionalities ---
  const fetchReportsData = async () => {
    try {
      const response = await fetch('/api/reports');
      const reportsData = await response.json();

      const recentReportsGrid = document.querySelector('.recent-reports-grid');
      const downloadHistoryTable = document.querySelector('.download-history-table tbody');

      if (recentReportsGrid) {
        recentReportsGrid.innerHTML = ''; // Clear existing reports
        // Display up to 3 recent reports in the grid
        reportsData.slice(0, 3).forEach(report => {
          const reportItem = `
            <div class="report-card">
              <h3>${report.reportName}</h3>
              <p>Generated: ${report.dateGenerated}</p>
              <p>By: ${report.generatedBy}</p>
              <a href="${report.filePath || '#'}" class="btn btn-primary" ${report.filePath ? '' : 'disabled'}>Download</a>
            </div>
          `;
          recentReportsGrid.insertAdjacentHTML('beforeend', reportItem);
        });
      }

      if (downloadHistoryTable) {
        downloadHistoryTable.innerHTML = ''; // Clear existing history
        reportsData.forEach(report => {
          const historyRow = `
            <tr>
              <td>${report.reportName}</td>
              <td>${report.dateGenerated}</td>
              <td>${report.generatedBy}</td>
              <td><a href="${report.filePath || '#'}" ${report.filePath ? '' : 'disabled'}>${report.filePath ? 'Download' : 'N/A'}</a></td>
            </tr>
          `;
          downloadHistoryTable.insertAdjacentHTML('beforeend', historyRow);
        });
      }

    } catch (error) {
      console.error('Error fetching reports data:', error);
    }
  };

  if (window.location.pathname === '/reports') {
    fetchReportsData();
  }
});