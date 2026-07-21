package com.saasfinanceiro.finexp.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.service.UserService;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private UserService service;

    @GetMapping
    public ResponseEntity<List<User>> searchAll() {
        return ResponseEntity.ok(service.listAll());
    }

    // @PostMapping
    // public ResponseEntity<User> insert(@RequestBody @Valid User user) {
    //     return ResponseEntity.status(HttpStatus.CREATED).body(service.insert(user));
    // }

    @PutMapping
    public ResponseEntity<User> update(@RequestBody @Valid User user) {
        return ResponseEntity.ok(service.update(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> searchID(@PathVariable Long id) {
        return ResponseEntity.ok(service.searchId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeID(@PathVariable Long id) {
        service.remove(id);
        return ResponseEntity.noContent().build();
    }
    
}
