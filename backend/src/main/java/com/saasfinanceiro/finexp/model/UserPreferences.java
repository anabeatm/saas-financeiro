package com.saasfinanceiro.finexp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.saasfinanceiro.finexp.model.enums.Currency;

import lombok.Data;

@Entity
@Data
public class UserPreferences {
    @Id
    private Long id;

    private String avatarURL;

    @Size(min=11, message = "Phone number in Profile need to be 11 min length")
    private String phoneNumber;

    @NotNull(message = "Currency in Profile can't be null")
    @Enumerated(EnumType.STRING)
    private Currency currencyPreference;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
}
