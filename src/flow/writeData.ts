import { AST } from '../entities/ast';
import { fileUtils } from '../utils/file';
import { FileDataSource, VariableDataSource } from '../entities/dataSource';

export function writeData(data: object[], ast: AST) {
  if (ast.into) {
    if (ast.into instanceof VariableDataSource) {
      ast.assignVariable(ast.into.variableName, data);
    } else if (ast.into instanceof FileDataSource) {
      fileUtils.writeJson(ast.into.filePath, data);
    }
  }
  return data;
}
  