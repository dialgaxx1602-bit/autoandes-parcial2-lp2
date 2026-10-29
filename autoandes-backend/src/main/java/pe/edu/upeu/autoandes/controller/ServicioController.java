package pe.edu.upeu.autoandes.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.upeu.autoandes.dto.request.ServicioRequestDTO;
import pe.edu.upeu.autoandes.dto.response.ServicioResponseDTO;
import pe.edu.upeu.autoandes.service.ServicioService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/servicios")
@RequiredArgsConstructor
@Tag(name = "Servicios", description = "Endpoints para CRUD y administración de servicios mecánicos")
public class ServicioController {

    private final ServicioService servicioService;

    @GetMapping
    @Operation(summary = "Listar catálogo de servicios")
    public ResponseEntity<List<ServicioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(servicioService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar servicio por ID")
    public ResponseEntity<ServicioResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servicioService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Registrar un nuevo servicio")
    public ResponseEntity<ServicioResponseDTO> crear(@Valid @RequestBody ServicioRequestDTO request) {
        ServicioResponseDTO creado = servicioService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar servicio existente")
    public ResponseEntity<ServicioResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ServicioRequestDTO request) {
        return ResponseEntity.ok(servicioService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar físicamente un servicio si no tiene órdenes asociadas")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado (activo/inactivo) para dar de baja o reactivar un servicio")
    public ResponseEntity<ServicioResponseDTO> cambiarEstado(@PathVariable Long id) {
        return ResponseEntity.ok(servicioService.cambiarEstado(id));
    }
}
