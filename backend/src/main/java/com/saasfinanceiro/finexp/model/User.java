package com.saasfinanceiro.finexp.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name can't be null")
    @Size(min=10, message = "Enter an full name")
    private String name;
    
    @Email(message = "Email is not valid")
    private String email;

    @Size(max = 8, message = "Password need to be 8 max length")
    private String password;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "userpreferences_id", referencedColumnName = "id")
    private UserPreferences userPreferences;
}
