package com.pets.petcare.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

import jakarta.servlet.MultipartConfigElement;
import java.util.Arrays;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app.upload")
public class FileUploadConfig {
    
    private String dir = "uploads";
    private long maxFileSize = 10 * 1024 * 1024; // 10MB
    private long maxRequestSize = 10 * 1024 * 1024; // 10MB
    private List<String> allowedImageTypes = Arrays.asList("image/jpeg", "image/jpg", "image/png", "image/gif");
    private List<String> allowedDocumentTypes = Arrays.asList("application/pdf", "image/jpeg", "image/jpg", "image/png");
    
    @Bean
    public MultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }
    
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        return new MultipartConfigElement(
            System.getProperty("java.io.tmpdir"),
            maxFileSize,
            maxRequestSize,
            (int) (maxFileSize / 2)
        );
    }
    
    public boolean isValidImageType(String contentType) {
        return allowedImageTypes.contains(contentType.toLowerCase());
    }
    
    public boolean isValidDocumentType(String contentType) {
        return allowedDocumentTypes.contains(contentType.toLowerCase());
    }
    
    public boolean isValidFileSize(long fileSize) {
        return fileSize > 0 && fileSize <= maxFileSize;
    }
    
    // Getters and setters
    public String getDir() {
        return dir;
    }
    
    public void setDir(String dir) {
        this.dir = dir;
    }
    
    public long getMaxFileSize() {
        return maxFileSize;
    }
    
    public void setMaxFileSize(long maxFileSize) {
        this.maxFileSize = maxFileSize;
    }
    
    public long getMaxRequestSize() {
        return maxRequestSize;
    }
    
    public void setMaxRequestSize(long maxRequestSize) {
        this.maxRequestSize = maxRequestSize;
    }
    
    public List<String> getAllowedImageTypes() {
        return allowedImageTypes;
    }
    
    public void setAllowedImageTypes(List<String> allowedImageTypes) {
        this.allowedImageTypes = allowedImageTypes;
    }
    
    public List<String> getAllowedDocumentTypes() {
        return allowedDocumentTypes;
    }
    
    public void setAllowedDocumentTypes(List<String> allowedDocumentTypes) {
        this.allowedDocumentTypes = allowedDocumentTypes;
    }
}