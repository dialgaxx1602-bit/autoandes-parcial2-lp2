package pe.edu.upeu.autoandes.mapper;

import org.springframework.stereotype.Component;
import pe.edu.upeu.autoandes.dto.response.DetalleOrdenResponseDTO;
import pe.edu.upeu.autoandes.dto.response.OrdenResponseDTO;
import pe.edu.upeu.autoandes.entity.DetalleOrden;
import pe.edu.upeu.autoandes.entity.OrdenServicio;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrdenServicioMapper {

    public DetalleOrdenResponseDTO toDetalleResponseDTO(DetalleOrden detalle) {
        if (detalle == null) return null;
        return DetalleOrdenResponseDTO.builder()
                .id(detalle.getId())
                .servicioId(detalle.getServicio() != null ? detalle.getServicio().getId() : null)
                .servicioCodigo(detalle.getServicio() != null ? detalle.getServicio().getCodigo() : null)
                .servicioNombre(detalle.getServicio() != null ? detalle.getServicio().getNombre() : null)
                .cantidad(detalle.getCantidad())
                .precioUnitario(detalle.getPrecioUnitario())
                .subtotal(detalle.getSubtotal())
                .build();
    }

    public OrdenResponseDTO toResponseDTO(OrdenServicio orden) {
        if (orden == null) return null;

        List<DetalleOrdenResponseDTO> detallesDTO = orden.getDetalles() != null
                ? orden.getDetalles().stream().map(this::toDetalleResponseDTO).collect(Collectors.toList())
                : Collections.emptyList();

        String clienteNombre = null;
        String vehiculoPlaca = null;
        Long vehiculoId = null;

        if (orden.getVehiculo() != null) {
            vehiculoId = orden.getVehiculo().getId();
            vehiculoPlaca = orden.getVehiculo().getPlaca();
            if (orden.getVehiculo().getCliente() != null) {
                clienteNombre = orden.getVehiculo().getCliente().getNombres();
            }
        }

        return OrdenResponseDTO.builder()
                .id(orden.getId())
                .numero(orden.getNumero())
                .fecha(orden.getFecha())
                .vehiculoId(vehiculoId)
                .vehiculoPlaca(vehiculoPlaca)
                .clienteNombre(clienteNombre)
                .kilometraje(orden.getKilometraje())
                .estado(orden.getEstado())
                .total(orden.getTotal())
                .usuarioRegistro(orden.getUsuarioRegistro())
                .motivoAnulacion(orden.getMotivoAnulacion())
                .detalles(detallesDTO)
                .build();
    }
}
