package com.firstSpringBoot.springweb;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import java.time.LocalDate;

@Entity
@Table(name = "notes")
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "subject")
    private String subject;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_date")
    private LocalDate createdDate;

    @Column(name = "user_id")
    private Long userId;


    // No-argument constructor
    public Note() {
    }


    // Constructor
    public Note(String title, String subject, String content, LocalDate createdDate) {
        this.title = title;
        this.subject = subject;
        this.content = content;
        this.createdDate = createdDate;
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


    // Getter for content
    public String getContent() {
        return content;
    }


    // Setter for content
    public void setContent(String content) {
        this.content = content;
    }


    // Getter for createdDate
    public LocalDate getCreatedDate() {
        return createdDate;
    }


    // Setter for createdDate
    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
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