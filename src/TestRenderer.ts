import { ListrRenderer } from 'listr';

class TestRenderer implements ListrRenderer {
  static get nonTTY() {
    return true;
  }

  nonTTY = true;

  render = () => {};

  end = () => {};
}

export { TestRenderer };
