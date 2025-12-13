package com.pets.petcare.dto;

import lombok.Data;

@Data
public class VetSearchRequest {
    private String specialization;
    private String location;
    private Boolean teleconsultAvailable;
}
