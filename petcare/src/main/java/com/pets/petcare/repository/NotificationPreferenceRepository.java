package com.pets.petcare.repository;

import com.pets.petcare.entity.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    /**
     * Find notification preferences by user ID
     */
    Optional<NotificationPreference> findByUserId(Long userId);

    /**
     * Check if user exists in notification preferences
     */
    boolean existsByUserId(Long userId);
}