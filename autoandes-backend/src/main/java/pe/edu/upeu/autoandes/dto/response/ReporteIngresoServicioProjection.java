package pe.edu.upeu.autoandes.dto.response;

import java.math.BigDecimal;

public interface ReporteIngresoServicioProjection {
    String getCodigo();
    String getServicio();
    Long getCantidadTotal();
    BigDecimal getImporteTotal();
}
