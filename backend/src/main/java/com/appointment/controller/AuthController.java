package com.appointment.controller;

import com.appointment.dto.LoginRequest;
import com.appointment.dto.SignupRequest;
import com.appointment.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}


// package com.appointment.controller;

// import com.appointment.dto.LoginRequest;
// import com.appointment.dto.SignupRequest;
// import com.appointment.service.AuthService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.Map;

// @RestController
// @RequestMapping("/api/auth")
// @RequiredArgsConstructor
// @CrossOrigin(origins = "http://localhost:5173")
// public class AuthController {

//     private final AuthService authService;

//     @PostMapping("/signup")
//     public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
//         try {
//             return ResponseEntity.ok(authService.signup(request));
//         } catch (Exception e) {
//             return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
//         }
//     }

//     @PostMapping("/login")
//     public ResponseEntity<?> login(@RequestBody LoginRequest request) {
//         try {
//             return ResponseEntity.ok(authService.login(request));
//         } catch (Exception e) {
//             return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
//         }
//     }
// }