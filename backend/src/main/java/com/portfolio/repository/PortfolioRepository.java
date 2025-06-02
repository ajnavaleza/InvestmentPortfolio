package com.portfolio.repository;

import com.portfolio.model.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findByUserUsername(String username);
    Optional<Portfolio> findByIdAndUserUsername(Long id, String username);
    boolean existsByIdAndUserUsername(Long id, String username);
} 