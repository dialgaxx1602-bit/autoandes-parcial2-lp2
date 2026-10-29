package pe.edu.upeu.autoandes.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.autoandes.dto.request.VehiculoRequestDTO;
import pe.edu.upeu.autoandes.dto.response.VehiculoResponseDTO;
import pe.edu.upeu.autoandes.service.VehiculoService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vehiculos")
@RequiredArgsConstructor
@Tag(name = "Vehículos", description = "Endpoints para CRUD y administración de vehículos")
public class VehiculoController {

    private final VehiculoService vehiculoService;

    @GetMapping
    @Operation(summary = "Listar vehículos con filtro opcional por clienteId")
    public ResponseEntity<List<VehiculoResponseDTO>> listar(
            @RequestParam(required = false) Long clienteId) {
        return ResponseEntity.ok(vehiculoService.listar(clienteId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar vehículo por ID")
    public ResponseEntity<VehiculoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(vehiculoService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Registrar un nuevo vehículo")
    public ResponseEntity<VehiculoResponseDTO> crear(@Valid @RequestBody VehiculoRequestDTO request) {
        VehiculoResponseDTO creado = vehiculoService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos de un vehículo")
    public ResponseEntity<VehiculoResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody VehiculoRequestDTO request) {
        return ResponseEntity.ok(vehiculoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un vehículo si no tiene órdenes de servicio asociadas")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        vehiculoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
