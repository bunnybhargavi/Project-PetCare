package com.pets.petcare.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityPost {
    private Long id;
    private String authorName;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private Integer likes;
}

