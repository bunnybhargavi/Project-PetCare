package com.pets.petcare.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VetResponse {
    private Long id;
    private String name;
    private String clinicName;
    private String city;
    private String specialization;
    private String contactPhone;
    private Double rating;
}

