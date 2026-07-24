const { Project, SyntaxKind } = require("ts-morph");

async function main() {
  const project = new Project({
    tsConfigFilePath: "./tsconfig.json",
  });

  const sourceFiles = project.getSourceFiles("app/actions/*.ts");

  for (const sourceFile of sourceFiles) {
    // Skip auth.ts or anything we don't want to touch
    if (sourceFile.getBaseName() === "auth.ts") continue;

    // Add GlobalErrorService import if it doesn't exist
    const imports = sourceFile.getImportDeclarations();
    const hasGlobalError = imports.some(imp => 
      imp.getModuleSpecifierValue() === "@/lib/core/errors/global-error.service"
    );

    if (!hasGlobalError) {
      sourceFile.addImportDeclaration({
        namedImports: ["GlobalErrorService"],
        moduleSpecifier: "@/lib/core/errors/global-error.service",
      });
    }

    const functions = sourceFile.getFunctions();
    
    for (const func of functions) {
      if (!func.isExported()) continue;

      const funcName = func.getName();
      const body = func.getBody();
      
      if (!body) continue;

      // Find TryStatements
      const tryStatements = body.getDescendantsOfKind(SyntaxKind.TryStatement);
      
      for (const tryStmt of tryStatements) {
        const catchClause = tryStmt.getCatchClause();
        if (catchClause) {
          const block = catchClause.getBlock();
          // Replace the catch block contents with GlobalErrorService
          // We will preserve the original return type signature by returning it
          const varName = catchClause.getVariableDeclaration()?.getName() || "error";
          
          block.replaceWithText(`{
  console.error("Error in ${funcName}:", ${varName});
  return GlobalErrorService.handleError(${varName}, "Action:${funcName}");
}`);
        }
      }
    }
    
    // Save file
    await sourceFile.save();
    console.log(`Updated ${sourceFile.getBaseName()}`);
  }
}

main().catch(console.error);
