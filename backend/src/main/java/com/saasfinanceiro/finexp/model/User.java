package com.saasfinanceiro.finexp.model;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import lombok.AccessLevel;
import lombok.Data;
import lombok.Setter;

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

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Setter(value = AccessLevel.NONE)
    private List<UserProfile> userProfile;

    public void setUserProfile(List<UserProfile> userProfiles) {
        if (userProfiles != null) {
            for (UserProfile u : userProfiles) {
                u.setUser(this);
            }
        }
        this.userProfile = userProfiles;
    }

}
