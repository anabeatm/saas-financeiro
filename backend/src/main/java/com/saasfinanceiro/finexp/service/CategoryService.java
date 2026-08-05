package com.saasfinanceiro.finexp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.saasfinanceiro.finexp.dto.category.CategoryRequest;
import com.saasfinanceiro.finexp.dto.category.CategoryResponse;
import com.saasfinanceiro.finexp.exceptions.ResourceNotFoundException;
import com.saasfinanceiro.finexp.model.Category;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.enums.TransactionType;
import com.saasfinanceiro.finexp.repository.CategoryRepository;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository repository;

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public CategoryResponse create(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.name());
        category.setType(request.type());
        category.setColor(request.color());
        category.setIcon(request.icon());
        
        category.setUser(getAuthenticatedUser());

        category = repository.save(category);
        return new CategoryResponse(category);
    }

    public List<CategoryResponse> listAll(TransactionType type) {
        User user = getAuthenticatedUser();
        List<Category> categories;
        
        if (type != null) {
            categories = repository.findAllByUserAndType(user, type);
        } else {
            categories = repository.findAllByUser(user);
        }
        
        return categories.stream().map(CategoryResponse::new).collect(Collectors.toList());
    }

    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getUser().getId().equals(getAuthenticatedUser().getId())) {
            throw new AccessDeniedException("Access Denied");
        }

        category.setName(request.name());
        category.setType(request.type());
        category.setColor(request.color());
        category.setIcon(request.icon());

        category = repository.save(category);
        return new CategoryResponse(category);
    }

    public void delete(Long id) {
        Category category = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getUser().getId().equals(getAuthenticatedUser().getId())) {
            throw new AccessDeniedException("Access Denied");
        }

        repository.delete(category);
    }
}
