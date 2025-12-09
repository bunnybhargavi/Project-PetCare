package com.pets.petcare.repository;

import com.pets.petcare.entity.Vaccination;
import com.pets.petcare.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {
    List<Vaccination> findByPetOrderByDateGivenDesc(Pet pet);
    List<Vaccination> findByPetIdOrderByDateGivenDesc(Long petId);
    List<Vaccination> findByNextDueDateBetween(LocalDate start, LocalDate end);
    List<Vaccination> findByPetAndNextDueDateBefore(Pet pet, LocalDate date);
}
