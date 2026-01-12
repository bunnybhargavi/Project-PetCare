package com.pets.petcare.service;

import com.pets.petcare.dto.AdminStatsResponse;
import com.pets.petcare.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VetDashboardService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public AdminStatsResponse getVetStats(Long vetId) {
        AdminStatsResponse stats = new AdminStatsResponse();
        
        // Vet-specific appointment statistics
        stats.setTotalAppointments(appointmentRepository.count());
        stats.setUpcomingAppointments(appointmentRepository.countUpcomingAppointmentsByVet(vetId));
        stats.setCompletedAppointments(appointmentRepository.countCompletedAppointmentsByVet(vetId));
        stats.setTodayAppointments(appointmentRepository.countTodayAppointmentsByVet(vetId));
        
        return stats;
    }
}