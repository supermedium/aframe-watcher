const assert = require('chai').assert;
const updateFile = require('../index').updateFile;

describe('sync', () => {
  it('syncs single-prop update', () => {
    const template = `<a-entity id="foo" position="1 2 3"></a-entity>`;
    const res = updateFile('foo.html', template, {
      foo: {position: '2 3 4'}
    });
    assert.equal(res, '<a-entity id="foo" position="2 3 4"></a-entity>');
  });

  it('syncs single-prop add', () => {
    const template = `<a-entity id="foo"></a-entity>`;
    const res = updateFile('foo.html', template, {
      foo: {position: '2 3 4'}
    });
    assert.equal(res, '<a-entity id="foo" position="2 3 4"></a-entity>');
  });

  it('syncs update with line break', () => {
    const template = `<a-entity\nid="foo"\nposition="1 2 3"\n>\n</a-entity>`;
    const res = updateFile('foo.html', template, {
      foo: {position: '2 3 4'}
    });
    assert.equal(res, '<a-entity\nid="foo"\nposition="2 3 4"\n>\n</a-entity>');
  });

  it('syncs update as child', () => {
    const template = `
      <a-entity id="foo">
        <a-entity id="fooBar" position="1 2 3"></a-entity>
        <a-entity id="bar"></a-entity>
      </a-entity id="foo">
    `;
    const res = updateFile('foo.html', template, {
      fooBar: {position: '2 3 4'}
    });
    assert.equal(res, `
      <a-entity id="foo">
        <a-entity id="fooBar" position="2 3 4"></a-entity>
        <a-entity id="bar"></a-entity>
      </a-entity id="foo">
    `);
  });

  it('syncs update with other properties', () => {
    const template = `<a-entity id="foo" data-foo position="1 2 3" data-bar></a-entity>`;
    const res = updateFile('foo.html', template, {
      foo: {position: '2 3 4'}
    });
    assert.equal(res, '<a-entity id="foo" data-foo position="2 3 4" data-bar></a-entity>');
  });

  it('syncs multiple compoennts', () => {
    const template = `
      <a-entity id="foo" position="1 2 3"></a-entity>
    `;
    const res = updateFile('foo.html', template, {
      foo: {position: '2 3 4', rotation: '4 5 6', scale: '7 8 9'}
    });
    assert.equal(res, `
      <a-entity id="foo" scale="7 8 9" rotation="4 5 6" position="2 3 4"></a-entity>
    `);
  });

  it('syncs multiple entities', () => {
    const template = `
      <a-entity id="foo" position="1 2 3"></a-entity>
      <a-entity id="bar" rotation="1 2 3"></a-entity>
    `;
    const res = updateFile('foo.html', template, {
      foo: {position: '2 3 4'},
      bar: {rotation: '2 3 4'}
    });
    assert.equal(res, `
      <a-entity id="foo" position="2 3 4"></a-entity>
      <a-entity id="bar" rotation="2 3 4"></a-entity>
    `);
  });
});
