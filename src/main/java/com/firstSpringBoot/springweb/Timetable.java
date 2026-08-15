package com.firstSpringBoot.springweb;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import java.time.LocalTime;

@Entity
@Table(name = "timetable")
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "day_of_week")
    private String dayOfWeek;

    @Column(name = "subject")
    private String subject;

    @Column(name = "teacher")
    private String teacher;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "room")
    private String room;

    @Column(name = "user_id")
    private Long userId;


    // No-argument constructor
    public Timetable() {
    }


    // Constructor
    public Timetable(String dayOfWeek, String subject, String teacher, LocalTime startTime, LocalTime endTime, String room) {
        this.dayOfWeek = dayOfWeek;
        this.subject = subject;
        this.teacher = teacher;
        this.startTime = startTime;
        this.endTime = endTime;
        this.room = room;
    }


    // Getter for id
    public Long getId() {
        return id;
    }


    // Setter for id
    public void setId(Long id) {
        this.id = id;
    }


    // Getter for dayOfWeek
    public String getDayOfWeek() {
        return dayOfWeek;
    }


    // Setter for dayOfWeek
    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }


    // Getter for subject
    public String getSubject() {
        return subject;
    }


    // Setter for subject
    public void setSubject(String subject) {
        this.subject = subject;
    }


    // Getter for teacher
    public String getTeacher() {
        return teacher;
    }


    // Setter for teacher
    public void setTeacher(String teacher) {
        this.teacher = teacher;
    }


    // Getter for startTime
    public LocalTime getStartTime() {
        return startTime;
    }


    // Setter for startTime
    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }


    // Getter for endTime
    public LocalTime getEndTime() {
        return endTime;
    }


    // Setter for endTime
    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }


    // Getter for room
    public String getRoom() {
        return room;
    }


    // Setter for room
    public void setRoom(String room) {
        this.room = room;
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