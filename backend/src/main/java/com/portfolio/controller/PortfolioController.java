package com.portfolio.controller;

import com.portfolio.model.Portfolio;
import com.portfolio.model.User;
import com.portfolio.repository.PortfolioRepository;
import com.portfolio.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.List;

@RestController
@RequestMapping("/api/portfolios")
@RequiredArgsConstructor
@Slf4j
public class PortfolioController {
    
    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Portfolio>> getAllPortfolios() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("Fetching all portfolios for user: {}", username);
        List<Portfolio> portfolios = portfolioRepository.findByUserUsername(username);
        return ResponseEntity.ok(portfolios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Portfolio> getPortfolioById(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("Fetching portfolio {} for user: {}", id, username);
        return portfolioRepository.findByIdAndUserUsername(id, username)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Portfolio> createPortfolio(@RequestBody Portfolio portfolio) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("Creating portfolio for user: {}", username);
        return userRepository.findByUsername(username)
            .map(user -> {
                portfolio.setUser(user);
                Portfolio savedPortfolio = portfolioRepository.save(portfolio);
                log.debug("Created portfolio with ID: {} for user: {}", savedPortfolio.getId(), username);
                return ResponseEntity.ok(savedPortfolio);
            })
            .orElse(ResponseEntity.badRequest().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Portfolio> updatePortfolio(@PathVariable Long id, @RequestBody Portfolio portfolio) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("Updating portfolio {} for user: {}", id, username);
        if (!portfolioRepository.existsByIdAndUserUsername(id, username)) {
            return ResponseEntity.notFound().build();
        }
        portfolio.setId(id);
        return ResponseEntity.ok(portfolioRepository.save(portfolio));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePortfolio(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("Deleting portfolio {} for user: {}", id, username);
        if (!portfolioRepository.existsByIdAndUserUsername(id, username)) {
            return ResponseEntity.notFound().build();
        }
        portfolioRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
} 