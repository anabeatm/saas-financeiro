package com.saasfinanceiro.finexp.model;

import java.time.LocalDateTime;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.Data;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "{user.name.notblank}")
    @Size(min=2, max=100, message = "{user.name.size}")
    private String name;
    
    @NotBlank(message = "{user.email.notblank}")
    @Email(message = "{user.email.invalid}")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "{user.password.notblank}")
    @Size(min = 8,max=100, message = "{user.password.size}")
    private String password;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private UserPreferences userPreferences;

    @Column(nullable = false)
    private boolean enabled = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
