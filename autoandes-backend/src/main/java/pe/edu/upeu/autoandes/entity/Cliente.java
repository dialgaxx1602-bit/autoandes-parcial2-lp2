package pe.edu.upeu.autoandes.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cliente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 11)
    private String documento;

    @Column(nullable = false, length = 120)
    private String nombres;

    @Column(length = 15)
    private String telefono;
}
