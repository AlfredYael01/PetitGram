import React from 'react';
import renderer from 'react-test-renderer';
import App from './App';
import TestRenderer from 'react-test-renderer';

describe('<App />', () => {
  it('has 2 children', () => {
    let component;
    TestRenderer.act(() => {
      component = TestRenderer.create(<App />);
    });
    const tree = component.toJSON();
    expect(tree.children.length).toBe(2);
  }
  );
});