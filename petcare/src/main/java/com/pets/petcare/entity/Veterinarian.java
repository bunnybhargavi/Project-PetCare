package com.pets.petcare.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Veterinarian Entity - Stores veterinarian specific information
 * Linked to User table via One-to-One relationship
 */
@Entity
@Table(name = "veterinarians")
public class Veterinarian {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // One-to-One relationship with User
  @OneToOne
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  @JsonManagedReference
  private User user;

  // Veterinarian specific fields
  @Column(nullable = false)
  private String clinicName;

  @Column(nullable = false)
  private String specialization;

  private String clinicAddress;

  private String profilePhoto;

  private String licenseNumber; // Professional license number

  private Integer yearsOfExperience;

  @Column(columnDefinition = "TEXT")
  private String qualifications; // Education and certifications

  @Column(columnDefinition = "TEXT")
  private String bio; // Professional bio

  private String workingHours; // e.g., "Mon-Fri: 9AM-6PM"

  @Column(nullable = false)
  private Boolean availableForTeleconsult = true;

  private Double consultationFee;

  @CreationTimestamp
  @Column(updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  private LocalDateTime updatedAt;

  public Veterinarian() {
  }

  public Veterinarian(Long id, User user, String clinicName, String specialization, String clinicAddress,
      String profilePhoto, String licenseNumber, Integer yearsOfExperience, String qualifications, String bio,
      String workingHours, Boolean availableForTeleconsult, Double consultationFee, LocalDateTime createdAt,
      LocalDateTime updatedAt) {
    this.id = id;
    this.user = user;
    this.clinicName = clinicName;
    this.specialization = specialization;
    this.clinicAddress = clinicAddress;
    this.profilePhoto = profilePhoto;
    this.licenseNumber = licenseNumber;
    this.yearsOfExperience = yearsOfExperience;
    this.qualifications = qualifications;
    this.bio = bio;
    this.workingHours = workingHours;
    this.availableForTeleconsult = availableForTeleconsult;
    this.consultationFee = consultationFee;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public String getClinicName() {
    return clinicName;
  }

  public void setClinicName(String clinicName) {
    this.clinicName = clinicName;
  }

  public String getSpecialization() {
    return specialization;
  }

  public void setSpecialization(String specialization) {
    this.specialization = specialization;
  }

  public String getClinicAddress() {
    return clinicAddress;
  }

  public void setClinicAddress(String clinicAddress) {
    this.clinicAddress = clinicAddress;
  }

  public String getProfilePhoto() {
    return profilePhoto;
  }

  public void setProfilePhoto(String profilePhoto) {
    this.profilePhoto = profilePhoto;
  }

  public String getLicenseNumber() {
    return licenseNumber;
  }

  public void setLicenseNumber(String licenseNumber) {
    this.licenseNumber = licenseNumber;
  }

  public Integer getYearsOfExperience() {
    return yearsOfExperience;
  }

  public void setYearsOfExperience(Integer yearsOfExperience) {
    this.yearsOfExperience = yearsOfExperience;
  }

  public String getQualifications() {
    return qualifications;
  }

  public void setQualifications(String qualifications) {
    this.qualifications = qualifications;
  }

  public String getBio() {
    return bio;
  }

  public void setBio(String bio) {
    this.bio = bio;
  }

  public String getWorkingHours() {
    return workingHours;
  }

  public void setWorkingHours(String workingHours) {
    this.workingHours = workingHours;
  }

  public Boolean getAvailableForTeleconsult() {
    return availableForTeleconsult;
  }

  public void setAvailableForTeleconsult(Boolean availableForTeleconsult) {
    this.availableForTeleconsult = availableForTeleconsult;
  }

  public Double getConsultationFee() {
    return consultationFee;
  }

  public void setConsultationFee(Double consultationFee) {
    this.consultationFee = consultationFee;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }
}
