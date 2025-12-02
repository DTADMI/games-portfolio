package com.games.backend.controller;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class FirebaseAuthController {

  private final FirebaseAuth firebaseAuth;
  private final FirebaseApp firebaseApp;

  public FirebaseAuthController(FirebaseAuth firebaseAuth, FirebaseApp firebaseApp) {
    this.firebaseAuth = firebaseAuth;
    this.firebaseApp = firebaseApp;
  }

  @GetMapping("/firebase")
  public ResponseEntity<String> testFirebase() {
    try {
      // Verify Firebase is working by getting the project ID
      String projectId = firebaseApp.getOptions().getProjectId();
      return ResponseEntity.ok("Firebase is working! Project ID: " + projectId);
    } catch (Exception e) {
      return ResponseEntity.internalServerError()
        .body("Firebase error: " + e.getMessage() +
          "\nCause: " + (e.getCause() != null ? e.getCause().getMessage() : "No cause"));
    }
  }
}
