package com.firstSpringBoot.springweb;

import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;

    public AssignmentController(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }


    // 1. Show All Assignments (only the logged-in student's own)
    @GetMapping("/all")
    public List<Assignment> getAllAssignments(HttpSession session) {

        Object userId = session.getAttribute("userId");
        if (userId == null) {
            return List.of();
        }

        return assignmentRepository.findByUserId((Long) userId);
    }


    // 2. Show One Assignment
    @GetMapping("/get/{id}")
    public Assignment getAssignment(@PathVariable Long id) {

        return assignmentRepository.findById(id).orElse(null);
    }


    // 3. Add Assignment
    @PostMapping("/create")
    public Assignment addAssignment(@RequestBody Assignment assignment, HttpSession session) {

        Object userId = session.getAttribute("userId");
        if (userId != null) {
            assignment.setUserId((Long) userId);
        }

        return assignmentRepository.save(assignment);
    }


    // 4. Update Assignment
    @PutMapping("/update/{id}")
    public Assignment updateAssignment(
            @PathVariable Long id,
            @RequestBody Assignment updatedAssignment) {

        Assignment existing = assignmentRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setTitle(updatedAssignment.getTitle());
        existing.setSubject(updatedAssignment.getSubject());
        existing.setDescription(updatedAssignment.getDescription());
        existing.setDueDate(updatedAssignment.getDueDate());
        existing.setStatus(updatedAssignment.getStatus());

        return assignmentRepository.save(existing);
    }


    // 5. Delete Assignment
    @DeleteMapping("/delete/{id}")
    public String deleteAssignment(@PathVariable Long id) {

        if (assignmentRepository.existsById(id)) {
            assignmentRepository.deleteById(id);
            return "Assignment Deleted Successfully";
        }

        return "Assignment Not Found";
    }
}