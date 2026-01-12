package com.pets.petcare.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "*")
@Slf4j
public class ImageUploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImages(@RequestParam("files") MultipartFile[] files) {
        try {
            List<String> imageUrls = new ArrayList<>();
            
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, "products");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    continue;
                }

                // Validate file type
                String contentType = file.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    return ResponseEntity.badRequest()
                            .body(new ImageUploadResponse(false, "Only image files are allowed", null));
                }

                // Validate file size (5MB limit)
                if (file.getSize() > 5 * 1024 * 1024) {
                    return ResponseEntity.badRequest()
                            .body(new ImageUploadResponse(false, "File size must be less than 5MB", null));
                }

                // Generate unique filename
                String originalFilename = file.getOriginalFilename();
                String extension = originalFilename != null && originalFilename.contains(".") 
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
                String filename = UUID.randomUUID().toString() + extension;

                // Save file
                Path filePath = uploadPath.resolve(filename);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                // Add URL to list
                String imageUrl = "/uploads/products/" + filename;
                imageUrls.add(imageUrl);
                
                log.info("Image uploaded successfully: {}", imageUrl);
            }

            return ResponseEntity.ok(new ImageUploadResponse(true, "Images uploaded successfully", imageUrls));

        } catch (IOException e) {
            log.error("Error uploading images: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(new ImageUploadResponse(false, "Failed to upload images: " + e.getMessage(), null));
        }
    }

    // Response DTO
    public static class ImageUploadResponse {
        private boolean success;
        private String message;
        private List<String> imageUrls;

        public ImageUploadResponse(boolean success, String message, List<String> imageUrls) {
            this.success = success;
            this.message = message;
            this.imageUrls = imageUrls;
        }

        // Getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public List<String> getImageUrls() { return imageUrls; }
        public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    }
}