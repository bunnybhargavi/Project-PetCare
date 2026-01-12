package com.pets.petcare.controller;

import com.pets.petcare.dto.CommunityPost;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    private final AtomicLong idGen = new AtomicLong(1);
    private final List<CommunityPost> posts = new ArrayList<>();

    public CommunityController() {
        posts.add(CommunityPost.builder()
                .id(idGen.getAndIncrement())
                .authorName("Demo User")
                .title("Welcome to the community!")
                .content("Share your pet tips, stories, and photos.")
                .createdAt(LocalDateTime.now().minusDays(3))
                .likes(12)
                .build());
        posts.add(CommunityPost.builder()
                .id(idGen.getAndIncrement())
                .authorName("Luna's Parent")
                .title("Siamese grooming routine")
                .content("Brush twice weekly and check nails monthly.")
                .createdAt(LocalDateTime.now().minusDays(1))
                .likes(7)
                .build());
    }

    @GetMapping("/posts")
    public ResponseEntity<List<CommunityPost>> listPosts(@RequestParam(value = "q", required = false) String q) {
        if (q == null || q.isBlank()) return ResponseEntity.ok(posts);
        String term = q.toLowerCase();
        List<CommunityPost> filtered = posts.stream()
                .filter(p -> (p.getTitle() + " " + p.getContent()).toLowerCase().contains(term))
                .collect(Collectors.toList());
        return ResponseEntity.ok(filtered);
    }

    @PostMapping("/posts")
    public ResponseEntity<CommunityPost> createPost(@RequestBody CommunityPost req) {
        CommunityPost created = CommunityPost.builder()
                .id(idGen.getAndIncrement())
                .authorName(req.getAuthorName() == null ? "Anonymous" : req.getAuthorName())
                .title(req.getTitle())
                .content(req.getContent())
                .createdAt(LocalDateTime.now())
                .likes(0)
                .build();
        posts.add(created);
        return ResponseEntity.ok(created);
    }
}
