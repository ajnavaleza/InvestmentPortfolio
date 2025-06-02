package com.portfolio.controller;

import com.portfolio.model.Asset;
import com.portfolio.model.Portfolio;
import com.portfolio.repository.AssetRepository;
import com.portfolio.repository.PortfolioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
@Slf4j
public class AssetController {
    
    private final AssetRepository assetRepository;
    private final PortfolioRepository portfolioRepository;

    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<List<Asset>> getAssetsByPortfolio(@PathVariable Long portfolioId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("Fetching assets for portfolio {} by user {}", portfolioId, username);
        
        Optional<Portfolio> portfolio = portfolioRepository.findByIdAndUserUsername(portfolioId, username);
        if (portfolio.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Asset> assets = assetRepository.findByPortfolioId(portfolioId);
        return ResponseEntity.ok(assets);
    }

    @PostMapping("/portfolio/{portfolioId}")
    public ResponseEntity<Asset> addAssetToPortfolio(
            @PathVariable Long portfolioId,
            @RequestBody Asset asset) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("Adding asset to portfolio {} by user {}: {}", portfolioId, username, asset);
        
        Optional<Portfolio> portfolio = portfolioRepository.findByIdAndUserUsername(portfolioId, username);
        if (portfolio.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        asset.setPortfolio(portfolio.get());
        asset.setValue(asset.getCurrentPrice() * asset.getQuantity());
        Asset savedAsset = assetRepository.save(asset);
        log.debug("Successfully added asset {} to portfolio {}", savedAsset.getId(), portfolioId);
        return ResponseEntity.ok(savedAsset);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(
            @PathVariable Long id,
            @RequestBody Asset asset) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("Updating asset {} by user {}", id, username);
        
        Optional<Asset> existingAsset = assetRepository.findById(id);
        if (existingAsset.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Verify the asset belongs to the user's portfolio
        if (!existingAsset.get().getPortfolio().getUser().getUsername().equals(username)) {
            log.warn("User {} attempted to update asset {} belonging to another user", username, id);
            return ResponseEntity.notFound().build();
        }
        
        asset.setId(id);
        asset.setPortfolio(existingAsset.get().getPortfolio());
        asset.setValue(asset.getCurrentPrice() * asset.getQuantity());
        Asset savedAsset = assetRepository.save(asset);
        log.debug("Successfully updated asset {}", id);
        return ResponseEntity.ok(savedAsset);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.debug("Deleting asset {} by user {}", id, username);
        
        Optional<Asset> asset = assetRepository.findById(id);
        if (asset.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Verify the asset belongs to the user's portfolio
        if (!asset.get().getPortfolio().getUser().getUsername().equals(username)) {
            log.warn("User {} attempted to delete asset {} belonging to another user", username, id);
            return ResponseEntity.notFound().build();
        }
        
        assetRepository.deleteById(id);
        log.debug("Successfully deleted asset {}", id);
        return ResponseEntity.ok().build();
    }
} 