import { AST } from './ast';
import { fileUtils } from '@utils';
import { FileDataSource, VariableDataSource } from '@entities';

export function write(data: object[], ast: AST) {
  if (ast.into) {
    if (ast.into instanceof VariableDataSource) {
      ast.assignVariable(ast.into.variableName, data);
    } else if (ast.into instanceof FileDataSource) {
      fileUtils.writeJson(ast.into.filePath, data);
    }
  }
  return data;
}
  