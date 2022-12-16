import { Marketplace } from '../Marketplace';
import { marketplace } from '../proto/marketplace';

describe('contract', () => {
  it("should return 'hello, NAME!'", () => {
    const c = new Marketplace();

    const args = new marketplace.hello_arguments('World');
    const res = c.hello(args);

    expect(res.value).toStrictEqual('Hello, World!');
  });
});
