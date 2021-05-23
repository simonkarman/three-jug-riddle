import { Graphviz } from "./graphviz";
import { attribute, Attributes, digraph, Digraph, INode } from 'ts-graphviz';
import { isEmpty } from 'lodash';

const maxA = 12;
const maxB = 8;
const maxC = 5;

class Configuration {
  private readonly node: INode;

  private constructor(
    private readonly graph: Digraph,
    private readonly a: number,
    private readonly b: number,
    private readonly c: number,
  ) {
    const error: string[] = [];
    const checkError = (value: number, max: number, name: string) => {
      if (value < 0 || value > max) {
        error.push(`A value of '${value.toString()} is invalid for ${name} [0-${max}].`);
      }
    }
    checkError(a, maxA, 'a');
    checkError(b, maxB, 'b');
    checkError(c, maxC, 'c');

    let color = 'black';
    if (a === 12) {
      color = 'blue';
    } else if (this.getId().includes('6')) {
      color = 'red';
    }
    this.node = graph.createNode(this.getId(), { [attribute.color]: color});
  }

  public static initial(graph: Digraph): Configuration {
    return new Configuration(graph, 12, 0, 0);
  }

  public getId(): string {
    return `${this.a} ${this.b} ${this.c}`;
  }

  public getNode(): INode {
    return this.node;
  }

  getChildren(): Configuration[] {
    const fromBuckets: ('a' | 'b' | 'c')[] = [];
    if (this.a > 0) fromBuckets.push('a');
    if (this.b > 0) fromBuckets.push('b');
    if (this.c > 0) fromBuckets.push('c');

    const toBuckets: { index: 'a' | 'b' | 'c', max: number }[] = [];
    if (this.a < maxA) toBuckets.push({ index: 'a', max: maxA });
    if (this.b < maxB) toBuckets.push({ index: 'b', max: maxB });
    if (this.c < maxC) toBuckets.push({ index: 'c', max: maxC });

    const children: Configuration[] = [];
    for (const fromBucket of fromBuckets) {
      for (const toBucket of toBuckets) {
        if (fromBucket === toBucket.index) {
          continue;
        }
        const amount = Math.min(this[fromBucket], toBucket.max - this[toBucket.index]);
        const conf = {
          a: this.a,
          b: this.b,
          c: this.c,
        };
        conf[fromBucket] -= amount;
        conf[toBucket.index] += amount;
        children.push(new Configuration(this.graph, conf.a, conf.b, conf.c));
      }
    }
    return children;
  }
}

const graph = digraph('G', { [attribute.layout]: 'dot' });
const visited: { [key: string]: Configuration } = {};
const open: { [key: string]: Configuration | undefined } = { '12 0 0': Configuration.initial(graph) };

while (!isEmpty(open)) {
  const currentId = Object.keys(open)[0];
  console.info(`Visiting ${currentId}`);
  const current = open[currentId];
  visited[currentId] = current
  delete open[currentId];

  const children = current.getChildren();
  for (const child of children) {
    const childId = child.getId();
    console.info(` - ${childId}`);
    if (visited[childId]) {
      graph.createEdge([current.getNode(), visited[childId].getNode()]);
    } else {
      if (open[childId] === undefined) {
        open[childId] = child;
      }
      graph.createEdge([current.getNode(), open[childId].getNode()]);
    }
  }
}

new Graphviz().visualize(graph, 'solution', ['svg', 'png', 'pdf']);