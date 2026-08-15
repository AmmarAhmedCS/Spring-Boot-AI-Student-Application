package com.firstSpringBoot.springweb;

import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimetableRepository timetableRepository;

    public TimetableController(TimetableRepository timetableRepository) {
        this.timetableRepository = timetableRepository;
    }


    // 1. Show All Timetable Entries (only the logged-in student's own)
    @GetMapping("/all")
    public List<Timetable> getAllTimetableEntries(HttpSession session) {

        Object userId = session.getAttribute("userId");
        if (userId == null) {
            return List.of();
        }

        return timetableRepository.findByUserId((Long) userId);
    }


    // 2. Show One Timetable Entry
    @GetMapping("/get/{id}")
    public Timetable getTimetableEntry(@PathVariable Long id) {

        return timetableRepository.findById(id).orElse(null);
    }


    // 3. Add Timetable Entry
    @PostMapping("/create")
    public Timetable addTimetableEntry(@RequestBody Timetable timetable, HttpSession session) {

        Object userId = session.getAttribute("userId");
        if (userId != null) {
            timetable.setUserId((Long) userId);
        }

        return timetableRepository.save(timetable);
    }


    // 4. Update Timetable Entry
    @PutMapping("/update/{id}")
    public Timetable updateTimetableEntry(
            @PathVariable Long id,
            @RequestBody Timetable updatedTimetable) {

        Timetable existing = timetableRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setDayOfWeek(updatedTimetable.getDayOfWeek());
        existing.setSubject(updatedTimetable.getSubject());
        existing.setTeacher(updatedTimetable.getTeacher());
        existing.setStartTime(updatedTimetable.getStartTime());
        existing.setEndTime(updatedTimetable.getEndTime());
        existing.setRoom(updatedTimetable.getRoom());

        return timetableRepository.save(existing);
    }


    // 5. Delete Timetable Entry
    @DeleteMapping("/delete/{id}")
    public String deleteTimetableEntry(@PathVariable Long id) {

        if (timetableRepository.existsById(id)) {
            timetableRepository.deleteById(id);
            return "Timetable Entry Deleted Successfully";
        }

        return "Timetable Entry Not Found";
    }
}