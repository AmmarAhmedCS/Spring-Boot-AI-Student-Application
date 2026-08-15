package com.firstSpringBoot.springweb;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimetableRepository extends JpaRepository <Timetable , Long> {

    List<Timetable> findByUserId(Long userId);
}
