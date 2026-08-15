package com.firstSpringBoot.springweb;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
@Table(name = "user")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "username")
    private String username;

    @Column(name = "password")
    private String password;


    // No-argument constructor
    public UserEntity() {
    }


    // Constructor
    public UserEntity(String username, String password) {
        this.username = username;
        this.password = password;
    }


    // Getter for id
    public Long getId() {
        return id;
    }


    // Setter for id
    public void setId(Long id) {
        this.id = id;
    }


    // Getter for username
    public String getUsername() {
        return username;
    }


    // Setter for username
    public void setUsername(String username) {
        this.username = username;
    }


    // Getter for password
    public String getPassword() {
        return password;
    }


    // Setter for password
    public void setPassword(String password) {
        this.password = password;
    }
}