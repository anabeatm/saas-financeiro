package com.saasfinanceiro.finexp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository repository;

    public User insert(User user) {
        return repository.save(user);
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

    public User uprdate(User user) {
        User sectionUser = searchId(user.getId());
        sectionUser.setName(user.getName());
        sectionUser.setEmail(user.getEmail());
        return repository.save(sectionUser);
    }
}
