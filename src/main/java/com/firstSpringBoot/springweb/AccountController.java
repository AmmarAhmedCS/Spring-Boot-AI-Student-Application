package com.firstSpringBoot.springweb;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Set;
import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api")
public class AccountController {


    @Autowired
    private UserRepository userRepository;

    // 1. Register Account
    @PostMapping("/register")
    public String register(@RequestParam String username, @RequestParam String password) {

        if (username == null || username.trim().isEmpty()) {
            return "Username can't be empty. Please enter a valid username";
        }

        else if (password == null || password.trim().isEmpty()) {
            return "password can't be empty . Please enter a valid password";
        }

        else if (userRepository.existsByUsername(username)) {
            return "Username Already Exists";
        }

        UserEntity user = new UserEntity();

        user.setUsername(username);
        user.setPassword(password);

        userRepository.save(user);

        return "Registration Successful";
    }

    // 2. Login
    @PostMapping("/login")
    public String login(@RequestParam String username, @RequestParam String password, HttpSession session) {

        if (username == null || username.trim().isEmpty()) {
            return "Username can't be empty. Please enter a valid username";
        }

        else if (password == null || password.trim().isEmpty()) {
            return "Password can't be empty. Please enter a valid password";
        }

        Optional<UserEntity> user = userRepository.findByUsername(username);
        if (user.isPresent() && user.get().getPassword().equals(password)) {

            session.setAttribute("userId", user.get().getId());

            return "Login Successful";
        }
        return "Incorrect Username or Password";
    }

    // 3. Update Password
    @PostMapping("/update")
    public String updatePassword(@RequestParam String username,
                                 @RequestParam String password,
                                 @RequestParam String newPassword) {

        if (username == null || username.trim().isEmpty()) {
            return "Username can't be empty. Please enter a valid username";
        }

        else if (password == null || password.trim().isEmpty()) {
            return "Current password can't be empty. Please enter your current password";
        }

        else if (newPassword == null || newPassword.trim().isEmpty()) {
            return "Please Enter New Password";
        }

        Optional<UserEntity> user = userRepository.findByUsername(username);

        if (user.isPresent() && user.get().getPassword().equals(password)) {
            user.get().setPassword(newPassword);
            userRepository.save(user.get());
            return "Password Updated";
        }

        return "Incorrect Username or Password";
    }

    // 4. Remove Account
    @PostMapping("/delete")
    public String removeAccount(@RequestParam String username, @RequestParam String password) {

        if (username == null || username.trim().isEmpty()) {
            return "Username can't be empty. Please enter a valid username";
        }

        else if (password == null || password.trim().isEmpty()) {
            return "Password can't be empty. Please enter a valid password";
        }

        Optional<UserEntity> user = userRepository.findByUsername(username);

        if (user.isPresent() && user.get().getPassword().equals(password)) {
            userRepository.delete(user.get());
            return "Account Removed";
        }
        return "Incorrect Username or Password";
    }

}