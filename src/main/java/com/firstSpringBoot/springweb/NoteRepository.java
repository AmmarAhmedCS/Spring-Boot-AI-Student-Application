package com.firstSpringBoot.springweb;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository <Note , Long> {

    List<Note> findByTitleContainingIgnoreCase(String title);

    List<Note> findByUserId(Long userId);

}
