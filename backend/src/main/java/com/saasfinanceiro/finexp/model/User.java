package com.saasfinanceiro.finexp.model;

import java.time.LocalDateTime;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import lombok.Data;

// "user" is a reserved word in PostgreSQL; the backticks make Hibernate quote the table name
// in whichever database is used (the table keeps the same name in MySQL).
@Entity
@Table(name = "`user`")
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

    // Profile picture as a data URL (e.g. "data:image/jpeg;base64,..."). The
    // frontend resizes it before upload, so it stays small.
    // Large text column in any database (LONGTEXT in MySQL, TEXT in PostgreSQL).
    @JdbcTypeCode(SqlTypes.LONG32VARCHAR)
    private String avatar;

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
