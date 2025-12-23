package com.pets.petcare.repository;

import com.pets.petcare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * UserRepository - Database access interface for User entity
 *
 * PURPOSE: This interface handles all database operations for users
 * Spring Data JPA automatically implements this interface - NO CODE NEEDED!
 *
 * JpaRepository provides built-in methods:
 * - save()         : Insert or update user
 * - findById()     : Find user by ID
 * - findAll()      : Get all users
 * - deleteById()   : Delete user by ID
 * - count()        : Count total users
 * - existsById()   : Check if user exists
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email address
     *
     * METHOD NAME PATTERN: Spring automatically implements this!
     * "findBy" + "Email" → searches User table by email column
     *
     * Returns Optional<User> to handle cases where user might not exist
     *
     * USAGE:
     * Optional<User> userOpt = userRepository.findByEmail("john@example.com");
     * if (userOpt.isPresent()) {
     *     User user = userOpt.get();
     * }
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if user exists by email
     *
     * Returns true if a user with this email exists, false otherwise
     *
     * USAGE:
     * boolean exists = userRepository.existsByEmail("john@example.com");
     * if (exists) {
     *     // Email already registered
     * }
     */
    boolean existsByEmail(String email);
    
    /**
     * Count users by role
     */
    long countByRole(User.Role role);
}
