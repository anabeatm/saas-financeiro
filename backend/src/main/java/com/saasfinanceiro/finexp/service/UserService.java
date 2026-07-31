package com.saasfinanceiro.finexp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;

import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository repository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;

    public User insert(User user) {
        if (repository.existsByEmail(user.getEmail())) {
            throw new DataIntegrityViolationException("This e-mail is already registered");
        }

        String criptoPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(criptoPassword);
        User userDatabase = repository.save(user);

        // emailService.sendEmail(user.getEmail(), "Sucess!", "User successfully registered!");
        Context context = new Context();
        context.setVariable("name", user.getName());
        context.setVariable("link", "http://localhost:5173/login");
        emailService.sendEmailTemplate(user.getEmail(), "Sucess", "newUser", context);        
        
        return userDatabase;
    }

    public List<User> listAll() {
        return repository.findAll();
    }

    public User searchId(Long id) {
        User user = repository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return user;
    }

    public void remove(Long id) {
        User user = searchId(id);
        repository.delete(user);
    }

    public User update(User user) {
        User sectionUser = searchId(user.getId());
        sectionUser.setName(user.getName());
        sectionUser.setEmail(user.getEmail());
        return repository.save(sectionUser);
    }
}
