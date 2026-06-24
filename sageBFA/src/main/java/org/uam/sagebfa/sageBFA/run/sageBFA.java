package org.uam.sagebfa.sageBFA.run;

import org.openxava.util.*;

/**
 * Execute this class to start the application.
 *
 * With OpenXava Studio/Eclipse: Right mouse button > Run As > Java Application
 */

public class sageBFA {

	public static void main(String[] args) throws Exception {
		// DBServer.start("sageBFA-db"); // Deshabilitado: usando PostgreSQL externo
		AppServer.run("sageBFA"); // Use AppServer.run("") to run in root context
	}

}
