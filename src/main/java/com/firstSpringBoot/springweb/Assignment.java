package com.firstSpringBoot.springweb;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import java.time.LocalDate;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "subject")
    private String subject;

    @Column(name = "description")
    private String description;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "status")
    private String status;

    @Column(name = "user_id")
    private Long userId;


    // No-argument constructor
    public Assignment() {
    }


    // Constructor
    public Assignment(String title, String subject, String description, LocalDate dueDate, String status) {
        this.title = title;
        this.subject = subject;
        this.description = description;
        this.dueDate = dueDate;
        this.status = status;
    }


    // Getter for id
    public Long getId() {
        return id;
    }


    // Setter for id
    public void setId(Long id) {
        this.id = id;
    }


    // Getter for title
    public String getTitle() {
        return title;
    }


    // Setter for title
    public void setTitle(String title) {
        this.title = title;
    }


    // Getter for subject
    public String getSubject() {
        return subject;
    }


    // Setter for subject
    public void setSubject(String subject) {
        this.subject = subject;
    }


    // Getter for description
    public String getDescription() {
        return description;
    }


    // Setter for description
    public void setDescription(String description) {
        this.description = description;
    }


    // Getter for dueDate
    public LocalDate getDueDate() {
        return dueDate;
    }


    // Setter for dueDate
    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }


    // Getter for status
    public String getStatus() {
        return status;
    }


    // Setter for status
    public void setStatus(String status) {
        this.status = status;
    }


    // Getter for userId
    public Long getUserId() {
        return userId;
    }


    // Setter for userId
    public void setUserId(Long userId) {
        this.userId = userId;
    }
}