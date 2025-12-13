package com.pets.petcare.service;

import com.pets.petcare.dto.*;
import com.pets.petcare.entity.*;
import com.pets.petcare.repository.*;
import com.pets.petcare.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PetOwnerRepository petOwnerRepository;
    private final VeterinarianRepository veterinarianRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
            PetOwnerRepository petOwnerRepository,
            VeterinarianRepository veterinarianRepository,
            OtpService otpService,
            EmailService emailService,
            JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.petOwnerRepository = petOwnerRepository;
        this.veterinarianRepository = veterinarianRepository;
        this.otpService = otpService;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public ApiResponse initiateRegistration(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        otpService.generateAndSendOtp(request.getEmail(), OtpToken.OtpType.REGISTRATION);

        return new ApiResponse(true, "OTP sent to your email. Please verify to complete registration.");
    }

    @Transactional
    public AuthResponse completeRegistration(OtpVerificationRequest request, RegisterRequest registerRequest) {
        // Verify OTP
        boolean isOtpValid = otpService.verifyOtp(
                request.getEmail(),
                request.getOtp(),
                OtpToken.OtpType.REGISTRATION);

        if (!isOtpValid) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Create User
        User user = new User();
        user.setEmail(registerRequest.getEmail());
        user.setName(registerRequest.getName());
        user.setPhone(registerRequest.getPhone());
        user.setRole(User.Role.valueOf(registerRequest.getRole()));
        user.setIsVerified(true);
        user.setIsActive(true);

        user = userRepository.save(user);

        // Create role-specific records
        if (registerRequest.getRole().equals("OWNER")) {
            PetOwner petOwner = new PetOwner();
            petOwner.setUser(user);
            petOwner.setAddress(null);
            petOwnerRepository.save(petOwner);
        } else if (registerRequest.getRole().equals("VET")) {
            Veterinarian veterinarian = new Veterinarian();
            veterinarian.setUser(user);
            veterinarian.setClinicName(registerRequest.getClinicName());
            veterinarian.setSpecialization(registerRequest.getSpecialization());
            veterinarian.setAvailableForTeleconsult(true);
            veterinarianRepository.save(veterinarian);
        }

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getName());

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        Long vetId = null;
        if (user.getRole() == User.Role.VET) {
            Veterinarian vet = veterinarianRepository.findByUserId(user.getId())
                    .orElse(null);
            if (vet != null)
                vetId = vet.getId();
        }

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .vetId(vetId)
                .message("Registration successful")
                .build();
    }

    @Transactional
    public ApiResponse initiateLogin(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getIsActive()) {
            throw new RuntimeException("Account is deactivated");
        }

        otpService.generateAndSendOtp(request.getEmail(), OtpToken.OtpType.LOGIN);

        return new ApiResponse(true, "OTP sent to your email");
    }

    @Transactional
    public AuthResponse completeLogin(OtpVerificationRequest request) {
        boolean isOtpValid = otpService.verifyOtp(
                request.getEmail(),
                request.getOtp(),
                OtpToken.OtpType.LOGIN);

        if (!isOtpValid) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        log.info("User logged in successfully: {}", user.getEmail());

        Long vetId = null;
        if (user.getRole() == User.Role.VET) {
            Veterinarian vet = veterinarianRepository.findByUserId(user.getId())
                    .orElse(null);
            if (vet != null)
                vetId = vet.getId();
        }

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .vetId(vetId)
                .message("Login successful")
                .build();
    }
}