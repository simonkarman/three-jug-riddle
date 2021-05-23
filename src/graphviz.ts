import { execSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { Digraph, toDot } from 'ts-graphviz';

export class Graphviz {
  private install() {
    switch (process.platform) {
      case 'darwin':
        execSync('sudo brew update');
        execSync('sudo brew install graphviz');
        break;
      case 'linux':
        execSync('sudo apt-get update');
        execSync('sudo apt-get install graphviz -y');
        break;
      case 'win32':
        execSync('choco install graphviz');
        break;
      default:
        throw new Error(`platform '${process.platform}' is not yet supported`);
    }
  }

  public visualize(graph: Digraph, name: string, outputTypes: ('svg' | 'png' | 'pdf')[] = ['svg']) {
    // Install graphviz
    // this.install();

    mkdirSync('output', { recursive: true });
    const path = `output/${name}`;

    // Create dot
    const dot = toDot(graph);
    writeFileSync(`${path}.dot`, dot);

    // Visualize as svg
    outputTypes.forEach(outputType => execSync(`dot -T${outputType} ${path}.dot -o ${path}.${outputType}`));
  }
}