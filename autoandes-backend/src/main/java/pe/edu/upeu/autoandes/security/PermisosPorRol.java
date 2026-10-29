package pe.edu.upeu.autoandes.security;

import java.util.Collections;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public final class PermisosPorRol {

    private static final Map<String, Set<Permiso>> MATRIZ = new HashMap<>();

    static {
        
        MATRIZ.put("ADMIN", EnumSet.allOf(Permiso.class));

        
        MATRIZ.put("ASESOR", EnumSet.of(
                Permiso.SERVICIO_LEER,
                Permiso.VEHICULO_LEER,
                Permiso.VEHICULO_ESCRIBIR,
                Permiso.ORDEN_LEER,
                Permiso.ORDEN_REGISTRAR
        ));

        
        MATRIZ.put("JEFE_TALLER", EnumSet.of(
                Permiso.SERVICIO_LEER,
                Permiso.SERVICIO_ESCRIBIR,
                Permiso.VEHICULO_LEER,
                Permiso.ORDEN_LEER,
                Permiso.ORDEN_ANULAR,
                Permiso.REPORTE_VER
        ));
    }

    private PermisosPorRol() {}

    public static Set<Permiso> obtenerPermisos(String rol) {
        if (rol == null) {
            return Collections.emptySet();
        }
        return MATRIZ.getOrDefault(rol.toUpperCase(), Collections.emptySet());
    }

    public static Set<Permiso> obtenerPermisosDeRoles(Iterable<String> roles) {
        Set<Permiso> acumulados = EnumSet.noneOf(Permiso.class);
        if (roles != null) {
            for (String r : roles) {
                acumulados.addAll(obtenerPermisos(r));
            }
        }
        return Collections.unmodifiableSet(acumulados);
    }
}
