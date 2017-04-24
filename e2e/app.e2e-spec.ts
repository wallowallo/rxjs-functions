import { RxjsFunctionsPage } from './app.po';

describe('rxjs-functions App', () => {
  let page: RxjsFunctionsPage;

  beforeEach(() => {
    page = new RxjsFunctionsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
