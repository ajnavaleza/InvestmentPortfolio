package com.portfolio.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@Schema(description = "Portfolio entity")
public class Portfolio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Portfolio ID", example = "")
    private Long id;
    
    @Schema(description = "Total value of the portfolio", example = "0.0")
    private Double totalValue;

    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL)
    @JsonManagedReference
    @Schema(description = "List of assets in the portfolio")
    private List<Asset> assets;

    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL)
    @JsonManagedReference
    @Schema(description = "Performance metrics of the portfolio")
    private List<PerformanceMetric> performance;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    @Schema(description = "Owner of the portfolio")
    private User user;
} 