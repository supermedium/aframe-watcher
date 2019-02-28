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

  it('syncs multi-prop update property', () => {
    const template = '<a-entity id="foo" bar="a: 1; b: 2; c: 3"></a-entity>';
    const res = updateFile('foo.html', template, {
      foo: {
        bar: {a: 4}
      }
    });
    assert.equal(res, '<a-entity id="foo" bar="a: 4; b: 2; c: 3"></a-entity>');
  });

  it('syncs multi-prop add', () => {
    const template = '<a-entity id="foo"></a-entity>';
    const res = updateFile('foo.html', template, {
      foo: {
        bar: {a: 1, b: 2, c: 3}
      }
    });
    assert.equal(res, '<a-entity id="foo" bar="a: 1; b: 2; c: 3"></a-entity>');
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

  it('ignores component that contains changed component name', () => {
    const template = `<a-entity id="foo" foobar="0 0 0" foo="1 2 3"></a-entity>`;
    const res = updateFile('foo.html', template, {
      foo: {foo: '2 3 4'}
    });
    assert.equal(res, '<a-entity id="foo" foobar="0 0 0" foo="2 3 4"></a-entity>');
  });

  it('ignores property that contains changed property name', () => {
    const template = `<a-entity id="foo" bar="quxqux: 1 2 3; qux: 1 2 3"></a-entity>`;
    const res = updateFile('foo.html', template, {
      foo: {
        bar: {
          qux: '2 3 4'
        }
      }
    });
    assert.equal(res, '<a-entity id="foo" bar="quxqux: 1 2 3; qux: 2 3 4"></a-entity>');
  });

  it('ignores attributes ending in id', () => {
    const template = `
      <a-entity data-id="foo"></a-entity>
      <a-entity id="foo"></a-entity>
    `;
    const res = updateFile('foo.html', template, {
      foo: {
        position: '1 2 3'
      }
    });
    assert.equal(res, `
      <a-entity data-id="foo"></a-entity>
      <a-entity id="foo" position="1 2 3"></a-entity>
    `);
  });

  it('syncs primitive', () => {
    const template = `<a-box id="foo" position="1 2 3"></a-box>`;
    const res = updateFile('foo.html', template, {
      foo: {position: '2 3 4'}
    });
    assert.equal(res, '<a-box id="foo" position="2 3 4"></a-box>');
  });

  it('with parent', () => {
    const template = `
      <a-entity position="0 0 0">
        <a-image></a-image>
        <a-image id="foo" position="1 2 3"></a-image>
        <a-image></a-image>
      </a-entity>
    `;
    const res = updateFile('foo.html', template, {
      foo: {position: '2 3 4'}
    });
    assert.equal(res, `
      <a-entity position="0 0 0">
        <a-image></a-image>
        <a-image id="foo" position="2 3 4"></a-image>
        <a-image></a-image>
      </a-entity>
    `);
  });
});
