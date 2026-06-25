package org.uam.sagebfa.sageBFA.actions;

import org.openxava.actions.*;

public class GenerarReporteClinicoAction extends ViewBaseAction implements IForwardAction {

    private String forwardURI;

    @Override
    public void execute() throws Exception {
        Object idObj = getView().getValue("id");
        if (idObj == null) {
            addError("No se ha seleccionado ningún candidato.");
            return;
        }

        String idStr = idObj.toString();
        // Redirigir al servlet que genera el reporte con el ID del candidato
        this.forwardURI = "/api/test-numerico/reporte?id=" + idStr;
    }

    @Override
    public String getForwardURI() {
        return this.forwardURI;
    }

    @Override
    public boolean inNewWindow() {
        return true;
    }
}
