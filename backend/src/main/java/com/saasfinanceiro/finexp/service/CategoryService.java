package com.saasfinanceiro.finexp.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.saasfinanceiro.finexp.dto.category.CategoryRequest;
import com.saasfinanceiro.finexp.dto.category.CategoryResponse;
import com.saasfinanceiro.finexp.exceptions.BusinessException;
import com.saasfinanceiro.finexp.exceptions.ResourceNotFoundException;
import com.saasfinanceiro.finexp.model.Category;
import com.saasfinanceiro.finexp.model.User;
import com.saasfinanceiro.finexp.model.enums.TransactionType;
import com.saasfinanceiro.finexp.repository.CategoryRepository;
import com.saasfinanceiro.finexp.repository.TransactionRepository;

@Service
public class CategoryService {

    private static final List<DefaultCategory> DEFAULT_CATEGORIES = List.of(
            new DefaultCategory("Salary", TransactionType.INCOME, "#2ECC71", "wallet"),
            new DefaultCategory("Other income", TransactionType.INCOME, "#27AE60", "piggy-bank"),
            new DefaultCategory("Food", TransactionType.EXPENSE, "#E67E22", "utensils"),
            new DefaultCategory("Transport", TransactionType.EXPENSE, "#3498DB", "bus"),
            new DefaultCategory("Housing", TransactionType.EXPENSE, "#9B59B6", "home"),
            new DefaultCategory("Health", TransactionType.EXPENSE, "#E74C3C", "heart-pulse"),
            new DefaultCategory("Leisure", TransactionType.EXPENSE, "#F1C40F", "gamepad-2"));

    private record DefaultCategory(String name, TransactionType type, String color, String icon) {
    }

    @Autowired
    private CategoryRepository repository;

    @Autowired
    private TransactionRepository transactionRepository;

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    /** Seeds the starter categories for a newly created account. */
    public void createDefaultCategories(User user) {
        List<Category> categories = DEFAULT_CATEGORIES.stream().map(d -> {
            Category category = new Category();
            category.setUser(user);
            category.setName(d.name());
            category.setType(d.type());
            category.setColor(d.color());
            category.setIcon(d.icon());
            return category;
        }).collect(Collectors.toList());

        repository.saveAll(categories);
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

        if (transactionRepository.existsByCategoryId(id)) {
            throw new BusinessException("Category has linked transactions and cannot be deleted");
        }

        repository.delete(category);
    }
}
