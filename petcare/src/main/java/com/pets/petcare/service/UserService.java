package com.pets.petcare.service;

import com.pets.petcare.dto.ProfileUpdateRequest;
import com.pets.petcare.dto.UserProfileResponse;
import com.pets.petcare.entity.*;
import com.pets.petcare.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PetOwnerRepository petOwnerRepository;
    private final VeterinarianRepository veterinarianRepository;
    private static final String UPLOAD_DIR = "uploads/profiles/";

    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return buildProfileResponse(user);
    }

    public UserProfileResponse getUserProfileById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return buildProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update user basic info
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        // Update role-specific info
        if (user.getRole() == User.Role.OWNER) {
            updatePetOwnerProfile(user, request);
        } else if (user.getRole() == User.Role.VET) {
            updateVeterinarianProfile(user, request);
        }

        log.info("Profile updated for user: {}", email);
        return buildProfileResponse(user);
    }

    private void updatePetOwnerProfile(User user, ProfileUpdateRequest request) {
        PetOwner petOwner = petOwnerRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    PetOwner created = new PetOwner();
                    created.setUser(user);
                    return created;
                });

        petOwner.setAddress(request.getAddress());
        petOwner.setPreferences(request.getPreferences());
        petOwner.setEmergencyContact(request.getEmergencyContact());

        petOwnerRepository.save(petOwner);
    }

    private void updateVeterinarianProfile(User user, ProfileUpdateRequest request) {
        Veterinarian vet = veterinarianRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Veterinarian created = new Veterinarian();
                    created.setUser(user);
                    return created;
                });

        vet.setClinicName(request.getClinicName());
        vet.setSpecialization(request.getSpecialization());
        vet.setClinicAddress(request.getClinicAddress());
        vet.setLicenseNumber(request.getLicenseNumber());
        vet.setYearsOfExperience(request.getYearsOfExperience());
        vet.setQualifications(request.getQualifications());
        vet.setBio(request.getBio());
        vet.setWorkingHours(request.getWorkingHours());
        if (request.getAvailableForTeleconsult() != null) {
            vet.setAvailableForTeleconsult(request.getAvailableForTeleconsult());
        }
        vet.setConsultationFee(request.getConsultationFee());

        veterinarianRepository.save(vet);
    }

    @Transactional
    public String uploadProfilePhoto(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            String photoUrl = "/uploads/profiles/" + filename;

            // Update photo in role-specific table (create if missing)
            if (user.getRole() == User.Role.OWNER) {
                PetOwner petOwner = petOwnerRepository.findByUserId(user.getId())
                        .orElseGet(() -> {
                            PetOwner created = new PetOwner();
                            created.setUser(user);
                            return created;
                        });
                petOwner.setProfilePhoto(photoUrl);
                petOwnerRepository.save(petOwner);
            } else if (user.getRole() == User.Role.VET) {
                Veterinarian vet = veterinarianRepository.findByUserId(user.getId())
                        .orElseGet(() -> {
                            Veterinarian created = new Veterinarian();
                            created.setUser(user);
                            return created;
                        });
                vet.setProfilePhoto(photoUrl);
                veterinarianRepository.save(vet);
            }

            log.info("Profile photo uploaded for user: {}", email);
            return photoUrl;

        } catch (IOException e) {
            log.error("Failed to upload profile photo", e);
            throw new RuntimeException("Failed to upload profile photo");
        }
    }

    private UserProfileResponse buildProfileResponse(User user) {
        UserProfileResponse.Builder builder = UserProfileResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .isActive(user.getIsActive());

        // Add role-specific data
        if (user.getRole() == User.Role.OWNER) {
            petOwnerRepository.findByUserId(user.getId()).ifPresent(owner -> {
                builder.ownerId(owner.getId())
                        .ownerAddress(owner.getAddress())
                        .ownerProfilePhoto(owner.getProfilePhoto())
                        .address(owner.getAddress())
                        .profilePhoto(owner.getProfilePhoto())
                        .preferences(owner.getPreferences())
                        .emergencyContact(owner.getEmergencyContact());
            });
        } else if (user.getRole() == User.Role.VET) {
            veterinarianRepository.findByUserId(user.getId()).ifPresent(vet -> {
                builder.vetId(vet.getId())
                        .clinicName(vet.getClinicName())
                        .specialization(vet.getSpecialization())
                        .clinicAddress(vet.getClinicAddress())
                        .vetProfilePhoto(vet.getProfilePhoto())
                        .address(vet.getClinicAddress())
                        .profilePhoto(vet.getProfilePhoto())
                        .licenseNumber(vet.getLicenseNumber())
                        .yearsOfExperience(vet.getYearsOfExperience())
                        .qualifications(vet.getQualifications())
                        .bio(vet.getBio())
                        .workingHours(vet.getWorkingHours())
                        .availableForTeleconsult(vet.getAvailableForTeleconsult())
                        .consultationFee(vet.getConsultationFee());
            });
        }

        return builder.build();
    }
}