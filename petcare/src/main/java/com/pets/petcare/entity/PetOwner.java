package com.pets.petcare.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * PetOwner Entity - Stores pet owner specific information
 * Linked to User table via One-to-One relationship
 */
@Entity
@Table(name = "pet_owners")
public class PetOwner {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // One-to-One relationship with User
  @OneToOne
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  @JsonManagedReference
  private User user;

  // Pet Owner specific fields
  private String address;

  private String profilePhoto;

  @Column(columnDefinition = "TEXT")
  private String preferences; // Pet care preferences, notes

  @Column(columnDefinition = "TEXT")
  private String emergencyContact; // Emergency contact info

  @CreationTimestamp
  @Column(updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  private LocalDateTime updatedAt;

  public PetOwner() {
  }

  public PetOwner(Long id, User user, String address, String profilePhoto, String preferences, String emergencyContact,
      LocalDateTime createdAt, LocalDateTime updatedAt) {
    this.id = id;
    this.user = user;
    this.address = address;
    this.profilePhoto = profilePhoto;
    this.preferences = preferences;
    this.emergencyContact = emergencyContact;
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

  public String getAddress() {
    return address;
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public String getProfilePhoto() {
    return profilePhoto;
  }

  public void setProfilePhoto(String profilePhoto) {
    this.profilePhoto = profilePhoto;
  }

  public String getPreferences() {
    return preferences;
  }

  public void setPreferences(String preferences) {
    this.preferences = preferences;
  }

  public String getEmergencyContact() {
    return emergencyContact;
  }

  public void setEmergencyContact(String emergencyContact) {
    this.emergencyContact = emergencyContact;
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
