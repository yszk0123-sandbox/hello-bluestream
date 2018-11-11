import { pipe, read, write } from 'bluestream';
import chalk from 'chalk';

interface Response {
  items: ResponseItem[];
}

interface ResponseItem {
  id: string;
  name: string;
  color: string;
}

enum Color {
  RED = 'red',
  GREEN = 'green',
  BLUE = 'blue',
  DEFAULT = 'white'
}

interface Item {
  name: string;
  color: Color;
}

async function getSampleData(offset: number): Promise<Response> {
  if (offset >= 3) {
    return {
      items: []
    };
  }

  return {
    items: [
      { id: 'id-1', name: 'foo', color: 'red' },
      { id: 'id-2', name: 'bar', color: 'green' },
      { id: 'id-3', name: 'baz', color: 'blue' }
    ]
  };
}

function toColor(color: string): Color {
  switch (color) {
    case Color.RED:
    case Color.GREEN:
    case Color.BLUE:
      return color;
    default:
      return Color.DEFAULT;
  }
}

const input$ = read(async function(this: any) {
  this.offset = this.offset || 0;

  const { items } = await getSampleData(this.offset);
  if (!items) {
    return null;
  }

  this.offset += items.length;
  items.forEach(({ name, color }) => {
    this.push({ name, color: toColor(color) });
  });
});

const output$ = write(({ name, color }: Item) => {
  console.log(chalk[color](name));
});

pipe(
  input$,
  output$
)
  .then(console.log)
  .catch(console.error);
